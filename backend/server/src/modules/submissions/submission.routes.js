import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { submissionLimiter } from '../../middleware/rateLimiters.js'
import { Question } from '../questions/question.model.js'
import { Progress } from '../progress/progress.model.js'
import { runJudgedSubmission } from '../execution/execution.service.js'
import { Submission } from './submission.model.js'

const router = Router()

router.use(requireAuth)

const questionLookup = (value) => {
    const lookup = [{ slug: value }]
    if (/^[a-f\d]{24}$/i.test(value)) lookup.push({ _id: value })
    return { $or: lookup }
}

router.post('/run', submissionLimiter, asyncHandler(async (req, res) => {
    const { questionId, language, code } = req.body

    if (!questionId || !language || !code) {
        return res.status(400).json({ error: 'questionId, language, and code are required' })
    }

    if (!['javascript', 'python'].includes(language)) {
        return res.status(400).json({ error: 'Only JavaScript and Python are supported in V1 judging' })
    }

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

    res.json({
        submissionId: submission._id,
        status: result.status,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        runtimeMs: result.runtimeMs,
        testResults: result.testResults,
        error: result.error,
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
