export { getMastery, recalculateAllProgress, recalculatePatternProgress } from './mastery.service.js'
export { getDashboard, getNextActions, getTodayPlan } from './recommendation.service.js'
export { getMistakes, getSkillProfile } from './readiness.service.js'
export { updateCoachAfterSubmission } from './revision.service.js'

import { ConceptCheck } from '../conceptChecks/conceptCheck.model.js'
import { ConceptCheckAttempt } from '../conceptChecks/conceptCheckAttempt.model.js'
import { recordLearningEvent } from '../events/event.service.js'

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
