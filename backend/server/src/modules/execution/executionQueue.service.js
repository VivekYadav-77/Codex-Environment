import { ExecutionJob } from './executionJob.model.js'
import { runJudgedSubmission } from './execution.service.js'

export async function runExecutionJob({ userId, question, language, code }) {
    const job = await ExecutionJob.create({
        userId,
        questionId: question._id,
        language,
        status: 'queued',
    })

    try {
        job.status = 'running'
        await job.save()
        const result = await runJudgedSubmission({ code, language, question })
        job.status = result.status === 'time_limit_exceeded' ? 'timed_out' : 'completed'
        job.runtimeMs = result.runtimeMs || 0
        job.error = result.error
        job.stderr = result.error
        job.logs = result.error || `Execution finished with ${result.status}`
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
