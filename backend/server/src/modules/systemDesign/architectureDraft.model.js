import mongoose from 'mongoose'

const architectureDraftSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        promptSlug: { type: String, default: '' },
        title: { type: String, required: true },
        components: [{ type: mongoose.Schema.Types.Mixed }],
        connections: [{ type: mongoose.Schema.Types.Mixed }],
        notes: { type: String, default: '' },
    },
    { timestamps: true }
)

export const ArchitectureDraft = mongoose.model('ArchitectureDraft', architectureDraftSchema)
