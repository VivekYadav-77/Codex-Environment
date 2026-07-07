import { Submission } from '../submissions/submission.model.js'
import { RevisionItem } from '../revision/revisionItem.model.js'
import { addDays, revisionIntervals } from './coach.config.js'
import { recalculatePatternProgress } from './mastery.service.js'

export async function updateCoachAfterSubmission({ userId, question, result, submission }) {
    const patternSlug = question.primaryPattern || question.patterns?.[0]
    if (!patternSlug) return null

    const attemptsForQuestion = await Submission.countDocuments({ userId, questionId: question._id })
    const now = new Date()
    const revisionPayload = result.status !== 'accepted'
        ? { reason: 'wrong_answer', dueAt: addDays(now, revisionIntervals.wrongAnswerDays), priority: 1, intervalDays: revisionIntervals.wrongAnswerDays, lastResult: 'failed' }
        : attemptsForQuestion > 1 || (submission?.hintCountAtSubmit || 0) > 0
            ? { reason: 'solved_with_hints', dueAt: addDays(now, revisionIntervals.supportedSolveDays), priority: 2, intervalDays: revisionIntervals.supportedSolveDays, lastResult: 'solved_with_support' }
            : { reason: 'stale_mastery', dueAt: addDays(now, revisionIntervals.cleanSolveDays), priority: 4, intervalDays: revisionIntervals.cleanSolveDays, lastResult: 'clean_solve' }

    await RevisionItem.findOneAndUpdate(
        { userId, questionId: question._id, status: 'queued' },
        { $set: { patternSlug, ...revisionPayload } },
        { upsert: true, new: true }
    )

    return recalculatePatternProgress(userId, patternSlug)
}
