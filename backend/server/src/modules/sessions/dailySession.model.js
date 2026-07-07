import mongoose from 'mongoose'

const dailySessionTaskSchema = new mongoose.Schema(
    {
        type: { type: String, required: true },
        title: { type: String, required: true },
        reason: String,
        estimatedMinutes: { type: Number, default: 15 },
        link: String,
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
        completedAt: Date,
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { _id: true }
)

const dailySessionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        sessionDate: { type: String, required: true, index: true },
        status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
        tasks: [dailySessionTaskSchema],
        summary: { type: mongoose.Schema.Types.Mixed, default: {} },
        startedAt: Date,
        completedAt: Date,
    },
    { timestamps: true }
)

dailySessionSchema.index({ userId: 1, sessionDate: 1 }, { unique: true })

export const DailySession = mongoose.model('DailySession', dailySessionSchema)
