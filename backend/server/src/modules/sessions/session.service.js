import { getTodayPlan } from '../coach/coach.service.js'
import { ConceptCheck } from '../conceptChecks/conceptCheck.model.js'
import { DailySession } from './dailySession.model.js'
import { recordLearningEvent } from '../events/event.service.js'

const todayKey = () => new Date().toISOString().slice(0, 10)

const taskLink = (task) => {
    if (task.type === 'learn') return `/roadmap/${task.patternSlug}`
    if (task.type === 'system_design') return task.link || '/system-design'
    if (task.type === 'mixed') return '/practice/mixed?mode=mixed'
    if (task.type === 'revision' || task.type === 'practice') {
        return `/practice/${task.topic || 'hashing'}${task.questionId ? `?question=${task.questionId}` : ''}`
    }
    return '/dashboard'
}

const pushTask = (tasks, task, overrides = {}) => {
    if (!task || tasks.some((item) => item.title === task.title)) return
    tasks.push({
        type: task.type,
        title: task.title,
        reason: task.reason,
        estimatedMinutes: task.estimatedMinutes || 15,
        link: taskLink(task),
        metadata: task,
        ...overrides,
    })
}

export async function buildDailySession(userId) {
    const existing = await DailySession.findOne({ userId, sessionDate: todayKey() })
    if (existing) return existing

    const plan = await getTodayPlan(userId)
    const plannedMinutes = plan.summary?.onboarding?.dailyTimeMinutes || 45
    const tasks = []

    pushTask(tasks, plan.tasks.find((task) => task.type === 'revision'), { estimatedMinutes: 5 })
    pushTask(tasks, plan.tasks.find((task) => task.type === 'learn'), { estimatedMinutes: 10 })

    const focusPattern = plan.summary?.weakPatterns?.[0] || plan.tasks.find((task) => task.patternSlug)?.patternSlug
    if (focusPattern) {
        const check = await ConceptCheck.findOne({ patternSlug: focusPattern, isActive: true })
        tasks.push({
            type: 'concept_check',
            title: 'Quick concept check',
            reason: `Confirm the core idea behind ${focusPattern}.`,
            estimatedMinutes: 5,
            link: `/roadmap/${focusPattern}`,
            metadata: { patternSlug: focusPattern, conceptCheckId: check?._id },
        })
    }

    pushTask(tasks, plan.tasks.find((task) => ['practice', 'mixed', 'mixed-warmup'].includes(task.type)), {
        estimatedMinutes: plannedMinutes === 20 ? 10 : 20,
    })
    if (plannedMinutes !== 20) {
        pushTask(tasks, plan.tasks.find((task) => task.type === 'system_design'), { estimatedMinutes: 15 })
    }

    for (const task of plan.tasks) {
        if (tasks.length >= 4) break
        pushTask(tasks, task)
    }

    tasks.push({
        type: 'reflection',
        title: 'Reflect on the session',
        reason: 'Turn today practice into retained learning.',
        estimatedMinutes: 5,
        link: '/profile/skills',
    })
    tasks.push({
        type: 'mistake_correction',
        title: 'Mistake Doctor check',
        reason: 'Review the clearest weak signal before it becomes a habit.',
        estimatedMinutes: 5,
        link: '/mistake-doctor',
    })

    const selectedTasks = tasks.slice(0, plannedMinutes === 20 ? 4 : 6)
    return DailySession.create({
        userId,
        sessionDate: todayKey(),
        tasks: selectedTasks,
        summary: {
            plannedMinutes: selectedTasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0),
            mission: plannedMinutes === 20 ? 'Focused sprint' : 'Coach-guided learning loop',
        },
    })
}

export async function startDailySession(userId) {
    const session = await buildDailySession(userId)
    session.status = 'active'
    session.startedAt = session.startedAt || new Date()
    await session.save()
    await recordLearningEvent({ userId, type: 'daily_session_started', sessionId: session._id, metadata: { sessionDate: session.sessionDate } })
    return session
}

export async function completeSessionTask({ userId, sessionId, taskId }) {
    const session = await DailySession.findOne({ _id: sessionId, userId })
    if (!session) return null
    const task = session.tasks.id(taskId)
    if (!task) return null
    task.status = 'completed'
    task.completedAt = new Date()
    await session.save()
    return session
}

export async function finishDailySession({ userId, sessionId }) {
    const session = await DailySession.findOne({ _id: sessionId, userId })
    if (!session) return null
    const completed = session.tasks.filter((task) => task.status === 'completed').length
    session.status = 'completed'
    session.completedAt = new Date()
    session.summary = {
        ...session.summary,
        completed,
        total: session.tasks.length,
        message: completed === session.tasks.length ? 'Session complete. Strong consistency signal.' : 'Session saved with partial progress.',
    }
    await session.save()
    await recordLearningEvent({ userId, type: 'daily_session_completed', sessionId: session._id, metadata: session.summary })
    return session
}
