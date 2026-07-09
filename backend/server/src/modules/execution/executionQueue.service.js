import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { ExecutionJob } from './executionJob.model.js';
import { env } from '../../config/env.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

export const executionQueue = new Queue('executionQueue', { connection });
const queueEvents = new QueueEvents('executionQueue', { connection });

export async function runExecutionJob({ userId, question, language, code }) {
    const jobRecord = await ExecutionJob.create({
        userId,
        questionId: question._id,
        language,
        status: 'queued',
    });

    try {
        const job = await executionQueue.add('executeSubmission', {
            code,
            language,
            question
        }, {
            jobId: jobRecord._id.toString()
        });

        jobRecord.status = 'running';
        await jobRecord.save();

        // Wait for the job to complete
        const result = await job.waitUntilFinished(queueEvents);

        jobRecord.status = result.status === 'time_limit_exceeded' ? 'timed_out' : 'completed';
        jobRecord.runtimeMs = result.runtimeMs || 0;
        jobRecord.error = result.error;
        jobRecord.stderr = result.error;
        jobRecord.logs = result.error || `Execution finished with ${result.status}`;
        jobRecord.result = result;
        await jobRecord.save();

        return { job: jobRecord, result };
    } catch (error) {
        jobRecord.status = 'failed';
        jobRecord.logs = error.message;
        await jobRecord.save();
        throw error;
    }
}
