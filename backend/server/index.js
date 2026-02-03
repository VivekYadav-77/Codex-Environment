import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { exec } from 'child_process'

// Load environment variables
config()

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3000

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// System prompts for AI endpoints
const HINT_SYSTEM_PROMPT = `You are a Socratic teaching assistant for a Data Structures and Algorithms learning platform called Code-Odyssey. Your role is to help students learn by guiding them to discover solutions on their own.

CRITICAL RULES - YOU MUST FOLLOW THESE EXACTLY:
1. NEVER provide the actual solution code under any circumstances
2. NEVER give step-by-step implementation details
3. NEVER write pseudocode that could be directly converted to a solution
4. If a student asks for the solution directly, politely refuse and redirect them to think about the problem

YOUR APPROACH:
- Ask thought-provoking questions that lead students toward the solution
- Point out relevant concepts, data structures, or algorithms they should consider
- Give hints about the general approach without revealing specifics
- Use analogies and real-world examples to explain concepts
- Encourage students when they're on the right track
- If they're stuck, break down the problem into smaller sub-problems

RESPONSE FORMAT:
- Keep responses concise (2-4 sentences max)
- Use encouraging emojis sparingly (🤔, 💡, 🎯, 📝, 🔍)
- Focus on ONE hint at a time to avoid overwhelming the student

Remember: Your goal is to help students LEARN, not to solve problems for them. A student who discovers the solution themselves will learn far more than one who is given the answer.`

const CODE_REVIEW_SYSTEM_PROMPT = `You are a strict, concise code reviewer for Code-Odyssey DSA platform.

**OUTPUT FORMAT:**

## [✅ PASS | ⚠️ NEEDS WORK] - [One-line summary]

### 💪 Strengths
- [Max 2 points, 8 words each]

### 🔧 Fix This (skip if PASS)
- [What's wrong - max 15 words per issue]

### ⏱️ Complexity
**Time:** O(?) | **Space:** O(?)

### 💡 Pro Tip
[One sentence, max 20 words]

---

**STRICT RULES:**
- Total response: MAX 100 words
- No lengthy explanations
- No code examples
- Skip "Fix This" section if code passes
- Be direct: "Your loop is O(n²)" not "The way you've structured your loop..."
- Use technical terms: "memoization", "two-pointer", not wordy descriptions`

// Security middleware
app.use(helmet())
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}))
app.use(express.json())

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: { error: 'Too many requests, please try again later.' }
})

// Load JSON data
const loadData = (filename) => {
    const filepath = join(__dirname, 'data', filename)
    if (existsSync(filepath)) {
        return JSON.parse(readFileSync(filepath, 'utf-8'))
    }
    return null
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ============ ALGORITHMS API ============

app.get('/api/algorithms', (req, res) => {
    const algorithms = loadData('algorithms.json')
    if (!algorithms) {
        return res.status(500).json({ error: 'Failed to load algorithms' })
    }
    res.json(algorithms)
})

app.get('/api/algorithms/:category', (req, res) => {
    const { category } = req.params
    const algorithms = loadData('algorithms.json')
    if (!algorithms) {
        return res.status(500).json({ error: 'Failed to load algorithms' })
    }
    const categoryAlgorithms = algorithms.filter(a => a.category === category)
    res.json(categoryAlgorithms)
})

app.get('/api/algorithms/:category/:id', (req, res) => {
    const { category, id } = req.params
    const algorithms = loadData('algorithms.json')
    if (!algorithms) {
        return res.status(500).json({ error: 'Failed to load algorithms' })
    }
    const algorithm = algorithms.find(a => a.category === category && a.id === id)
    if (!algorithm) {
        return res.status(404).json({ error: 'Algorithm not found' })
    }
    res.json(algorithm)
})

// ============ TUTORIALS API ============

app.get('/api/tutorials', (req, res) => {
    const tutorials = loadData('tutorials.json')
    if (!tutorials) {
        return res.status(500).json({ error: 'Failed to load tutorials' })
    }
    res.json(tutorials)
})

app.get('/api/tutorials/:id', (req, res) => {
    const { id } = req.params
    const tutorials = loadData('tutorials.json')
    if (!tutorials) {
        return res.status(500).json({ error: 'Failed to load tutorials' })
    }
    const tutorial = tutorials.find(t => t.id === id)
    if (!tutorial) {
        return res.status(404).json({ error: 'Tutorial not found' })
    }
    res.json(tutorial)
})

// ============ QUESTIONS API ============

app.get('/api/questions', (req, res) => {
    const questions = loadData('questions.json')
    if (!questions) {
        return res.status(500).json({ error: 'Failed to load questions' })
    }
    res.json(questions)
})

app.get('/api/questions/:topic', (req, res) => {
    const { topic } = req.params
    const questions = loadData('questions.json')
    if (!questions) {
        return res.status(500).json({ error: 'Failed to load questions' })
    }
    const topicQuestions = questions.filter(q => q.topic === topic)
    res.json(topicQuestions)
})

// ============ CODE EXECUTION API ============

// Rate limiter for code execution (stricter)
const executionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 executions per minute
    message: { error: 'Too many execution requests, please wait.' }
})

