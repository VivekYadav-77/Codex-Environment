import mongoose from 'mongoose'

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
    },
    { timestamps: true }
)

export const Algorithm = mongoose.model('Algorithm', algorithmSchema)
