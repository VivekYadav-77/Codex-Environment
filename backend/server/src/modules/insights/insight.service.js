import { MistakeInsight } from './mistakeInsight.model.js'
import { LearningTimelineEvent } from '../timeline/learningTimelineEvent.model.js'

const severityByTag = {
    wrong_answer: 2,
    runtime_error: 2,
    time_limit_exceeded: 3,
    edge_case_failure: 2,
    complexity_issue: 3,
    syntax_or_compile_issue: 1,
    pattern_misunderstanding: 2,
    brute_force_only: 1,
}

export function detectMistakeTags({ result, question, hintCountAtSubmit = 0 }) {
    const tags = new Set()
    if (result.status !== 'accepted') tags.add(result.status)
    if (result.status === 'compile_error') tags.add('syntax_or_compile_issue')
    if (result.status === 'time_limit_exceeded') tags.add('complexity_issue')

    const failed = result.testResults?.filter((test) => !test.passed) || []
    if (failed.some((test) => /edge|empty|duplicate|negative|single|large/i.test(`${test.category || ''} ${test.name || ''}`))) {
        tags.add('edge_case_failure')
    }
    if (failed.some((test) => /performance|large|timeout/i.test(`${test.category || ''} ${test.name || ''}`))) {
        tags.add('complexity_issue')
    }
    if (result.status === 'wrong_answer' && question?.primaryPattern) tags.add('pattern_misunderstanding')
    if (result.status === 'accepted' && hintCountAtSubmit > 0) tags.add('brute_force_only')

    return [...tags]
}

export async function recordLearningOutcome({ userId, question, submission, result, mode = 'practice', hintCountAtSubmit = 0 }) {
    const tags = submission.mistakeTags?.length
        ? submission.mistakeTags
        : detectMistakeTags({ result, question, hintCountAtSubmit })

    if (tags.length) {
        await MistakeInsight.create({
            userId,
            questionId: question._id,
            submissionId: submission._id,
            patternSlug: question.primaryPattern || question.patterns?.[0],
            tags,
            severity: Math.max(...tags.map((tag) => severityByTag[tag] || 1)),
            summary: tags.map((tag) => tag.replaceAll('_', ' ')).join(', '),
            mode,
        })
    }

    await LearningTimelineEvent.create({
        userId,
        questionId: question._id,
        submissionId: submission._id,
        type: result.status === 'accepted' ? 'accepted' : 'submission_result',
        title: result.status === 'accepted' ? 'Accepted solution' : 'Submission attempt',
        details: {
            status: result.status,
            passedCount: result.passedCount,
            totalCount: result.totalCount,
            runtimeMs: result.runtimeMs,
            tags,
            mode,
        },
    })

    return tags
}