// Execute code endpoint
app.post('/api/run', executionLimiter, async (req, res) => {
    const { code, language, testInput } = req.body

    if (!code) {
        return res.status(400).json({ error: 'Code is required' })
    }

    const supportedLanguages = ['javascript', 'python', 'java', 'cpp']
    const lang = language || 'javascript'

    if (!supportedLanguages.includes(lang)) {
        return res.status(400).json({ error: `Language ${lang} not supported. Use: ${supportedLanguages.join(', ')}` })
    }

    // Create temp file with appropriate extension
    const timestamp = Date.now()
    const extensions = { javascript: 'js', python: 'py', java: 'java', cpp: 'cpp' }
    const ext = extensions[lang]

    // For Java, extract the class name from the code (look for "class ClassName")
    let fileName = `temp_${timestamp}`
    if (lang === 'java') {
        // Match "class ClassName" or "public class ClassName"
        const classMatch = code.match(/(?:public\s+)?class\s+(\w+)/)
        if (classMatch && classMatch[1]) {
            fileName = classMatch[1]
        } else {
            return res.status(400).json({ error: 'Java code must contain a class definition (e.g., "class Main" or "public class Solution")' })
        }
    }
    const tempFile = join(__dirname, `${fileName}.${ext}`)

    try {
        // Prepare code
        let executableCode = code

        // Write code to temp file
        writeFileSync(tempFile, executableCode, 'utf-8')

        // Determine command based on language
        let command
        let cleanupFiles = [tempFile]

        switch (lang) {
            case 'javascript':
                command = `node "${tempFile}"`
                break
            case 'python':
                command = `python "${tempFile}"`
                break
            case 'java':
                // Compile then run Java with correct classpath
                const classFile = join(__dirname, `${fileName}.class`)
                cleanupFiles.push(classFile)
                command = `javac "${tempFile}" && java -cp "${__dirname}" ${fileName}`
                break
            case 'cpp':
                // Compile then run C++
                const exeFile = join(__dirname, `${fileName}.exe`)
                cleanupFiles.push(exeFile)
                command = `g++ "${tempFile}" -o "${exeFile}" && "${exeFile}"`
                break
        }

        // Execute with timeout (5 seconds max)
        exec(command, { timeout: 5000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            // Clean up all temp files
            cleanupFiles.forEach(f => { try { unlinkSync(f) } catch (e) { /* ignore */ } })

            if (error) {
                // Check if it's a timeout
                if (error.killed) {
                    return res.json({
                        success: false,
                        output: '',
                        error: '⏱️ Execution timed out (5s limit). Check for infinite loops.',
                        executionTime: '> 5000ms'
                    })
                }
                return res.json({
                    success: false,
                    output: stdout || '',
                    error: stderr || error.message,
                    executionTime: 'N/A'
                })
            }

            res.json({
                success: true,
                output: stdout,
                error: stderr || null,
                executionTime: '< 5000ms'
            })
        })
    } catch (err) {
        // Clean up on error
        try { unlinkSync(tempFile) } catch (e) { /* ignore */ }
        res.status(500).json({
            error: 'Failed to execute code',
            details: err.message
        })
    }
})

// ============ AI API (Rate Limited) ============

// Socratic AI Hint System
app.post('/api/ai/hint', aiLimiter, async (req, res) => {
    const { code, question, previousHints } = req.body

    if (!code || !question) {
        return res.status(400).json({ error: 'Code and question are required' })
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        return res.status(500).json({
            error: 'AI features not configured. Please set GEMINI_API_KEY in server/.env file.'
        })
    }

    try {
        // Use systemInstruction like working project
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: HINT_SYSTEM_PROMPT
        })

        console.log('Generating hint for:', question.title || 'Unknown question')

        // Build context from previous hints (they come as objects with id and content)
        const hintTexts = previousHints && previousHints.length > 0
            ? previousHints.map(h => typeof h === 'string' ? h : h.content)
            : []
        const previousHintsContext = hintTexts.length > 0
            ? `\n\nPrevious hints given:\n${hintTexts.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\nProvide a NEW, different hint that builds on these.`
            : ''

        const userMessage = `PROBLEM:
${question.title || 'Coding Problem'}
${question.description}

STUDENT'S CURRENT CODE:
\`\`\`
${code}
\`\`\`
${previousHintsContext}

Please provide a Socratic hint to guide the student.`

        const result = await model.generateContent(userMessage)
        const response = await result.response
        const hint = response.text()

        console.log('Hint generated successfully')

        res.json({
            hint,
            hintsRemaining: 5 - (previousHints?.length || 0) - 1
        })
    } catch (error) {
        console.error('Gemini AI Hint Error:', error)
        res.status(500).json({
            error: 'Failed to generate hint. Please try again.',
            details: error.message
        })
    }
})

// AI Code Review
app.post('/api/ai/review', aiLimiter, async (req, res) => {
    const { code, question, language } = req.body

    if (!code || !question) {
        return res.status(400).json({ error: 'Code and question are required' })
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        return res.status(500).json({
            error: 'AI features not configured. Please set GEMINI_API_KEY in server/.env file.'
        })
    }

    try {
        // Use systemInstruction like working project
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: CODE_REVIEW_SYSTEM_PROMPT
        })

        console.log('Reviewing code for:', question.title || 'Unknown question', '| Language:', language || 'javascript')

        const userMessage = `PROBLEM:
${question.title || 'Coding Problem'}
${question.description}

${question.examples ? `EXAMPLES:\n${question.examples.map(e => `Input: ${e.input}\nOutput: ${e.output}`).join('\n\n')}` : ''}

PROGRAMMING LANGUAGE: ${language || 'JavaScript'}

STUDENT'S SUBMITTED CODE:
\`\`\`${language || 'javascript'}
${code}
\`\`\`

Please review this code submission and provide your feedback.`

        const result = await model.generateContent(userMessage)
        const response = await result.response
        const reviewText = response.text()
        console.log('Review generated successfully')

        // Return the raw text response from Gemini
        res.json({
            reviewText: reviewText
        })
    } catch (error) {
        console.error('Gemini AI Review Error:', error)
        res.status(500).json({
            error: 'Failed to review code. Please try again.',
            details: error.message
        })
    }
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' })
})

app.listen(PORT, () => {
    console.log(`🚀 Codex Environment API running on http://localhost:${PORT}`)
})
