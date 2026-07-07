import { LearningEvent } from '../events/learningEvent.model.js'
import { Submission } from '../submissions/submission.model.js'

const dateKey = (date) => new Date(date).toISOString().slice(0, 10)

const streakForType = (events, type) => {
    const days = new Set(events.filter((event) => event.type === type).map((event) => dateKey(event.createdAt)))
    let streak = 0
    const cursor = new Date()
    while (days.has(dateKey(cursor))) {
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
    }
    return streak
}

export async function getLearningAnalytics(userId) {
    const [events, submissions] = await Promise.all([
        LearningEvent.find({ userId }).sort({ createdAt: -1 }).limit(1000),
        Submission.find({ userId }).sort({ createdAt: -1 }).limit(500),
    ])

    const trend = {}
    for (const event of events) {
        const day = dateKey(event.createdAt)
        if (!trend[day]) trend[day] = { day, events: 0, hints: 0, reflections: 0, sessions: 0, revisions: 0 }
        trend[day].events += 1
        if (event.type === 'hint_requested') trend[day].hints += 1
        if (event.type === 'reflection_submitted') trend[day].reflections += 1
        if (event.type === 'daily_session_completed') trend[day].sessions += 1
        if (event.type === 'revision_completed') trend[day].revisions += 1
    }

    const acceptedTrend = {}
    for (const submission of submissions) {
        const day = dateKey(submission.createdAt)
        if (!acceptedTrend[day]) acceptedTrend[day] = { day, accepted: 0, submissions: 0, patternGuesses: 0, correctPatternGuesses: 0 }
        acceptedTrend[day].submissions += 1
        if (submission.status === 'accepted') acceptedTrend[day].accepted += 1
        if (submission.patternGuess) acceptedTrend[day].patternGuesses += 1
        if (submission.patternGuessCorrect) acceptedTrend[day].correctPatternGuesses += 1
    }

    return {
        streaks: {
            dailySession: streakForType(events, 'daily_session_completed'),
            revision: streakForType(events, 'revision_completed'),
            reflection: streakForType(events, 'reflection_submitted'),
            mixedPractice: submissions.some((row) => row.mode === 'mixed' && dateKey(row.createdAt) === dateKey(new Date())) ? 1 : 0,
        },
        eventTrend: Object.values(trend).sort((a, b) => a.day.localeCompare(b.day)).slice(-30),
        submissionTrend: Object.values(acceptedTrend).sort((a, b) => a.day.localeCompare(b.day)).slice(-30),
    }
}
