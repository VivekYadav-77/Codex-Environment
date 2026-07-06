import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { Progress } from './progress.model.js'
import { Question } from '../questions/question.model.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { z } from 'zod'

const router = Router()

router.use(requireAuth)

const questionLookup = (value) => {
    const lookup = [{ slug: value }]
    if (/^[a-f\d]{24}$/i.test(value)) lookup.push({ _id: value })
    return { $or: lookup }
}

router.get('/me', asyncHandler(async (req, res) => {
    const progress = await Progress.find({ userId: req.user._id }).sort({ updatedAt: -1 })
    res.json(progress)
}))

router.get('/me/summary', asyncHandler(async (req, res) => {
    const rows = await Progress.find({ userId: req.user._id })
    const totalQuestions = await Question.countDocuments({ isActive: true })

    const byTopic = rows.reduce((acc, row) => {
        if (!acc[row.topic]) acc[row.topic] = { solved: 0, attempted: 0 }
        if (row.status === 'solved') acc[row.topic].solved += 1
        if (row.status === 'attempted' || row.status === 'needs_revision') acc[row.topic].attempted += 1
        return acc
    }, {})

    res.json({
        totalQuestions,
        solved: rows.filter((row) => row.status === 'solved').length,
        attempted: rows.filter((row) => row.status === 'attempted' || row.status === 'needs_revision').length,
        byTopic,
    })
}))

const updateProgressSchema = z.object({
    body: z.object({
        status: z.enum(['not_started', 'attempted', 'solved', 'needs_revision']),
    }),
    params: z.object({
        questionId: z.string().min(1),
    }),
    query: z.object({}),
})

router.patch('/me/:questionId', validateRequest(updateProgressSchema), asyncHandler(async (req, res) => {
    const question = await Question.findOne(questionLookup(req.params.questionId))

    if (!question) {
        return res.status(404).json({ error: 'Question not found' })
    }

    const status = req.body.status

    const progress = await Progress.findOneAndUpdate(
        { userId: req.user._id, questionId: question._id },
        {
            $set: {
                status,
                topic: question.topic,
                difficulty: question.difficulty,
                lastSubmittedAt: new Date(),
                ...(status === 'solved' ? { solvedAt: new Date() } : {}),
            },
        },
        { upsert: true, new: true }
    )

    res.json(progress)
}))

export default router
