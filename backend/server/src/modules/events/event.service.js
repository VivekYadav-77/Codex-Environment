import { LearningEvent } from './learningEvent.model.js'

export async function recordLearningEvent({ userId, type, questionId, sessionId, metadata = {} }) {
    if (!userId || !type) return null
    return LearningEvent.create({ userId, type, questionId, sessionId, metadata })
}

export async function getEventSummary(userId) {
    const rows = await LearningEvent.find({ userId }).sort({ createdAt: -1 }).limit(500)
    const byType = {}
    const byDay = {}

    for (const event of rows) {
        byType[event.type] = (byType[event.type] || 0) + 1
        const day = event.createdAt.toISOString().slice(0, 10)
        byDay[day] = (byDay[day] || 0) + 1
    }

    return {
        total: rows.length,
        byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
        byDay: Object.entries(byDay).map(([day, count]) => ({ day, count })),
        recent: rows.slice(0, 25),
    }
}
