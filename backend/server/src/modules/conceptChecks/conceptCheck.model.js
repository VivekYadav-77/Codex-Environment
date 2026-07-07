import mongoose from 'mongoose'

const conceptCheckSchema = new mongoose.Schema(
    {
        patternSlug: { type: String, required: true, index: true },
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctIndex: { type: Number, required: true },
        explanation: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

export const ConceptCheck = mongoose.model('ConceptCheck', conceptCheckSchema)
