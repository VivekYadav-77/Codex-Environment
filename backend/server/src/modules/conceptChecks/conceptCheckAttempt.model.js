import mongoose from 'mongoose'

const conceptCheckAttemptSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        conceptCheckId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConceptCheck', required: true, index: true },
        patternSlug: { type: String, required: true, index: true },
        selectedIndex: { type: Number, required: true },
        correct: { type: Boolean, required: true },
    },
    { timestamps: true }
)

conceptCheckAttemptSchema.index({ userId: 1, patternSlug: 1, createdAt: -1 })

export const ConceptCheckAttempt = mongoose.model('ConceptCheckAttempt', conceptCheckAttemptSchema)
