import mongoose from 'mongoose'

const learnerMemorySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
        recurringMistakes: [{ tag: String, count: Number }],
        weakPatterns: [{ patternSlug: String, count: Number }],
        hintDependency: { type: Number, default: 0 },
        reflectionQuality: { type: Number, default: 0 },
        patternRecognitionAccuracy: { type: Number, default: 0 },
        communicationWeakness: { type: Boolean, default: false },
        recentImprovementSignals: [String],
        summary: String,
    },
    { timestamps: true }
)

export const LearnerMemory = mongoose.model('LearnerMemory', learnerMemorySchema)
