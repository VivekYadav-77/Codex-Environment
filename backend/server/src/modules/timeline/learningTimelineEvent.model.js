import mongoose from 'mongoose'

const learningTimelineEventSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
        submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
        type: {
            type: String,
            enum: ['approach_updated', 'code_run', 'submission_result', 'hint_requested', 'review_requested', 'mentor_message', 'accepted'],
            required: true,
        },
        title: String,
        details: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
)

learningTimelineEventSchema.index({ userId: 1, questionId: 1, createdAt: -1 })

export const LearningTimelineEvent = mongoose.model('LearningTimelineEvent', learningTimelineEventSchema)
