import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { submissionLimiter } from '../../middleware/rateLimiters.js'
import { Question } from '../questions/question.model.js'
import { Progress } from '../progress/progress.model.js'
import { runJudgedSubmission } from '../execution/execution.service.js'
import { Submission } from './submission.model.js'
import { updateCoachAfterSubmission } from '../coach/coach.service.js'
import { recordLearningOutcome } from '../insights/insight.service.js'
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
            patternGuess: z.string().optional(),
            edgeCases: z.string().optional(),
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

    const result = await runJudgedSubmission({ code, language, question })

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

    res.json({
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
