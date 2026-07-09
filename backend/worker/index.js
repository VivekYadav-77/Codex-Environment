import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { execFile } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { valuesEqual } from './compare.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

const TIMEOUT_MS = 5000;
const MAX_BUFFER = 1024 * 1024;

const runProcess = (command, args) => new Promise((resolve) => {
    const startedAt = Date.now();
    execFile(command, args, { timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER }, (error, stdout, stderr) => {
        const runtimeMs = Date.now() - startedAt;
        if (error) {
            const timedOut = error.killed || error.signal === 'SIGTERM';
            return resolve({
                ok: false,
                status: timedOut ? 'time_limit_exceeded' : 'runtime_error',
                error: stderr || error.message,
                runtimeMs,
            });
        }
        resolve({ ok: true, stdout, stderr, runtimeMs });
    });
});

const buildJavascriptRunner = ({ code, functionName, testCases }) => `
${code}

const __tests = ${JSON.stringify(testCases)};
const __fn = typeof ${functionName} !== "undefined" ? ${functionName} : globalThis["${functionName}"];
if (typeof __fn !== "function") {
  throw new Error("Function ${functionName} was not defined");
}

const __results = [];
for (const test of __tests) {
  try {
    const args = Array.isArray(test.input) ? test.input : [test.input];
    const actual = __fn(...args);
    __results.push({ name: test.name, actual });
  } catch (error) {
    __results.push({ name: test.name, error: error.message || String(error) });
  }
}
console.log(JSON.stringify(__results));
`;

const buildPythonRunner = ({ code, functionName, testCases }) => `
import json

${code}

__tests = json.loads(${JSON.stringify(JSON.stringify(testCases))})
__fn = globals().get("${functionName}")
if not callable(__fn):
    raise Exception("Function ${functionName} was not defined")

__results = []
for test in __tests:
    try:
        args = test.get("input")
        if not isinstance(args, list):
            args = [args]
        actual = __fn(*args)
        __results.append({"name": test.get("name"), "actual": actual})
    except Exception as error:
        __results.append({"name": test.get("name"), "error": str(error)})

print(json.dumps(__results))
`;

const commandForLanguage = (language) => {
    if (language === 'javascript') return { command: 'node', extension: 'js' };
    if (language === 'python') return { command: 'python3', extension: 'py' };
    return null;
};

async function processSubmission(job) {
    const { code, language, question } = job.data;
    const runtime = commandForLanguage(language);
    
    if (!runtime) {
        return {
            status: 'compile_error',
            passedCount: 0,
            totalCount: question.testCases?.length || 0,
            runtimeMs: 0,
            testResults: [],
            error: \`Language \${language} is not supported\`,
        };
    }

    if (!question.functionName || !question.testCases?.length) {
        return {
            status: 'compile_error',
            passedCount: 0,
            totalCount: 0,
            runtimeMs: 0,
            testResults: [],
            error: 'This question is not judge-enabled yet',
        };
    }

    const tempDir = mkdtempSync(join(os.tmpdir(), 'codex-judge-'));
    const testCases = question.testCases.map((test) => ({
        name: test.name,
        input: test.input,
        expected: test.expected,
        visible: test.visible,
        category: test.category,
        compareMode: test.compareMode || 'exact',
    }));

    const runner = language === 'javascript'
        ? buildJavascriptRunner({ code, functionName: question.functionName, testCases })
        : buildPythonRunner({ code, functionName: question.functionName, testCases });

    const filePath = join(tempDir, \`submission.\${runtime.extension}\`);
    writeFileSync(filePath, runner, 'utf-8');

    try {
        const processResult = await runProcess(runtime.command, [filePath]);

        if (!processResult.ok) {
            return {
                status: processResult.status,
                passedCount: 0,
                totalCount: testCases.length,
                runtimeMs: processResult.runtimeMs,
                testResults: testCases.map((test) => ({
                    name: test.name,
                    passed: false,
                    visible: test.visible,
                    category: test.category,
                    ...(test.visible ? { input: test.input, expected: test.expected, error: processResult.error } : { error: 'Hidden test failed' }),
                })),
            };
        }

        let rawResults;
        try {
            rawResults = JSON.parse(processResult.stdout);
        } catch (error) {
            return {
                status: 'runtime_error',
                passedCount: 0,
                totalCount: testCases.length,
                runtimeMs: processResult.runtimeMs,
                testResults: testCases.map((test) => ({
                    name: test.name,
                    passed: false,
                    visible: test.visible,
                    category: test.category,
                    ...(test.visible ? { input: test.input, expected: test.expected, error: 'Submission did not return valid judge output' } : { error: 'Hidden test failed' }),
                })),
            };
        }

        const testResults = testCases.map((test, index) => {
            const raw = rawResults[index] || {};
            const passed = !raw.error && valuesEqual(raw.actual, test.expected, test.compareMode);

            return {
                name: test.name,
                passed,
                visible: test.visible,
                category: test.category,
                ...(test.visible
                    ? { input: test.input, expected: test.expected, actual: raw.actual, error: raw.error }
                    : { error: passed ? undefined : 'Hidden test failed' }),
            };
        });

        const passedCount = testResults.filter((result) => result.passed).length;

        return {
            status: passedCount === testCases.length ? 'accepted' : 'wrong_answer',
            passedCount,
            totalCount: testCases.length,
            runtimeMs: processResult.runtimeMs,
            testResults,
        };
    } finally {
        rmSync(tempDir, { recursive: true, force: true });
    }
}

const worker = new Worker('executionQueue', async job => {
    console.log(\`Processing job \${job.id} for language \${job.data.language}\`);
    return await processSubmission(job);
}, { connection });

worker.on('completed', job => {
    console.log(\`Job \${job.id} has completed!\`);
});

worker.on('failed', (job, err) => {
    console.log(\`Job \${job.id} has failed with \${err.message}\`);
});

console.log('Execution Worker is running and waiting for jobs...');
