import mongoose from 'mongoose'

const adminAuditSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        action: { type: String, required: true, index: true },
        targetType: String,
        targetId: String,
        metadata: mongoose.Schema.Types.Mixed,
        requestId: String,
    },
    { timestamps: true }
)

export const AdminAudit = mongoose.model('AdminAudit', adminAuditSchema)
