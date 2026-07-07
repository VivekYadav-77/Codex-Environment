import mongoose from 'mongoose'

const systemDesignConceptSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        category: { type: String, enum: ['fundamentals', 'components', 'tradeoffs', 'estimation', 'case_studies'], required: true, index: true },
        level: { type: String, enum: ['beginner', 'intermediate', 'interview'], default: 'beginner' },
        summary: { type: String, required: true },
        analogy: { type: String, default: '' },
        explanation: { type: String, default: '' },
        diagram: [{ type: String }],
        tradeoffs: [{
            optionA: String,
            optionB: String,
            decisionRule: String,
        }],
        quiz: [{
            question: String,
            options: [String],
            correctIndex: Number,
            explanation: String,
        }],
        drill: {
            prompt: String,
            checklist: [String],
        },
        order: { type: Number, default: 999 },
    },
    { timestamps: true }
)

export const SystemDesignConcept = mongoose.model('SystemDesignConcept', systemDesignConceptSchema)
