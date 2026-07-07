import { Question } from '../questions/question.model.js'
import { Progress } from '../progress/progress.model.js'
import { LearningTrack } from '../tracks/learningTrack.model.js'
import { RevisionItem } from '../revision/revisionItem.model.js'
import { User } from '../users/user.model.js'
import { SystemDesignConcept } from '../systemDesign/systemDesignConcept.model.js'
import { SystemDesignAttempt } from '../systemDesign/systemDesignAttempt.model.js'
import { getMastery } from './mastery.service.js'
import { getSkillProfile } from './readiness.service.js'

const formatTask = ({ type, title, reason, impact = 'medium', minutes = 20, ...rest }) => ({
    type,
    title,
    reason,
    impact,
    estimatedMinutes: minutes,
    ...rest,
})

export async function getTodayPlan(userId) {
    const [mastery, progressRows, user, systemDesignAttempts] = await Promise.all([
        getMastery(userId),
        Progress.find({ userId }),
        User.findById(userId).select('onboarding'),
        SystemDesignAttempt.find({ userId }).sort({ createdAt: -1 }).limit(20),
    ])
    const dueRevisions = await RevisionItem.find({ userId, status: 'queued', dueAt: { $lte: new Date() } })
        .sort({ priority: 1, dueAt: 1 })
        .limit(3)
        .populate('questionId', 'slug title topic difficulty primaryPattern')
    const wantsSystemDesign = user?.onboarding?.selectedTracks?.includes('system_design')

    const strongPatterns = mastery.filter((row) => row.masteryScore >= 75).slice(0, 3).map((row) => row.pattern.slug)
    const weakPatterns = mastery.filter((row) => row.status !== 'locked' && row.masteryScore < 60).slice(0, 3).map((row) => row.pattern.slug)
    const firstLearning = mastery.find((row) => row.status === 'learning' || row.status === 'practicing') || mastery[0]
    const solvedQuestionIds = progressRows.filter((row) => row.status === 'solved').map((row) => String(row.questionId))
    const practiceQuestion = firstLearning
        ? await Question.findOne({ primaryPattern: firstLearning.pattern.slug, isActive: true, _id: { $nin: solvedQuestionIds } }).sort({ learningOrder: 1, difficulty: 1 })
        : null
    const tasks = []

    if (dueRevisions[0]) {
        tasks.push(formatTask({
            type: 'revision',
            title: `Revise ${dueRevisions[0].questionId.title}`,
            questionId: dueRevisions[0].questionId.slug,
            topic: dueRevisions[0].questionId.topic,
            patternSlug: dueRevisions[0].patternSlug,
            reason: dueRevisions[0].reason,
            impact: 'high',
            minutes: 15,
        }))
    }

    const weakPattern = mastery.find((row) => row.status !== 'locked' && row.masteryScore > 0 && row.masteryScore < 60)
    if (weakPattern) {
        tasks.push(formatTask({
            type: 'practice',
            title: `Strengthen ${weakPattern.pattern.name}`,
            topic: weakPattern.pattern.topic || 'hashing',
            patternSlug: weakPattern.pattern.slug,
            reason: 'Your recent attempts show this pattern needs practice',
            impact: 'high',
            minutes: 25,
        }))
    }

    if (firstLearning) {
        tasks.push(formatTask({
            type: 'learn',
            title: `Learn ${firstLearning.pattern.name}`,
            patternSlug: firstLearning.pattern.slug,
            reason: 'Next pattern in your roadmap',
            impact: 'medium',
            minutes: 20,
        }))
    }

    if (practiceQuestion) {
        tasks.push(formatTask({
            type: 'practice',
            title: `Solve ${practiceQuestion.title}`,
            questionId: practiceQuestion.slug,
            topic: practiceQuestion.topic,
            patternSlug: practiceQuestion.primaryPattern,
            reason: `Build ${firstLearning.pattern.name} skill`,
            impact: 'medium',
            minutes: 30,
        }))
    }

    if (strongPatterns.length >= 2) {
        tasks.push(formatTask({ type: 'mixed', title: 'Mixed pattern practice', reason: 'Train pattern recognition without labels', impact: 'high', minutes: 25 }))
    } else if (!progressRows.some((row) => row.status === 'solved')) {
        tasks.push(formatTask({ type: 'mixed-warmup', title: 'Pattern warm-up', reason: 'Beginner-safe mixed practice will use early roadmap patterns.', impact: 'low', minutes: 15 }))
    }

    if (wantsSystemDesign) {
        const nextConcept = await SystemDesignConcept.findOne({}).sort({ order: 1 })
        tasks.push(formatTask({
            type: 'system_design',
            title: nextConcept ? `System Design: ${nextConcept.title}` : 'System Design foundations',
            reason: systemDesignAttempts.length ? 'Keep architecture thinking active with one focused drill.' : 'Start with the building blocks used in real interviews.',
            impact: 'medium',
            minutes: 20,
            link: nextConcept ? `/system-design/${nextConcept.slug}` : '/system-design',
        }))
    }

    return {
        summary: {
            solved: progressRows.filter((row) => row.status === 'solved').length,
            attempted: progressRows.filter((row) => row.status === 'attempted' || row.status === 'needs_revision').length,
            strongPatterns,
            weakPatterns,
            onboarding: user?.onboarding || null,
            systemDesignAttempts: systemDesignAttempts.length,
        },
        tasks: tasks.slice(0, user?.onboarding?.dailyTimeMinutes === 20 ? 3 : 5),
        dueRevisions,
    }
}

export async function getNextActions(userId) {
    const today = await getTodayPlan(userId)
    return today.tasks
}

export async function getDashboard(userId) {
    const [today, mastery, track, skillProfile] = await Promise.all([
        getTodayPlan(userId),
        getMastery(userId),
        LearningTrack.findOne({ slug: 'dsa-foundations-to-interview-ready' }),
        getSkillProfile(userId),
    ])
    return { today, mastery, track, skillProfile, onboarding: skillProfile.onboarding }
}
