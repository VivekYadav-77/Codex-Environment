import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { submissionLimiter } from '../../middleware/rateLimiters.js'
import { Question } from '../questions/question.model.js'
import { Progress } from '../progress/progress.model.js'
import { runExecutionJob } from '../execution/executionQueue.service.js'
import { Submission } from './submission.model.js'
import { updateCoachAfterSubmission } from '../coach/coach.service.js'
import { recordLearningOutcome } from '../insights/insight.service.js'
import { recordLearningEvent } from '../events/event.service.js'
import { rebuildLearnerMemory } from '../learnerMemory/learnerMemory.service.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { z } from 'zod'

const router = Router()

router.use(requireAuth)

const questionLookup = (value) => {
    const lookup = [{ slug: value }]
    if (/^[a-f\d]{24}$/i.test(value)) lookup.push({ _id: value })
    return { $or: lookup }
}

const runSubmissionSchema = z.object({
    body: z.object({
        questionId: z.string().min(1),
        language: z.enum(['javascript', 'python']),
        code: z.string().min(1).max(50000),
        hintCountAtSubmit: z.number().int().min(0).max(100).optional(),
        approachSnapshot: z.object({
            bruteForce: z.string().optional(),
            optimized: z.string().optional(),
            restatedProblem: z.string().optional(),
            constraints: z.string().optional(),
            patternGuess: z.string().optional(),
            edgeCases: z.string().optional(),
            confidenceBeforeSubmit: z.number().int().min(1).max(5).optional(),
            timeComplexity: z.string().optional(),
            spaceComplexity: z.string().optional(),
        }).optional(),
        patternGuess: z.string().optional(),
        mode: z.enum(['practice', 'mixed', 'interview', 'revision']).optional(),
    }),
    params: z.object({}),
    query: z.object({}),
})

router.post('/run', submissionLimiter, validateRequest(runSubmissionSchema), asyncHandler(async (req, res) => {
    const { questionId, language, code, hintCountAtSubmit = 0, approachSnapshot, patternGuess, mode = 'practice' } = req.body

    const question = await Question.findOne(questionLookup(questionId))

    if (!question) {
        return res.status(404).json({ error: 'Question not found' })
    }

    const planning = approachSnapshot || {}
    const missing = []
    if (mode === 'mixed') {
        if (!planning.patternGuess && !patternGuess) missing.push('pattern guess')
        if (!planning.bruteForce) missing.push('brute force idea')
        if (!planning.optimized) missing.push('optimized idea')
        if (!planning.edgeCases) missing.push('edge cases')
    }
    if (mode === 'interview') {
        if (!planning.restatedProblem) missing.push('restated problem')
        if (!planning.constraints) missing.push('constraints')
        if (!planning.patternGuess && !patternGuess) missing.push('pattern guess')
        if (!planning.timeComplexity) missing.push('time complexity')
        if (!planning.edgeCases) missing.push('edge cases')
    }
    if (missing.length) {
        return res.status(400).json({ error: `Please complete required planning fields before running: ${missing.join(', ')}.` })
    }

    const { job, result } = await runExecutionJob({ userId: req.user._id, code, language, question })

    await recordLearningEvent({
        userId: req.user._id,
        type: 'test_run_submitted',
        questionId: question._id,
        metadata: { mode, language, patternGuess: patternGuess || approachSnapshot?.patternGuess },
    })

    const submission = await Submission.create({
        userId: req.user._id,
        questionId: question._id,
        language,
        code,
        status: result.status,
        testResults: result.testResults,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        runtimeMs: result.runtimeMs,
        hintCountAtSubmit,
        approachSnapshot,
        patternGuess: patternGuess || approachSnapshot?.patternGuess,
        patternGuessCorrect: Boolean((patternGuess || approachSnapshot?.patternGuess) && question.primaryPattern && (patternGuess || approachSnapshot?.patternGuess)?.toLowerCase().trim() === question.primaryPattern.toLowerCase()),
        mode,
    })

    const mistakeTags = await recordLearningOutcome({
        userId: req.user._id,
        question,
        submission,
        result,
        mode,
        hintCountAtSubmit,
    })

    if (mistakeTags.length) {
        submission.mistakeTags = mistakeTags
        await submission.save()
    }

    if (approachSnapshot && Object.values(approachSnapshot).some(Boolean)) {
        await recordLearningEvent({
            userId: req.user._id,
            type: 'approach_written',
            questionId: question._id,
            metadata: { fields: Object.keys(approachSnapshot).filter((key) => approachSnapshot[key]) },
        })
    }

    if (submission.patternGuess) {
        await recordLearningEvent({
            userId: req.user._id,
            type: 'pattern_guess_submitted',
            questionId: question._id,
            metadata: { guess: submission.patternGuess, correct: submission.patternGuessCorrect },
        })
    }

    await recordLearningEvent({
        userId: req.user._id,
        type: 'submission_analyzed',
        questionId: question._id,
        metadata: { status: result.status, mistakeTags, mode },
    })

    await Progress.findOneAndUpdate(
        { userId: req.user._id, questionId: question._id },
        {
            $set: {
                status: result.status === 'accepted' ? 'solved' : 'attempted',
                bestLanguage: result.status === 'accepted' ? language : undefined,
                lastSubmittedAt: new Date(),
                topic: question.topic,
                difficulty: question.difficulty,
                ...(result.status === 'accepted' ? { solvedAt: new Date() } : {}),
            },
            $inc: { attempts: 1 },
        },
        { upsert: true, new: true }
    )

    const patternProgress = await updateCoachAfterSubmission({
        userId: req.user._id,
        question,
        result,
        submission,
    })
    await rebuildLearnerMemory(req.user._id)

    res.json({
        executionJobId: job._id,
        submissionId: submission._id,
        status: result.status,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        runtimeMs: result.runtimeMs,
        testResults: result.testResults,
        error: result.error,
        mistakeTags,
        revealedPattern: mode === 'mixed' ? {
            slug: question.primaryPattern,
            guess: submission.patternGuess || null,
            correctGuess: submission.patternGuessCorrect || false,
            reason: question.coachTags?.length
                ? `Look for ${question.coachTags.join(', ')} signals.`
                : 'The required data-access pattern matches this problem structure.',
        } : undefined,
        patternProgress,
    })
}))

router.get('/me', asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('questionId', 'slug title topic difficulty')

    res.json(submissions)
}))

router.get('/me/:questionId', asyncHandler(async (req, res) => {
    const question = await Question.findOne(questionLookup(req.params.questionId))

    if (!question) {
        return res.status(404).json({ error: 'Question not found' })
    }

    const submissions = await Submission.find({ userId: req.user._id, questionId: question._id }).sort({ createdAt: -1 })
    res.json(submissions)
}))

export default router
