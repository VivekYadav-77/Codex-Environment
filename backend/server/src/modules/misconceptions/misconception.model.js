import mongoose from 'mongoose'

const misconceptionSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        detectionTags: [{ type: String }],
        patternSlugs: [{ type: String }],
        correction: { type: String, required: true },
        recommendedAction: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

export const Misconception = mongoose.model('Misconception', misconceptionSchema)
