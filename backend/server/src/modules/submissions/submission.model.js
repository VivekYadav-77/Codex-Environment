import mongoose from 'mongoose'

const testResultSchema = new mongoose.Schema(
    {
        name: String,
        passed: Boolean,
        visible: Boolean,
        category: String,
        input: mongoose.Schema.Types.Mixed,
        expected: mongoose.Schema.Types.Mixed,
        actual: mongoose.Schema.Types.Mixed,
        error: String,
    },
    { _id: false }
)

const submissionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
        language: { type: String, enum: ['javascript', 'python'], required: true },
        code: { type: String, required: true },
        status: {
            type: String,
            enum: ['accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded', 'compile_error'],
            required: true,
        },
        testResults: [testResultSchema],
        passedCount: { type: Number, default: 0 },
        totalCount: { type: Number, default: 0 },
        runtimeMs: { type: Number, default: 0 },
        hintCountAtSubmit: { type: Number, default: 0 },
        approachSnapshot: {
            bruteForce: String,
            optimized: String,
            patternGuess: String,
            edgeCases: String,
            timeComplexity: String,
            spaceComplexity: String,
        },
        patternGuess: String,
        patternGuessCorrect: Boolean,
        mistakeTags: [{ type: String }],
        mode: { type: String, enum: ['practice', 'mixed', 'interview', 'revision'], default: 'practice' },
    },
    { timestamps: true }
)

export const Submission = mongoose.model('Submission', submissionSchema)
