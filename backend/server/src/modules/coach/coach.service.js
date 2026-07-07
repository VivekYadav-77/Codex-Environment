import { Question } from '../questions/question.model.js'
import { Progress } from '../progress/progress.model.js'
import { Submission } from '../submissions/submission.model.js'
import { Pattern } from '../patterns/pattern.model.js'
import { LearningTrack } from '../tracks/learningTrack.model.js'
import { PatternProgress } from './patternProgress.model.js'
import { RevisionItem } from '../revision/revisionItem.model.js'
import { MistakeInsight } from '../insights/mistakeInsight.model.js'
import { ConceptCheck } from '../conceptChecks/conceptCheck.model.js'
import { ConceptCheckAttempt } from '../conceptChecks/conceptCheckAttempt.model.js'
import { Reflection } from '../reflections/reflection.model.js'
import { getLearnerMisconceptions } from '../misconceptions/misconception.service.js'
import { recordLearningEvent } from '../events/event.service.js'

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
const startOfWeek = (date) => {
    const copy = new Date(date)
    const day = copy.getDay()
    copy.setHours(0, 0, 0, 0)
    copy.setDate(copy.getDate() - day)
    return copy.toISOString().slice(0, 10)
}

const scoreStatus = (score, attemptedCount, dueReview) => {
    if (dueReview) return 'review'
    if (score >= 80) return 'mastered'
    if (attemptedCount > 0) return 'practicing'
    return 'learning'
}

const mistakeAdvice = {
    wrong_answer: {
        title: 'Correctness gap',
        advice: 'Slow down before coding and write the expected output for at least one custom case.',
    },
    runtime_error: {
        title: 'Runtime stability',
        advice: 'Check variable initialization, bounds, null values, and language-specific edge behavior.',
    },
    time_limit_exceeded: {
        title: 'Complexity pressure',
        advice: 'Compare brute force and optimized complexity before running the solution.',
    },
    edge_case_failure: {
        title: 'Edge-case coverage',
        advice: 'List empty, duplicate, single-item, negative, and large-input cases before implementation.',
    },
    complexity_issue: {
        title: 'Complexity reasoning',
        advice: 'Name the bottleneck loop or data structure before choosing the final approach.',
    },
    syntax_or_compile_issue: {
        title: 'Implementation hygiene',
        advice: 'Run through function signature, return type, and variable names before submitting.',
    },
    pattern_misunderstanding: {
        title: 'Pattern recognition',
        advice: 'Write the reason this pattern applies before opening the editor.',
    },
    brute_force_only: {
        title: 'Optimization habit',
        advice: 'Start with brute force, then explicitly identify repeated work to remove.',
    },
}

const formatTask = ({ type, title, reason, impact = 'medium', minutes = 20, ...rest }) => ({
    type,
    title,
    reason,
    impact,
    estimatedMinutes: minutes,
    ...rest,
})

