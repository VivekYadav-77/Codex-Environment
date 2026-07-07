import mongoose from 'mongoose'

const reflectionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
        submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
        patternUsed: String,
        whyItWorked: String,
        keyInvariant: String,
        dangerousEdgeCase: String,
        interviewExplanation: String,
        confidenceAfterSolve: { type: Number, min: 1, max: 5, default: 3 },
    },
    { timestamps: true }
)

reflectionSchema.index({ userId: 1, questionId: 1, createdAt: -1 })

export const Reflection = mongoose.model('Reflection', reflectionSchema)
