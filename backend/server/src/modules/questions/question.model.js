import mongoose from 'mongoose'

const testCaseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        input: { type: mongoose.Schema.Types.Mixed, required: true },
        expected: { type: mongoose.Schema.Types.Mixed, required: true },
        visible: { type: Boolean, default: false },
        category: { type: String, default: 'General' },
        compareMode: { type: String, enum: ['exact', 'unordered'], default: 'exact' },
    },
    { _id: false }
)

const depthBlockSchema = new mongoose.Schema(
    {
        title: String,
        body: String,
        bullets: [String],
        code: mongoose.Schema.Types.Mixed,
    },
    { _id: false }
)

const questionSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        topic: { type: String, required: true, index: true },
        patterns: [{ type: String }],
        primaryPattern: { type: String, index: true },
        prerequisites: [{ type: String }],
        learningOrder: { type: Number, default: 999 },
        coachTags: [{ type: String }],
        lessonRefs: [{ type: String }],
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
        description: { type: String, required: true },
        examples: [{ type: mongoose.Schema.Types.Mixed }],
        starterCode: {
            javascript: String,
            python: String,
        },
        functionName: String,
        testCases: [testCaseSchema],
        hints: [String],
        officialSolution: {
            bruteForceApproach: String,
            optimizedApproach: String,
            complexityExplanation: String,
            code: {
                javascript: String,
                python: String,
            },
            commonMistakes: [String],
            patternSignals: [String],
            interviewExplanation: String,
            followUpVariants: [String],
            relatedProblems: [String],
            misconceptionSlugs: [String],
        },
        learningObjectives: [String],
        beginnerExplanation: String,
        workedExample: depthBlockSchema,
        visualWalkthrough: [String],
        edgeCases: [String],
        revisionPrompts: [String],
        profileSignals: [String],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

export const Question = mongoose.model('Question', questionSchema)
