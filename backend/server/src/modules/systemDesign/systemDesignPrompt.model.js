import mongoose from 'mongoose'

const systemDesignPromptSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
        scenario: { type: String, required: true },
        requirements: [String],
        scaleAssumptions: [String],
        expectedComponents: [String],
        tradeoffFocus: [String],
        followUps: [String],
        order: { type: Number, default: 999 },
    },
    { timestamps: true }
)

export const SystemDesignPrompt = mongoose.model('SystemDesignPrompt', systemDesignPromptSchema)
