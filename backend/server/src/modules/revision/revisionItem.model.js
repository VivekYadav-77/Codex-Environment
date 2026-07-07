import mongoose from 'mongoose'

const revisionItemSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
        patternSlug: { type: String, required: true, index: true },
        reason: {
            type: String,
            enum: ['wrong_answer', 'solved_with_hints', 'stale_mastery', 'manual'],
            required: true,
        },
        dueAt: { type: Date, required: true, index: true },
        priority: { type: Number, default: 2 },
        intervalDays: { type: Number, default: 1 },
        lastResult: String,
        status: { type: String, enum: ['queued', 'completed', 'skipped'], default: 'queued' },
    },
    { timestamps: true }
)

revisionItemSchema.index({ userId: 1, questionId: 1, status: 1 })

export const RevisionItem = mongoose.model('RevisionItem', revisionItemSchema)
