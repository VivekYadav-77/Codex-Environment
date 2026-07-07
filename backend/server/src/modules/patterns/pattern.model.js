import mongoose from 'mongoose'

const depthBlockSchema = new mongoose.Schema(
    {
        title: String,
        body: String,
        bullets: [String],
        code: mongoose.Schema.Types.Mixed,
    },
    { _id: false }
)

const patternSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        category: { type: String, required: true, index: true },
        difficultyBand: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        description: { type: String, required: true },
        whenToUse: { type: String, default: '' },
        mentalModel: { type: String, default: '' },
        analogy: { type: String, default: '' },
        signalRules: [{ type: String }],
        antiSignals: [{ type: String }],
        visualSteps: [{ type: String }],
        trapExamples: [{ type: String }],
        bruteForceToOptimized: { type: String, default: '' },
        prerequisites: [{ type: String }],
        templateNotes: { type: String, default: '' },
        commonMistakes: [{ type: String }],
        learningObjectives: [String],
        beginnerExplanation: { type: String, default: '' },
        workedExample: depthBlockSchema,
        codeTemplate: { type: mongoose.Schema.Types.Mixed },
        complexityReasoning: depthBlockSchema,
        edgeCases: [String],
        misconceptions: [depthBlockSchema],
        interviewExplanation: { type: String, default: '' },
        revisionPrompts: [String],
        practiceLadder: [depthBlockSchema],
        guidedProblemSlugs: [{ type: String }],
        mixedProblemSlugs: [{ type: String }],
        interviewProblemSlugs: [{ type: String }],
        order: { type: Number, default: 999 },
    },
    { timestamps: true }
)

export const Pattern = mongoose.model('Pattern', patternSchema)
