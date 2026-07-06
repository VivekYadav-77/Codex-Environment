import { Question } from '../questions/question.model.js'
import { Progress } from '../progress/progress.model.js'
import { Submission } from '../submissions/submission.model.js'
import { Pattern } from '../patterns/pattern.model.js'
import { LearningTrack } from '../tracks/learningTrack.model.js'
import { PatternProgress } from './patternProgress.model.js'
import { RevisionItem } from '../revision/revisionItem.model.js'

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)

const scoreStatus = (score, attemptedCount, dueReview) => {
    if (dueReview) return 'review'
    if (score >= 80) return 'mastered'
    if (attemptedCount > 0) return 'practicing'
    return 'learning'
}

export async function recalculatePatternProgress(userId, patternSlug) {
    if (!patternSlug) return null

    const questions = await Question.find({ primaryPattern: patternSlug, isActive: true }).select('_id')
    const questionIds = questions.map((question) => question._id)
    const requiredCount = Math.max(questionIds.length, 1)

    const progressRows = await Progress.find({ userId, questionId: { $in: questionIds } })
    const submissions = await Submission.find({ userId, questionId: { $in: questionIds } }).sort({ createdAt: 1 })
    const revisionsDue = await RevisionItem.countDocuments({
        userId,
        patternSlug,
        status: 'queued',
        dueAt: { $lte: new Date() },
    })

    const solvedCount = progressRows.filter((row) => row.status === 'solved').length
    const attemptedCount = progressRows.filter((row) => row.status !== 'not_started').length
    const totalAttempts = submissions.length
    const wrongAnswerCount = submissions.filter((row) => row.status !== 'accepted').length

    const attemptsByQuestion = submissions.reduce((acc, submission) => {
        const id = String(submission.questionId)
        if (!acc[id]) acc[id] = []
        acc[id].push(submission)
        return acc
    }, {})

    const acceptedFirstTry = Object.values(attemptsByQuestion)
        .filter((items) => items[0]?.status === 'accepted')
        .length

    const base = (solvedCount / requiredCount) * 75
    const firstTryBonus = Math.min(15, acceptedFirstTry * 5)
    const attemptPenalty = Math.min(20, Math.max(0, wrongAnswerCount - solvedCount) * 4)
    const masteryScore = Math.max(0, Math.min(100, Math.round(base + firstTryBonus - attemptPenalty)))
    const dueReview = revisionsDue > 0

    return PatternProgress.findOneAndUpdate(
        { userId, patternSlug },
        {
            $set: {
                masteryScore,
                solvedCount,
                attemptedCount,
                acceptedFirstTry,
                totalAttempts,
                wrongAnswerCount,
                lastPracticedAt: submissions.at(-1)?.createdAt || progressRows.at(-1)?.updatedAt,
                nextReviewAt: dueReview ? new Date() : undefined,
                status: scoreStatus(masteryScore, attemptedCount, dueReview),
            },
        },
        { upsert: true, new: true }
    )
}

export async function updateCoachAfterSubmission({ userId, question, result }) {
    const patternSlug = question.primaryPattern || question.patterns?.[0]
    if (!patternSlug) return null

    const attemptsForQuestion = await Submission.countDocuments({ userId, questionId: question._id })
    const now = new Date()

    if (result.status !== 'accepted') {
        await RevisionItem.findOneAndUpdate(
            { userId, questionId: question._id, status: 'queued' },
            {
                $set: {
                    patternSlug,
                    reason: 'wrong_answer',
                    dueAt: addDays(now, 1),
                    priority: 1,
                },
            },
            { upsert: true, new: true }
        )
    } else if (attemptsForQuestion > 1) {
        await RevisionItem.findOneAndUpdate(
            { userId, questionId: question._id, status: 'queued' },
            {
                $set: {
                    patternSlug,
                    reason: 'solved_with_hints',
                    dueAt: addDays(now, 2),
                    priority: 2,
                },
            },
            { upsert: true, new: true }
        )
    } else {
        await RevisionItem.findOneAndUpdate(
            { userId, questionId: question._id, status: 'queued' },
            {
                $set: {
                    patternSlug,
                    reason: 'stale_mastery',
                    dueAt: addDays(now, 7),
                    priority: 4,
                },
            },
            { upsert: true, new: true }
        )
    }

    return recalculatePatternProgress(userId, patternSlug)
}

