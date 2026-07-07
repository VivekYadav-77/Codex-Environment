import mongoose from 'mongoose'

const mentorMessageSchema = new mongoose.Schema(
    {
        role: { type: String, enum: ['learner', 'mentor'], required: true },
        content: { type: String, required: true },
    },
    { _id: false, timestamps: true }
)

const mentorSessionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
        mode: { type: String, enum: ['practice', 'mixed', 'interview', 'revision'], default: 'practice' },
        hintLevel: { type: Number, default: 0 },
        messages: [mentorMessageSchema],
    },
    { timestamps: true }
)

mentorSessionSchema.index({ userId: 1, questionId: 1 }, { unique: true })

export const MentorSession = mongoose.model('MentorSession', mentorSessionSchema)