export async function recalculatePatternProgress(userId, patternSlug) {
    if (!patternSlug) return null

    const questions = await Question.find({ primaryPattern: patternSlug, isActive: true }).select('_id')
    const questionIds = questions.map((question) => question._id)
    const requiredCount = Math.max(questionIds.length, 1)

    const progressRows = await Progress.find({ userId, questionId: { $in: questionIds } })
    const submissions = await Submission.find({ userId, questionId: { $in: questionIds } }).sort({ createdAt: 1 })
    const mistakes = await MistakeInsight.find({ userId, questionId: { $in: questionIds } })
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
    const hintCount = submissions.reduce((sum, row) => sum + (row.hintCountAtSubmit || 0), 0)
    const mistakePenalty = Math.min(25, mistakes.reduce((sum, row) => sum + (row.severity || 1), 0) * 2)

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
    const hintPenalty = Math.min(10, hintCount * 2)
    const recentActivityBonus = submissions.at(-1)?.createdAt > addDays(new Date(), -14) ? 5 : 0
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

export async function updateCoachAfterSubmission({ userId, question, result, submission }) {
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
                    intervalDays: 1,
                    lastResult: 'failed',
                },
            },
            { upsert: true, new: true }
        )
    } else if (attemptsForQuestion > 1 || (submission?.hintCountAtSubmit || 0) > 0) {
        await RevisionItem.findOneAndUpdate(
            { userId, questionId: question._id, status: 'queued' },
            {
                $set: {
                    patternSlug,
                    reason: 'solved_with_hints',
                    dueAt: addDays(now, 2),
                    priority: 2,
                    intervalDays: 2,
                    lastResult: 'solved_with_support',
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
                    intervalDays: 7,
                    lastResult: 'clean_solve',
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
        tasks.push(formatTask({
            type: 'mixed',
            title: 'Mixed pattern practice',
            reason: 'Train pattern recognition without labels',
            impact: 'high',
            minutes: 25,
        }))
    }

    return {
        summary: {
            solved: progressRows.filter((row) => row.status === 'solved').length,
            attempted: progressRows.filter((row) => row.status === 'attempted' || row.status === 'needs_revision').length,
            strongPatterns,
            weakPatterns,
        },
        tasks: tasks.slice(0, 5),
        dueRevisions,
    }
}

export async function getDashboard(userId) {
    const [today, mastery, track, skillProfile] = await Promise.all([
        getTodayPlan(userId),
        getMastery(userId),
        LearningTrack.findOne({ slug: 'dsa-foundations-to-interview-ready' }),
        getSkillProfile(userId),
    ])

    return { today, mastery, track, skillProfile }
}

export async function recalculateAllProgress(userId) {
    const patterns = await Pattern.find({})
    return Promise.all(patterns.map((pattern) => recalculatePatternProgress(userId, pattern.slug)))
}

export async function getMistakes(userId) {
    const rows = await MistakeInsight.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('questionId', 'slug title topic difficulty primaryPattern')

    const byTag = {}
    const byPattern = {}
    for (const row of rows) {
        for (const tag of row.tags || []) byTag[tag] = (byTag[tag] || 0) + 1
        if (row.patternSlug) byPattern[row.patternSlug] = (byPattern[row.patternSlug] || 0) + 1
    }

    return {
        recent: rows,
        byTag: Object.entries(byTag)
            .map(([tag, count]) => ({ tag, count, ...(mistakeAdvice[tag] || { title: tag.replaceAll('_', ' '), advice: 'Review the failed submission and retry a smaller case.' }) }))
            .sort((a, b) => b.count - a.count),
        byPattern: Object.entries(byPattern).map(([patternSlug, count]) => ({ patternSlug, count })).sort((a, b) => b.count - a.count),
    }
}

export async function getNextActions(userId) {
    const today = await getTodayPlan(userId)
    return today.tasks
}

export async function getSkillProfile(userId) {
    const [mastery, mistakes, progressRows, submissions, revisions, reflections, misconceptions] = await Promise.all([
        getMastery(userId),
        getMistakes(userId),
        Progress.find({ userId }),
        Submission.find({ userId }).sort({ createdAt: 1 }).populate('questionId', 'slug title topic difficulty primaryPattern'),
        RevisionItem.find({ userId }),
        Reflection.find({ userId }).sort({ createdAt: -1 }).limit(100),
        getLearnerMisconceptions(userId),
    ])

    const solved = progressRows.filter((row) => row.status === 'solved').length
    const attempted = progressRows.filter((row) => row.status !== 'not_started').length
    const mediumHard = submissions.filter((row) => ['Medium', 'Hard'].includes(row.questionId?.difficulty))
    const accepted = submissions.filter((row) => row.status === 'accepted')
    const mixed = submissions.filter((row) => row.mode === 'mixed')
    const mixedAccepted = mixed.filter((row) => row.status === 'accepted')
    const mixedGuesses = mixed.filter((row) => row.patternGuess)
    const mixedCorrectGuesses = mixedGuesses.filter((row) => row.patternGuessCorrect)
    const hintTotal = submissions.reduce((sum, row) => sum + (row.hintCountAtSubmit || 0), 0)
    const mastered = mastery.filter((row) => row.masteryScore >= 75).length
    const revisionCompleted = revisions.filter((row) => row.status === 'completed').length
    const revisionQueued = revisions.filter((row) => row.status === 'queued').length

    const breadthScore = Math.min(35, mastered * 7)
    const successScore = submissions.length ? Math.round((accepted.length / submissions.length) * 25) : 0
    const mixedScore = mixed.length ? Math.round((mixedAccepted.length / mixed.length) * 15) : 0
    const hintScore = submissions.length ? Math.max(0, 15 - Math.round(hintTotal / submissions.length) * 3) : 5
    const revisionScore = revisions.length ? Math.round((revisionCompleted / revisions.length) * 10) : 3
    const reflectionScore = reflections.length
        ? Math.min(10, Math.round((reflections.filter((item) => (item.interviewExplanation || '').length > 40).length / reflections.length) * 10))
        : 0
    const readinessScore = Math.max(0, Math.min(100, breadthScore + successScore + mixedScore + hintScore + revisionScore + reflectionScore))
    const blockers = []
    if (mastered < 3) blockers.push('Build mastery in at least 3 core patterns.')
    if (mistakes.byTag[0]) blockers.push(`${mistakes.byTag[0].title}: ${mistakes.byTag[0].advice}`)
    if (revisionQueued > 3) blockers.push('Clear queued revisions before adding many new topics.')
    if (mixed.length < 3) blockers.push('Do more mixed practice to improve pattern recognition.')
    if (submissions.length && hintTotal / submissions.length > 1) blockers.push('Reduce hint dependency by writing the next invariant before asking the mentor.')

    const recommendedPlan = [
        revisionQueued > 0 && { type: 'revision', title: 'Clear due revision', reason: 'Retention improves when weak items are reviewed on schedule.', link: '/revision' },
        mistakes.byTag[0] && { type: 'habit', title: `Fix ${mistakes.byTag[0].title}`, reason: mistakes.byTag[0].advice, link: '/profile/skills' },
        { type: 'mixed', title: 'Run mixed pattern practice', reason: 'Practice identifying the pattern without labels.', link: '/practice/mixed?mode=mixed' },
        { type: 'interview', title: 'Take one mock interview', reason: 'Measure communication, correctness, edge cases, and timing together.', link: '/interview' },
    ].filter(Boolean).slice(0, 4)

    const trendMap = {}
    for (const submission of submissions) {
        const key = startOfWeek(submission.createdAt)
        if (!trendMap[key]) trendMap[key] = { week: key, submissions: 0, accepted: 0 }
        trendMap[key].submissions += 1
        if (submission.status === 'accepted') trendMap[key].accepted += 1
    }

    const readinessLevel = buildReadinessLevel({
        readinessScore,
        mastered,
        mixed,
        mixedGuesses,
        mixedCorrectGuesses,
        submissions,
        reflections,
        revisionQueued,
    })

    return {
        readinessScore,
        readinessLevel,
        solved,
        attempted,
        solveConsistency: submissions.length ? Math.round((accepted.length / submissions.length) * 100) : 0,
        revisionHealth: { completed: revisionCompleted, queued: revisionQueued },
        mistakeDistribution: mistakes.byTag,
        blockers,
        recommendedPlan,
        mixedPractice: {
            attempted: mixed.length,
            accepted: mixedAccepted.length,
            guesses: mixedGuesses.length,
            correctGuesses: mixedCorrectGuesses.length,
            recognitionAccuracy: mixedGuesses.length ? Math.round((mixedCorrectGuesses.length / mixedGuesses.length) * 100) : 0,
        },
        mediumHardAttempts: mediumHard.length,
        strengths: mastery.filter((row) => row.masteryScore >= 75).slice(0, 5),
        weakSpots: mastery.filter((row) => row.masteryScore < 60).slice(0, 5),
        mastery,
        progressTrend: Object.values(trendMap),
        misconceptions,
    }
}

function buildReadinessLevel({ readinessScore, mastered, mixed, mixedGuesses, mixedCorrectGuesses, submissions, reflections, revisionQueued }) {
    const levels = [
        {
            id: 'foundation_ready',
            label: 'Foundation Ready',
            requirements: [
                { label: 'Solve at least 3 problems', met: submissions.filter((row) => row.status === 'accepted').length >= 3 },
                { label: 'Keep revision queue below 5', met: revisionQueued < 5 },
            ],
        },
        {
            id: 'pattern_ready',
            label: 'Pattern Ready',
            requirements: [
                { label: 'Master at least 3 patterns', met: mastered >= 3 },
                { label: 'Submit at least 2 reflections', met: reflections.length >= 2 },
            ],
        },
        {
            id: 'mixed_practice_ready',
            label: 'Mixed Practice Ready',
            requirements: [
                { label: 'Attempt at least 3 mixed problems', met: mixed.length >= 3 },
                { label: 'Pattern recognition at least 60%', met: mixedGuesses.length > 0 && (mixedCorrectGuesses.length / mixedGuesses.length) >= 0.6 },
            ],
        },
        {
            id: 'interview_ready',
            label: 'Interview Ready',
            requirements: [
                { label: 'Readiness score at least 70%', met: readinessScore >= 70 },
                { label: 'Write at least 3 interview explanations', met: reflections.filter((item) => (item.interviewExplanation || '').length > 40).length >= 3 },
            ],
        },
        {
            id: 'job_ready_practice',
            label: 'Job-Ready Practice',
            requirements: [
                { label: 'Readiness score at least 85%', met: readinessScore >= 85 },
                { label: 'No urgent revision backlog', met: revisionQueued <= 1 },
            ],
        },
    ]

    const current = [...levels].reverse().find((level) => level.requirements.every((requirement) => requirement.met)) || levels[0]
    const next = levels.find((level) => !level.requirements.every((requirement) => requirement.met)) || levels.at(-1)
    return {
        current: current.id,
        label: current.label,
        score: readinessScore,
        levels,
        nextMissingRequirement: next.requirements.find((requirement) => !requirement.met)?.label || 'Maintain consistency with mixed practice and interviews.',
        recommendedAction: next.id === 'mixed_practice_ready' ? '/practice/mixed?mode=mixed' : next.id === 'interview_ready' ? '/interview' : '/session/today',
    }
}

export async function recordConceptCheckAttempt({ userId, conceptCheckId, selectedIndex }) {
    const check = await ConceptCheck.findById(conceptCheckId)
    if (!check) return null
    const attempt = await ConceptCheckAttempt.create({
        userId,
        conceptCheckId,
        patternSlug: check.patternSlug,
        selectedIndex,
        correct: selectedIndex === check.correctIndex,
    })
    await recordLearningEvent({
        userId,
        type: 'concept_check_attempted',
        metadata: { conceptCheckId, patternSlug: check.patternSlug, correct: attempt.correct },
    })
    return {
        attempt,
        correct: attempt.correct,
        explanation: check.explanation,
    }
}
