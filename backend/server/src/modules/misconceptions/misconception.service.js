import { MistakeInsight } from '../insights/mistakeInsight.model.js'
import { Submission } from '../submissions/submission.model.js'
import { Reflection } from '../reflections/reflection.model.js'
import { Misconception } from './misconception.model.js'

export const defaultMisconceptions = [
    {
        slug: 'hash-map-duplicate-handling',
        title: 'Hash map duplicate handling',
        description: 'The solution misses duplicate or repeated-value cases.',
        detectionTags: ['edge_case_failure'],
        patternSlugs: ['hash-map-lookup'],
        correction: 'Store and check values in the correct order so duplicates are handled intentionally.',
        recommendedAction: 'Solve one hash-map problem and list duplicate cases before coding.',
    },
    {
        slug: 'edge-cases-skipped',
        title: 'Edge cases skipped',
        description: 'The solution works on examples but fails boundary or unusual cases.',
        detectionTags: ['edge_case_failure', 'wrong_answer'],
        patternSlugs: [],
        correction: 'Write edge cases before coding: empty, one item, duplicates, negative values, and large input.',
        recommendedAction: 'Add an edge-case checklist to your next guided practice.',
    },
    {
        slug: 'complexity-underestimated',
        title: 'Complexity underestimated',
        description: 'The approach likely has more repeated work than expected.',
        detectionTags: ['complexity_issue', 'time_limit_exceeded'],
        patternSlugs: [],
        correction: 'Find the nested repeated work and replace it with a data structure or monotonic search.',
        recommendedAction: 'Compare brute force vs optimized complexity before submitting.',
    },
    {
        slug: 'label-driven-pattern-choice',
        title: 'Pattern chosen from label, not signal',
        description: 'The learner relies on topic labels instead of recognizing pattern signals.',
        detectionTags: ['pattern_misunderstanding'],
        patternSlugs: [],
        correction: 'Name the input signal, invariant, or repeated operation that points to the pattern.',
        recommendedAction: 'Do mixed practice and write a pattern guess before coding.',
    },
    {
        slug: 'binary-search-monotonic-confusion',
        title: 'Binary search monotonic-condition confusion',
        description: 'Binary search is used without a clear monotonic condition.',
        detectionTags: ['pattern_misunderstanding'],
        patternSlugs: ['binary-search'],
        correction: 'Binary search needs a yes/no condition that stays true on one side of the answer.',
        recommendedAction: 'Practice one answer-space binary search concept check.',
    },
    {
        slug: 'brute-force-not-optimized',
        title: 'Brute force not optimized',
        description: 'The learner stops after a simple approach and does not remove repeated work.',
        detectionTags: ['brute_force_only'],
        patternSlugs: [],
        correction: 'After brute force, ask what work is repeated and what can remember or skip it.',
        recommendedAction: 'Rewrite the optimized idea before running tests.',
    },
    {
        slug: 'weak-interview-explanation',
        title: 'Weak interview explanation',
        description: 'The learner may solve code but cannot explain invariant, complexity, or edge cases clearly.',
        detectionTags: [],
        patternSlugs: [],
        correction: 'Use a short structure: pattern, invariant, complexity, edge case.',
        recommendedAction: 'Submit a post-solve reflection with an interview explanation.',
    },
]

export async function ensureDefaultMisconceptions() {
    await Promise.all(defaultMisconceptions.map((item) => (
        Misconception.findOneAndUpdate({ slug: item.slug }, { $setOnInsert: item }, { upsert: true, new: true })
    )))
}

export async function getLearnerMisconceptions(userId) {
    await ensureDefaultMisconceptions()
    const [mistakes, submissions, reflections] = await Promise.all([
        MistakeInsight.find({ userId }).sort({ createdAt: -1 }).limit(200),
        Submission.find({ userId }).sort({ createdAt: -1 }).limit(200),
        Reflection.find({ userId }).sort({ createdAt: -1 }).limit(100),
    ])
    const tagCounts = mistakes.reduce((acc, mistake) => {
        for (const tag of mistake.tags || []) acc[tag] = (acc[tag] || 0) + 1
        return acc
    }, {})
    const patternCounts = mistakes.reduce((acc, mistake) => {
        if (mistake.patternSlug) acc[mistake.patternSlug] = (acc[mistake.patternSlug] || 0) + 1
        return acc
    }, {})

    const misconceptions = await Misconception.find({ isActive: true })
    return misconceptions
        .map((item) => {
            const tagScore = item.detectionTags.reduce((sum, tag) => sum + (tagCounts[tag] || 0), 0)
            const patternScore = item.patternSlugs.reduce((sum, slug) => sum + (patternCounts[slug] || 0), 0)
            const guessMismatch = item.slug === 'label-driven-pattern-choice'
                ? submissions.filter((row) => row.patternGuess && row.patternGuessCorrect === false).length
                : 0
            const lowConfidence = item.slug === 'weak-interview-explanation'
                ? reflections.filter((row) => row.confidenceAfterSolve <= 2 || (row.interviewExplanation || '').length < 40).length
                : 0
            const hintEvidence = item.slug === 'brute-force-not-optimized'
                ? submissions.filter((row) => (row.hintCountAtSubmit || 0) >= 2).length
                : 0
            const evidenceCount = tagScore + patternScore + guessMismatch + lowConfidence + hintEvidence
            const confidence = evidenceCount >= 5 ? 'high' : evidenceCount >= 2 ? 'medium' : 'low'
            const relatedSubmissions = submissions
                .filter((row) => item.patternSlugs.includes(row.questionId?.primaryPattern) || (row.mistakeTags || []).some((tag) => item.detectionTags.includes(tag)) || (item.slug === 'label-driven-pattern-choice' && row.patternGuessCorrect === false))
                .slice(0, 5)
                .map((row) => row._id)
            const relatedPatterns = [...new Set(mistakes.filter((row) => row.patternSlug && item.detectionTags.some((tag) => row.tags?.includes(tag))).map((row) => row.patternSlug))]
            const lastSeenAt = mistakes.find((row) => item.detectionTags.some((tag) => row.tags?.includes(tag)))?.createdAt
            return { ...item.toObject(), evidenceCount, confidence, relatedSubmissions, relatedPatterns, lastSeenAt }
        })
        .filter((item) => item.evidenceCount > 0 || item.slug === 'weak-interview-explanation')
        .sort((a, b) => b.evidenceCount - a.evidenceCount)
        .slice(0, 6)
}
