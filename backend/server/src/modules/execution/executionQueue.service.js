import { ExecutionJob } from './executionJob.model.js'
import { runJudgedSubmission } from './execution.service.js'

export async function runExecutionJob({ userId, question, language, code }) {
    const job = await ExecutionJob.create({
        userId,
        questionId: question._id,
        language,
        status: 'running',
    })

    try {
        const result = await runJudgedSubmission({ code, language, question })
        job.status = 'completed'
        job.runtimeMs = result.runtimeMs || 0
        job.result = result
        await job.save()
        return { job, result }
    } catch (error) {
        job.status = 'failed'
        job.logs = error.message
        await job.save()
        throw error
    }
}
