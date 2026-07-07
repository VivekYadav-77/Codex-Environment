import mongoose from 'mongoose'

const mistakeInsightSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
        submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
        patternSlug: { type: String, index: true },
        tags: [{ type: String, index: true }],
        severity: { type: Number, default: 1 },
        summary: String,
        mode: { type: String, enum: ['practice', 'mixed', 'interview', 'revision'], default: 'practice' },
    },
    { timestamps: true }
)

mistakeInsightSchema.index({ userId: 1, patternSlug: 1, createdAt: -1 })

export const MistakeInsight = mongoose.model('MistakeInsight', mistakeInsightSchema)
