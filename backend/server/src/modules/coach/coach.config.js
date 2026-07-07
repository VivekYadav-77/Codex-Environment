export const revisionIntervals = {
    wrongAnswerDays: 1,
    supportedSolveDays: 2,
    cleanSolveDays: 7,
}

export const masteryWeights = {
    baseSolved: 75,
    firstTryBonus: 15,
    maxAttemptPenalty: 20,
    maxHintPenalty: 10,
    maxMistakePenalty: 25,
    recentActivityBonus: 5,
    recentActivityDays: 14,
}

export const readinessThresholds = {
    masteredPatternsForPatternReady: 3,
    mixedPracticeAttempts: 3,
    mixedRecognitionAccuracy: 0.6,
    interviewReadyScore: 70,
    jobReadyScore: 85,
}

export const mistakeAdvice = {
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

export const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)

export const startOfWeek = (date) => {
    const copy = new Date(date)
    const day = copy.getDay()
    copy.setHours(0, 0, 0, 0)
    copy.setDate(copy.getDate() - day)
    return copy.toISOString().slice(0, 10)
}
