import mongoose from 'mongoose'

const eventTypes = [
    'daily_session_started',
    'daily_session_completed',
    'concept_check_attempted',
    'approach_written',
    'pattern_guess_submitted',
    'test_run_submitted',
    'hint_requested',
    'mentor_message_sent',
    'submission_analyzed',
    'reflection_submitted',
    'revision_completed',
    'interview_finished',
]

const learningEventSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, enum: eventTypes, required: true, index: true },
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', index: true },
        sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'DailySession', index: true },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
)

learningEventSchema.index({ userId: 1, createdAt: -1 })

export const LearningEvent = mongoose.model('LearningEvent', learningEventSchema)
export { eventTypes }
