import mongoose from 'mongoose'

const systemDesignAttemptSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        promptSlug: { type: String, required: true, index: true },
        requirements: { type: String, default: '' },
        estimates: { type: String, default: '' },
        highLevelDesign: { type: String, default: '' },
        bottlenecks: { type: String, default: '' },
        tradeoffs: { type: String, default: '' },
        finalRecommendation: { type: String, default: '' },
        score: { type: Number, default: 0 },
        feedback: { type: String, default: '' },
    },
    { timestamps: true }
)

export const SystemDesignAttempt = mongoose.model('SystemDesignAttempt', systemDesignAttemptSchema)
