import mongoose from 'mongoose'

const patternSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        category: { type: String, required: true, index: true },
        difficultyBand: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        description: { type: String, required: true },
        whenToUse: { type: String, default: '' },
        mentalModel: { type: String, default: '' },
        prerequisites: [{ type: String }],
        templateNotes: { type: String, default: '' },
        commonMistakes: [{ type: String }],
        order: { type: Number, default: 999 },
    },
    { timestamps: true }
)

export const Pattern = mongoose.model('Pattern', patternSchema)