export async function getMastery(userId) {
    const patterns = await Pattern.find({}).sort({ order: 1 })
    const progress = await PatternProgress.find({ userId })
    const progressMap = new Map(progress.map((row) => [row.patternSlug, row]))

    return patterns.map((pattern) => {
        const row = progressMap.get(pattern.slug)
        return {
            pattern,
            masteryScore: row?.masteryScore || 0,
            status: row?.status || (pattern.order === 1 ? 'learning' : 'locked'),
            solvedCount: row?.solvedCount || 0,
            attemptedCount: row?.attemptedCount || 0,
            wrongAnswerCount: row?.wrongAnswerCount || 0,
            nextReviewAt: row?.nextReviewAt,
        }
    })
}

export async function getTodayPlan(userId) {
    const mastery = await getMastery(userId)
    const progressRows = await Progress.find({ userId })
    const dueRevisions = await RevisionItem.find({
        userId,
        status: 'queued',
        dueAt: { $lte: new Date() },
    })
        .sort({ priority: 1, dueAt: 1 })
        .limit(3)
        .populate('questionId', 'slug title topic difficulty primaryPattern')

    const strongPatterns = mastery.filter((row) => row.masteryScore >= 75).slice(0, 3).map((row) => row.pattern.slug)
    const weakPatterns = mastery
        .filter((row) => row.status !== 'locked' && row.masteryScore < 60)
        .slice(0, 3)
        .map((row) => row.pattern.slug)

    const firstLearning = mastery.find((row) => row.status === 'learning' || row.status === 'practicing') || mastery[0]
    const solvedQuestionIds = progressRows.filter((row) => row.status === 'solved').map((row) => String(row.questionId))
    const practiceQuestion = firstLearning
        ? await Question.findOne({
            primaryPattern: firstLearning.pattern.slug,
            isActive: true,
            _id: { $nin: solvedQuestionIds },
        }).sort({ learningOrder: 1, difficulty: 1 })
        : null

    const tasks = []

    if (dueRevisions[0]) {
        tasks.push({
            type: 'revision',
            title: `Revise ${dueRevisions[0].questionId.title}`,
            questionId: dueRevisions[0].questionId.slug,
            topic: dueRevisions[0].questionId.topic,
            patternSlug: dueRevisions[0].patternSlug,
            reason: dueRevisions[0].reason,
        })
    }

    if (firstLearning) {
        tasks.push({
            type: 'learn',
            title: `Learn ${firstLearning.pattern.name}`,
            patternSlug: firstLearning.pattern.slug,
            reason: 'Next pattern in your roadmap',
        })
    }

    if (practiceQuestion) {
        tasks.push({
            type: 'practice',
            title: `Solve ${practiceQuestion.title}`,
            questionId: practiceQuestion.slug,
            topic: practiceQuestion.topic,
            patternSlug: practiceQuestion.primaryPattern,
            reason: `Build ${firstLearning.pattern.name} skill`,
        })
    }

    return {
        summary: {
            solved: progressRows.filter((row) => row.status === 'solved').length,
            attempted: progressRows.filter((row) => row.status === 'attempted' || row.status === 'needs_revision').length,
            strongPatterns,
            weakPatterns,
        },
        tasks,
        dueRevisions,
    }
}

export async function getDashboard(userId) {
    const [today, mastery, track] = await Promise.all([
        getTodayPlan(userId),
        getMastery(userId),
        LearningTrack.findOne({ slug: 'dsa-foundations-to-interview-ready' }),
    ])

    return { today, mastery, track }
}

export async function recalculateAllProgress(userId) {
    const patterns = await Pattern.find({})
    return Promise.all(patterns.map((pattern) => recalculatePatternProgress(userId, pattern.slug)))
}
