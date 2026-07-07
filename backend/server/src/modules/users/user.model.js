import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['student', 'admin'], default: 'student' },
        onboarding: {
            completed: { type: Boolean, default: false },
            goal: { type: String, enum: ['college_learning', 'placement_prep', 'interview_prep'], default: 'placement_prep' },
            level: { type: String, enum: ['beginner', 'knows_basics', 'solving_problems', 'interview_ready'], default: 'beginner' },
            dailyTimeMinutes: { type: Number, enum: [20, 45, 90], default: 45 },
            selectedTracks: [{ type: String, enum: ['dsa', 'system_design'] }],
        },
    },
    { timestamps: true }
)

export const User = mongoose.model('User', userSchema)
