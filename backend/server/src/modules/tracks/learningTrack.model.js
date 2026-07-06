import mongoose from 'mongoose'

const trackPatternSchema = new mongoose.Schema(
    {
        patternSlug: { type: String, required: true },
        order: { type: Number, required: true },
    },
    { _id: false }
)

const learningTrackSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        level: { type: String, enum: ['beginner', 'intermediate', 'interview'], default: 'beginner' },
        targetOutcome: { type: String, default: '' },
        estimatedProblemCount: { type: Number, default: 0 },
        patterns: [trackPatternSchema],
    },
    { timestamps: true }
)

export const LearningTrack = mongoose.model('LearningTrack', learningTrackSchema)
