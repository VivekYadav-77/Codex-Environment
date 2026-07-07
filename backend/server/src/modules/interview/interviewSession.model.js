import mongoose from 'mongoose'

const interviewSessionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
        status: { type: String, enum: ['active', 'finished'], default: 'active', index: true },
        language: { type: String, enum: ['javascript', 'python'], default: 'javascript' },
        code: String,
        startedAt: { type: Date, default: Date.now },
        endedAt: Date,
        submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
        explanation: String,
        finalScore: { type: Number, default: 0 },
        scoreBreakdown: mongoose.Schema.Types.Mixed,
        report: mongoose.Schema.Types.Mixed,
        feedback: String,
    },
    { timestamps: true }
)

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema)
