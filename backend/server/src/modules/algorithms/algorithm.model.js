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

const algorithmSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        category: { type: String, required: true, index: true },
        complexity: { type: mongoose.Schema.Types.Mixed },
        description: String,
        operations: [String],
        code: { type: mongoose.Schema.Types.Mixed },
        practice: { type: mongoose.Schema.Types.Mixed },
        prerequisites: [String],
        learningObjectives: [String],
        beginnerExplanation: String,
        mentalModel: String,
        workedExample: depthBlockSchema,
        visualWalkthrough: [String],
        complexityReasoning: depthBlockSchema,
        commonMisconceptions: [depthBlockSchema],
        edgeCases: [String],
        interviewExplanation: String,
        revisionPrompts: [String],
    },
    { timestamps: true }
)

export const Algorithm = mongoose.model('Algorithm', algorithmSchema)
