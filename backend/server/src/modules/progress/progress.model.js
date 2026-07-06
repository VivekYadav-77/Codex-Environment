import mongoose from 'mongoose'

const progressSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
        status: {
            type: String,
            enum: ['not_started', 'attempted', 'solved', 'needs_revision'],
            default: 'not_started',
        },
        attempts: { type: Number, default: 0 },
        bestLanguage: String,
        lastSubmittedAt: Date,
        solvedAt: Date,
        topic: String,
        difficulty: String,
    },
    { timestamps: true }
)

progressSchema.index({ userId: 1, questionId: 1 }, { unique: true })

export const Progress = mongoose.model('Progress', progressSchema)
