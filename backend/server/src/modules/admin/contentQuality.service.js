import { ConceptCheck } from '../conceptChecks/conceptCheck.model.js'

export async function scoreQuestionQuality(question) {
    const checks = []
    const add = (key, passed, label) => checks.push({ key, passed: Boolean(passed), label })

    add('description', question.description?.length >= 40, 'Clear problem description')
    add('starter_code', question.starterCode?.javascript || question.starterCode?.python, 'Starter code')
    add('function_name', question.functionName, 'Judge function name')
    add('visible_tests', question.testCases?.some((test) => test.visible), 'Visible test cases')
    add('hidden_tests', question.testCases?.some((test) => !test.visible), 'Hidden test cases')
    add('edge_tests', question.testCases?.some((test) => /edge|empty|duplicate|single|negative|large/i.test(`${test.category || ''} ${test.name || ''}`)), 'Edge-case tests')
    add('primary_pattern', question.primaryPattern, 'Primary pattern')
    add('hints', question.hints?.length >= 2, 'At least two hints')
    const conceptChecks = question.primaryPattern ? await ConceptCheck.countDocuments({ patternSlug: question.primaryPattern, isActive: true }) : 0
    add('concept_checks', conceptChecks > 0, 'Concept checks')
    add('reflection_guidance', question.coachTags?.length || question.lessonRefs?.length, 'Reflection or lesson guidance')

    const passed = checks.filter((check) => check.passed).length
    return {
        score: Math.round((passed / checks.length) * 100),
        publishReady: passed >= 8,
        checks,
        missing: checks.filter((check) => !check.passed).map((check) => check.label),
    }
}
