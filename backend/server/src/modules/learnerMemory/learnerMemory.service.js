import { Submission } from '../submissions/submission.model.js'
import { MistakeInsight } from '../insights/mistakeInsight.model.js'
import { Reflection } from '../reflections/reflection.model.js'
import { LearnerMemory } from './learnerMemory.model.js'

const topEntries = (items, key) => Object.entries(items.reduce((acc, item) => {
    const value = item[key]
    if (value) acc[value] = (acc[value] || 0) + 1
    return acc
}, {})).map(([value, count]) => ({ [key]: value, count })).sort((a, b) => b.count - a.count).slice(0, 5)

export async function rebuildLearnerMemory(userId) {
    const [submissions, mistakes, reflections] = await Promise.all([
        Submission.find({ userId }).sort({ createdAt: -1 }).limit(200),
        MistakeInsight.find({ userId }).sort({ createdAt: -1 }).limit(200),
        Reflection.find({ userId }).sort({ createdAt: -1 }).limit(100),
    ])

    const mistakeCounts = {}
    for (const mistake of mistakes) {
        for (const tag of mistake.tags || []) mistakeCounts[tag] = (mistakeCounts[tag] || 0) + 1
    }
    const recurringMistakes = Object.entries(mistakeCounts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 5)
    const weakPatterns = topEntries(mistakes, 'patternSlug')
    const hintDependency = submissions.length
        ? Math.round((submissions.reduce((sum, row) => sum + (row.hintCountAtSubmit || 0), 0) / submissions.length) * 100) / 100
        : 0
    const mixedGuesses = submissions.filter((row) => row.mode === 'mixed' && row.patternGuess)
    const correctGuesses = mixedGuesses.filter((row) => row.patternGuessCorrect)
    const patternRecognitionAccuracy = mixedGuesses.length ? Math.round((correctGuesses.length / mixedGuesses.length) * 100) : 0
    const qualityReflections = reflections.filter((row) => (row.interviewExplanation || '').length > 60 && (row.keyInvariant || '').length > 20)
    const reflectionQuality = reflections.length ? Math.round((qualityReflections.length / reflections.length) * 100) : 0
    const communicationWeakness = reflections.length > 0 && reflectionQuality < 50
    const recentImprovementSignals = []
    if (patternRecognitionAccuracy >= 60) recentImprovementSignals.push('Pattern recognition is becoming reliable.')
    if (hintDependency <= 1 && submissions.length >= 3) recentImprovementSignals.push('Hint dependency is under control.')
    if (reflectionQuality >= 60) recentImprovementSignals.push('Interview explanations are improving.')

    const summaryParts = [
        recurringMistakes[0] ? `Most common mistake: ${recurringMistakes[0].tag}.` : 'Not enough mistake history yet.',
        weakPatterns[0] ? `Weak pattern: ${weakPatterns[0].patternSlug}.` : '',
        communicationWeakness ? 'Needs stronger interview explanations.' : 'Communication signal is acceptable or still forming.',
    ].filter(Boolean)

    return LearnerMemory.findOneAndUpdate(
        { userId },
        {
            $set: {
                recurringMistakes,
                weakPatterns,
                hintDependency,
                reflectionQuality,
                patternRecognitionAccuracy,
                communicationWeakness,
                recentImprovementSignals,
                summary: summaryParts.join(' '),
            },
        },
        { upsert: true, new: true }
    )
}

export async function getLearnerMemory(userId) {
    return LearnerMemory.findOne({ userId }) || rebuildLearnerMemory(userId)
}
