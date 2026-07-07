import { Progress } from '../progress/progress.model.js'
import { Submission } from '../submissions/submission.model.js'
import { RevisionItem } from '../revision/revisionItem.model.js'
import { MistakeInsight } from '../insights/mistakeInsight.model.js'
import { Reflection } from '../reflections/reflection.model.js'
import { User } from '../users/user.model.js'
import { SystemDesignAttempt } from '../systemDesign/systemDesignAttempt.model.js'
import { ConceptCheckAttempt } from '../conceptChecks/conceptCheckAttempt.model.js'
import { getLearnerMisconceptions } from '../misconceptions/misconception.service.js'
import { getMastery } from './mastery.service.js'
import { mistakeAdvice, readinessThresholds, startOfWeek } from './coach.config.js'

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

export function buildReadinessLevel({ readinessScore, mastered, mixed, mixedGuesses, mixedCorrectGuesses, submissions, reflections, revisionQueued, systemDesignAttempts = [] }) {
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
                { label: 'Master at least 3 patterns', met: mastered >= readinessThresholds.masteredPatternsForPatternReady },
                { label: 'Submit at least 2 reflections', met: reflections.length >= 2 },
            ],
        },
        {
            id: 'mixed_practice_ready',
            label: 'Mixed Practice Ready',
            requirements: [
                { label: 'Attempt at least 3 mixed problems', met: mixed.length >= readinessThresholds.mixedPracticeAttempts },
                { label: 'Pattern recognition at least 60%', met: mixedGuesses.length > 0 && (mixedCorrectGuesses.length / mixedGuesses.length) >= readinessThresholds.mixedRecognitionAccuracy },
            ],
        },
        {
            id: 'interview_ready',
            label: 'Interview Ready',
            requirements: [
                { label: 'Readiness score at least 70%', met: readinessScore >= readinessThresholds.interviewReadyScore },
                { label: 'Write at least 3 interview explanations', met: reflections.filter((item) => (item.interviewExplanation || '').length > 40).length >= 3 },
            ],
        },
        {
            id: 'system_design_foundation_ready',
            label: 'System Design Foundation Ready',
            requirements: [
                { label: 'Complete at least 1 system design attempt', met: systemDesignAttempts.length >= 1 },
                { label: 'Score at least 60% on a design drill', met: systemDesignAttempts.some((item) => (item.score || 0) >= 60) },
            ],
        },
        {
            id: 'job_ready_practice',
            label: 'Full Interview Ready',
            requirements: [
                { label: 'Readiness score at least 85%', met: readinessScore >= readinessThresholds.jobReadyScore },
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

export async function getSkillProfile(userId) {
    const [mastery, mistakes, progressRows, submissions, revisions, reflections, misconceptions, user, systemDesignAttempts, conceptAttempts] = await Promise.all([
        getMastery(userId),
        getMistakes(userId),
        Progress.find({ userId }),
        Submission.find({ userId }).sort({ createdAt: 1 }).populate('questionId', 'slug title topic difficulty primaryPattern'),
        RevisionItem.find({ userId }),
        Reflection.find({ userId }).sort({ createdAt: -1 }).limit(100),
        getLearnerMisconceptions(userId),
        User.findById(userId).select('onboarding'),
        SystemDesignAttempt.find({ userId }).sort({ createdAt: -1 }),
        ConceptCheckAttempt.find({ userId }).sort({ createdAt: -1 }).limit(100),
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
    const mediumHardAccepted = accepted.filter((row) => ['Medium', 'Hard'].includes(row.questionId?.difficulty))
    const hintDependency = submissions.length
        ? Math.round((hintTotal / submissions.length) * 100) / 100
        : 0
    const qualityReflections = reflections.filter((item) => (item.interviewExplanation || '').length > 40 && (item.keyInvariant || '').length > 15)
    const conceptCorrect = conceptAttempts.filter((item) => item.correct).length

    const breadthScore = Math.min(35, mastered * 7)
    const successScore = submissions.length ? Math.round((accepted.length / submissions.length) * 25) : 0
    const mixedScore = mixed.length ? Math.round((mixedAccepted.length / mixed.length) * 15) : 0
    const hintScore = submissions.length ? Math.max(0, 15 - Math.round(hintTotal / submissions.length) * 3) : 5
    const revisionScore = revisions.length ? Math.round((revisionCompleted / revisions.length) * 10) : 3
    const reflectionScore = reflections.length
        ? Math.min(10, Math.round((reflections.filter((item) => (item.interviewExplanation || '').length > 40).length / reflections.length) * 10))
        : 0
    const systemDesignScore = systemDesignAttempts.length ? Math.min(10, Math.round((systemDesignAttempts[0].score || 0) / 10)) : 0
    const readinessScore = Math.max(0, Math.min(100, breadthScore + successScore + mixedScore + hintScore + revisionScore + reflectionScore + systemDesignScore))
    const blockers = [
        mastered < 3 && 'Build mastery in at least 3 core patterns.',
        mistakes.byTag[0] && `${mistakes.byTag[0].title}: ${mistakes.byTag[0].advice}`,
        revisionQueued > 3 && 'Clear queued revisions before adding many new topics.',
        mixed.length < 3 && 'Do more mixed practice to improve pattern recognition.',
        user?.onboarding?.selectedTracks?.includes('system_design') && systemDesignAttempts.length === 0 && 'Complete one system design drill to build full interview readiness.',
        submissions.length && hintTotal / submissions.length > 1 && 'Reduce hint dependency by writing the next invariant before asking the mentor.',
    ].filter(Boolean)
    const recommendedPlan = [
        revisionQueued > 0 && { type: 'revision', title: 'Clear due revision', reason: 'Retention improves when weak items are reviewed on schedule.', link: '/revision' },
        mistakes.byTag[0] && { type: 'habit', title: `Fix ${mistakes.byTag[0].title}`, reason: mistakes.byTag[0].advice, link: '/profile/skills' },
        { type: 'mixed', title: 'Run mixed pattern practice', reason: 'Practice identifying the pattern without labels.', link: '/practice/mixed?mode=mixed' },
        user?.onboarding?.selectedTracks?.includes('system_design') && { type: 'system_design', title: 'Run a system design drill', reason: 'Full interviews test architecture tradeoffs alongside coding.', link: '/system-design' },
        { type: 'interview', title: 'Take one mock interview', reason: 'Measure communication, correctness, edge cases, and timing together.', link: '/interview' },
    ].filter(Boolean).slice(0, 4)

    const trendMap = {}
    for (const submission of submissions) {
        const key = startOfWeek(submission.createdAt)
        if (!trendMap[key]) trendMap[key] = { week: key, submissions: 0, accepted: 0 }
        trendMap[key].submissions += 1
        if (submission.status === 'accepted') trendMap[key].accepted += 1
    }
    const readinessLevel = buildReadinessLevel({ readinessScore, mastered, mixed, mixedGuesses, mixedCorrectGuesses, submissions, reflections, revisionQueued, systemDesignAttempts })
    const recognitionAccuracy = mixedGuesses.length ? Math.round((mixedCorrectGuesses.length / mixedGuesses.length) * 100) : 0
    const communicationScore = reflections.length ? Math.round((qualityReflections.length / reflections.length) * 100) : 0
    const revisionHealthScore = revisions.length ? Math.round((revisionCompleted / revisions.length) * 100) : revisionQueued ? 0 : 50
    const strongestPatterns = mastery.filter((row) => row.masteryScore >= 70).slice(0, 5)
    const weakSpots = mastery.filter((row) => row.masteryScore < 60).slice(0, 5)
    const completenessItems = [
        { key: 'onboarding', label: 'Complete onboarding', met: Boolean(user?.onboarding?.completed), action: '/onboarding' },
        { key: 'solves', label: 'Solve at least 5 problems', met: solved >= 5, action: '/practice' },
        { key: 'medium_hard', label: 'Accept 2 medium or hard problems', met: mediumHardAccepted.length >= 2, action: '/practice/mixed?mode=mixed' },
        { key: 'reflections', label: 'Write 3 strong reflections', met: qualityReflections.length >= 3, action: '/revision' },
        { key: 'concept_checks', label: 'Pass 5 concept checks', met: conceptCorrect >= 5, action: '/learn' },
        { key: 'mixed', label: 'Attempt 3 mixed problems', met: mixed.length >= 3, action: '/practice/mixed?mode=mixed' },
        { key: 'revision', label: 'Clear urgent revision backlog', met: revisionQueued <= 1, action: '/revision' },
    ]
    const profileCompleteness = {
        score: Math.round((completenessItems.filter((item) => item.met).length / completenessItems.length) * 100),
        items: completenessItems,
        missing: completenessItems.filter((item) => !item.met),
    }
    const badges = [
        { id: 'pattern_ready', label: 'Pattern Ready', earned: mastered >= 3, reason: 'Master at least 3 DSA patterns.' },
        { id: 'mixed_practice_ready', label: 'Mixed Practice Ready', earned: mixed.length >= 3 && recognitionAccuracy >= 60, reason: 'Attempt mixed practice and identify patterns accurately.' },
        { id: 'interview_ready', label: 'Interview Ready', earned: readinessScore >= 70 && qualityReflections.length >= 3, reason: 'Combine readiness score with clear interview explanations.' },
        { id: 'low_hint_solver', label: 'Low Hint Solver', earned: submissions.length >= 3 && hintDependency <= 1, reason: 'Keep average hint use at or below one per submission.' },
        { id: 'strong_reflector', label: 'Strong Reflector', earned: qualityReflections.length >= 3, reason: 'Write reflections with invariants and explanations.' },
        { id: 'system_design_starter', label: 'System Design Starter', earned: systemDesignAttempts.length >= 1, reason: 'Complete one system design attempt.' },
        { id: 'revision_consistent', label: 'Revision Consistent', earned: revisionCompleted >= 3 && revisionQueued <= 1, reason: 'Complete revisions and keep backlog low.' },
    ]
    const milestones = badges.map((badge) => ({
        ...badge,
        status: badge.earned ? 'earned' : 'locked',
    }))
    const nextUpgrade = completenessItems.find((item) => !item.met) || {
        key: 'maintain',
        label: 'Maintain consistency with mixed practice and interviews',
        action: '/session/today',
        met: false,
    }
    const proofPortfolio = {
        acceptedProblems: accepted.slice(-8).reverse().map((row) => ({
            title: row.questionId?.title || 'Accepted problem',
            slug: row.questionId?.slug,
            difficulty: row.questionId?.difficulty,
            patternSlug: row.questionId?.primaryPattern,
            solvedAt: row.createdAt,
        })),
        masteredPatterns: strongestPatterns.map((row) => ({
            slug: row.pattern.slug,
            name: row.pattern.name,
            score: row.masteryScore,
            status: row.status,
        })),
        reflections: qualityReflections.slice(0, 5).map((row) => ({
            patternUsed: row.patternUsed,
            keyInvariant: row.keyInvariant,
            confidenceAfterSolve: row.confidenceAfterSolve,
            createdAt: row.createdAt,
        })),
        conceptChecks: {
            attempted: conceptAttempts.length,
            correct: conceptCorrect,
            accuracy: conceptAttempts.length ? Math.round((conceptCorrect / conceptAttempts.length) * 100) : 0,
        },
        systemDesign: {
            attempts: systemDesignAttempts.length,
            bestScore: systemDesignAttempts.reduce((best, item) => Math.max(best, item.score || 0), 0),
            latest: systemDesignAttempts[0] || null,
        },
    }
    const growthTrend = Object.values(trendMap).map((item) => ({
        ...item,
        acceptanceRate: item.submissions ? Math.round((item.accepted / item.submissions) * 100) : 0,
    }))
    const profileSummary = {
        headline: `${readinessLevel.label} - ${readinessScore}% readiness`,
        learnerLevel: readinessLevel.label,
        readinessBadge: badges.find((badge) => badge.earned && badge.id.includes('ready'))?.label || readinessLevel.label,
        strength: strongestPatterns[0]?.pattern?.name || 'Skill signal forming',
        gap: weakSpots[0]?.pattern?.name || nextUpgrade.label,
        proof: accepted.length ? `${accepted.length} accepted solves with ${mastered} mastered patterns.` : 'Start solving to build visible proof.',
        nextAction: nextUpgrade.label,
    }

    return {
        onboarding: user?.onboarding || null,
        readinessScore,
        readinessLevel,
        profileSummary,
        badges,
        milestones,
        proofPortfolio,
        growthTrend,
        nextUpgrade,
        profileCompleteness,
        communicationScore,
        hintDependency,
        revisionHealthScore,
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
            recognitionAccuracy,
        },
        mediumHardAttempts: mediumHard.length,
        mediumHardAccepted: mediumHardAccepted.length,
        strengths: strongestPatterns,
        weakSpots,
        mastery,
        progressTrend: Object.values(trendMap),
        misconceptions,
        systemDesign: {
            attempts: systemDesignAttempts.length,
            bestScore: systemDesignAttempts.reduce((best, item) => Math.max(best, item.score || 0), 0),
            latest: systemDesignAttempts[0] || null,
        },
    }
}
