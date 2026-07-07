import mongoose from 'mongoose'

const executionJobSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', index: true },
        language: { type: String, enum: ['javascript', 'python'], required: true },
        status: { type: String, enum: ['queued', 'running', 'completed', 'failed'], default: 'queued', index: true },
        runtimeMs: { type: Number, default: 0 },
        logs: String,
        result: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
)

export const ExecutionJob = mongoose.model('ExecutionJob', executionJobSchema)
