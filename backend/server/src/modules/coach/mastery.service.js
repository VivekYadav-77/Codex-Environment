import { Question } from '../questions/question.model.js'
import { Progress } from '../progress/progress.model.js'
import { Submission } from '../submissions/submission.model.js'
import { Pattern } from '../patterns/pattern.model.js'
import { PatternProgress } from './patternProgress.model.js'
import { RevisionItem } from '../revision/revisionItem.model.js'
import { MistakeInsight } from '../insights/mistakeInsight.model.js'
import { addDays, masteryWeights } from './coach.config.js'

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
    const [progressRows, submissions, mistakes, revisionsDue] = await Promise.all([
        Progress.find({ userId, questionId: { $in: questionIds } }),
        Submission.find({ userId, questionId: { $in: questionIds } }).sort({ createdAt: 1 }),
        MistakeInsight.find({ userId, questionId: { $in: questionIds } }),
        RevisionItem.countDocuments({ userId, patternSlug, status: 'queued', dueAt: { $lte: new Date() } }),
    ])

    const solvedCount = progressRows.filter((row) => row.status === 'solved').length
    const attemptedCount = progressRows.filter((row) => row.status !== 'not_started').length
    const wrongAnswerCount = submissions.filter((row) => row.status !== 'accepted').length
    const hintCount = submissions.reduce((sum, row) => sum + (row.hintCountAtSubmit || 0), 0)
    const mistakePenalty = Math.min(masteryWeights.maxMistakePenalty, mistakes.reduce((sum, row) => sum + (row.severity || 1), 0) * 2)
    const attemptsByQuestion = submissions.reduce((acc, submission) => {
        const id = String(submission.questionId)
        if (!acc[id]) acc[id] = []
        acc[id].push(submission)
        return acc
    }, {})
    const acceptedFirstTry = Object.values(attemptsByQuestion).filter((items) => items[0]?.status === 'accepted').length

    const base = (solvedCount / requiredCount) * masteryWeights.baseSolved
    const firstTryBonus = Math.min(masteryWeights.firstTryBonus, acceptedFirstTry * 5)
    const attemptPenalty = Math.min(masteryWeights.maxAttemptPenalty, Math.max(0, wrongAnswerCount - solvedCount) * 4)
    const hintPenalty = Math.min(masteryWeights.maxHintPenalty, hintCount * 2)
    const recentActivityBonus = submissions.at(-1)?.createdAt > addDays(new Date(), -masteryWeights.recentActivityDays) ? masteryWeights.recentActivityBonus : 0
    const masteryScore = Math.max(0, Math.min(100, Math.round(base + firstTryBonus + recentActivityBonus - attemptPenalty - hintPenalty - mistakePenalty)))
    const dueReview = revisionsDue > 0

    return PatternProgress.findOneAndUpdate(
        { userId, patternSlug },
        {
            $set: {
                masteryScore,
                solvedCount,
                attemptedCount,
                acceptedFirstTry,
                totalAttempts: submissions.length,
                wrongAnswerCount,
                lastPracticedAt: submissions.at(-1)?.createdAt || progressRows.at(-1)?.updatedAt,
                nextReviewAt: dueReview ? new Date() : undefined,
                status: scoreStatus(masteryScore, attemptedCount, dueReview),
            },
        },
        { upsert: true, new: true }
    )
}

export async function getMastery(userId) {
    const [patterns, progress] = await Promise.all([
        Pattern.find({}).sort({ order: 1 }),
        PatternProgress.find({ userId }),
    ])
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

export async function recalculateAllProgress(userId) {
    const patterns = await Pattern.find({})
    return Promise.all(patterns.map((pattern) => recalculatePatternProgress(userId, pattern.slug)))
}
