import { ConceptCheck } from '../conceptChecks/conceptCheck.model.js'
import { Pattern } from '../patterns/pattern.model.js'
import { Question } from '../questions/question.model.js'

const hasText = (value, min = 20) => typeof value === 'string' && value.trim().length >= min
const hasList = (value, min = 1) => Array.isArray(value) && value.length >= min

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
    add('official_solution', question.officialSolution?.optimizedApproach || question.officialSolution?.code?.javascript || question.officialSolution?.code?.python, 'Official solution')
    add('brute_force', hasText(question.officialSolution?.bruteForceApproach, 40), 'Brute-force explanation')
    add('complexity_depth', hasText(question.officialSolution?.complexityExplanation, 30), 'Complexity explanation')
    add('interview_depth', hasText(question.officialSolution?.interviewExplanation, 40), 'Interview explanation')
    add('pattern_signals', question.officialSolution?.patternSignals?.length || question.coachTags?.length, 'Pattern signals')
    add('misconception_mapping', question.officialSolution?.misconceptionSlugs?.length, 'Misconception mapping')
    const conceptChecks = question.primaryPattern ? await ConceptCheck.countDocuments({ patternSlug: question.primaryPattern, isActive: true }) : 0
    add('concept_checks', conceptChecks > 0, 'Concept checks')
    add('reflection_guidance', question.coachTags?.length || question.lessonRefs?.length, 'Reflection or lesson guidance')
    add('learning_objectives', hasList(question.learningObjectives, 2), 'Learning objectives')
    add('worked_example', hasText(question.workedExample?.body, 30), 'Worked example')
    add('edge_cases', hasList(question.edgeCases, 2), 'Edge-case guidance')
    add('revision_prompts', hasList(question.revisionPrompts, 2), 'Revision prompts')
    add('profile_signals', hasList(question.profileSignals, 2), 'Profile signals')

    const passed = checks.filter((check) => check.passed).length
    return {
        slug: question.slug,
        title: question.title,
        score: Math.round((passed / checks.length) * 100),
        publishReady: Math.round((passed / checks.length) * 100) >= 80,
        checks,
        missing: checks.filter((check) => !check.passed).map((check) => check.label),
    }
}

export async function scorePatternQuality(pattern) {
    const checks = []
    const add = (key, passed, label) => checks.push({ key, passed: Boolean(passed), label })
    const conceptChecks = await ConceptCheck.countDocuments({ patternSlug: pattern.slug, isActive: true })

    add('description', hasText(pattern.description, 30), 'Clear description')
    add('objectives', hasList(pattern.learningObjectives, 3), 'Learning objectives')
    add('beginner_explanation', hasText(pattern.beginnerExplanation, 60), 'Beginner explanation')
    add('mental_model', hasText(pattern.mentalModel, 30), 'Mental model')
    add('signals', hasList(pattern.signalRules, 2), 'Pattern signals')
    add('anti_signals', hasList(pattern.antiSignals, 1), 'Anti-signals')
    add('worked_example', hasText(pattern.workedExample?.body, 40), 'Worked example')
    add('visual_steps', hasList(pattern.visualSteps, 3), 'Visual walkthrough')
    add('brute_force_to_optimized', hasText(pattern.bruteForceToOptimized, 50), 'Brute-force to optimized path')
    add('template', hasText(pattern.templateNotes, 20) || pattern.codeTemplate?.javascript, 'Code template notes')
    add('complexity', hasText(pattern.complexityReasoning?.body, 40), 'Complexity reasoning')
    add('mistakes', hasList(pattern.commonMistakes, 2), 'Common mistakes')
    add('misconceptions', hasList(pattern.misconceptions, 1), 'Misconceptions')
    add('edge_cases', hasList(pattern.edgeCases, 2), 'Edge cases')
    add('practice_ladder', hasList(pattern.practiceLadder, 3), 'Practice ladder')
    add('revision_prompts', hasList(pattern.revisionPrompts, 2), 'Revision prompts')
    add('concept_checks', conceptChecks >= 3, 'Three concept checks')

    const passed = checks.filter((check) => check.passed).length
    return {
        slug: pattern.slug,
        title: pattern.name,
        score: Math.round((passed / checks.length) * 100),
        publishReady: Math.round((passed / checks.length) * 100) >= 85,
        checks,
        missing: checks.filter((check) => !check.passed).map((check) => check.label),
    }
}

export async function auditCourseDepth() {
    const [patterns, questions] = await Promise.all([
        Pattern.find({}).sort({ order: 1 }),
        Question.find({ isActive: true }).sort({ learningOrder: 1 }),
    ])
    const [patternScores, questionScores] = await Promise.all([
        Promise.all(patterns.map(scorePatternQuality)),
        Promise.all(questions.map(scoreQuestionQuality)),
    ])
    const allScores = [...patternScores, ...questionScores]
    const averageScore = allScores.length
        ? Math.round(allScores.reduce((sum, item) => sum + item.score, 0) / allScores.length)
        : 0

    return {
        averageScore,
        patternCount: patternScores.length,
        questionCount: questionScores.length,
        publishReady: allScores.every((item) => item.publishReady),
        weakestPatterns: [...patternScores].sort((a, b) => a.score - b.score).slice(0, 5),
        weakestQuestions: [...questionScores].sort((a, b) => a.score - b.score).slice(0, 5),
    }
}
