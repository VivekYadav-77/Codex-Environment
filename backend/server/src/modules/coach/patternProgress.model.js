import mongoose from 'mongoose'

const patternProgressSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        patternSlug: { type: String, required: true, index: true },
        masteryScore: { type: Number, default: 0 },
        solvedCount: { type: Number, default: 0 },
        attemptedCount: { type: Number, default: 0 },
        acceptedFirstTry: { type: Number, default: 0 },
        totalAttempts: { type: Number, default: 0 },
        hintsUsed: { type: Number, default: 0 },
        wrongAnswerCount: { type: Number, default: 0 },
        lastPracticedAt: Date,
        nextReviewAt: Date,
        status: {
            type: String,
            enum: ['locked', 'learning', 'practicing', 'review', 'mastered'],
            default: 'locked',
        },
    },
    { timestamps: true }
)

patternProgressSchema.index({ userId: 1, patternSlug: 1 }, { unique: true })

export const PatternProgress = mongoose.model('PatternProgress', patternProgressSchema)
