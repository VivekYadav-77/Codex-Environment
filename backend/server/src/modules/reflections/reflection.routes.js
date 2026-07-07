import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { Question } from '../questions/question.model.js'
import { RevisionItem } from '../revision/revisionItem.model.js'
import { Reflection } from './reflection.model.js'
import { recordLearningEvent } from '../events/event.service.js'

const router = Router()
router.use(requireAuth)

const lookupQuestion = (value) => {
    const lookup = [{ slug: value }]
    if (/^[a-f\d]{24}$/i.test(value)) lookup.push({ _id: value })
    return { $or: lookup }
}

const reflectionSchema = z.object({
    body: z.object({
        questionId: z.string().min(1),
        submissionId: z.string().optional(),
        patternUsed: z.string().optional(),
        whyItWorked: z.string().optional(),
        keyInvariant: z.string().optional(),
        dangerousEdgeCase: z.string().optional(),
        interviewExplanation: z.string().optional(),
        confidenceAfterSolve: z.number().int().min(1).max(5).default(3),
    }),
    params: z.object({}),
    query: z.object({}),
})

router.post('/', validateRequest(reflectionSchema), asyncHandler(async (req, res) => {
    const question = await Question.findOne(lookupQuestion(req.body.questionId))
    if (!question) return res.status(404).json({ error: 'Question not found' })

    const reflection = await Reflection.create({
        ...req.body,
        userId: req.user._id,
        questionId: question._id,
    })

    await recordLearningEvent({
        userId: req.user._id,
        type: 'reflection_submitted',
        questionId: question._id,
        metadata: { confidenceAfterSolve: reflection.confidenceAfterSolve },
    })

    if (reflection.confidenceAfterSolve <= 2) {
        await RevisionItem.findOneAndUpdate(
            { userId: req.user._id, questionId: question._id, status: 'queued' },
            {
                $set: {
                    patternSlug: question.primaryPattern || question.patterns?.[0] || 'general',
                    reason: 'manual',
                    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    priority: 1,
                    intervalDays: 1,
                    lastResult: 'low_confidence_reflection',
                },
            },
            { upsert: true, new: true }
        )
    }

    res.status(201).json(reflection)
}))

router.get('/me/:questionId', asyncHandler(async (req, res) => {
    const question = await Question.findOne(lookupQuestion(req.params.questionId))
    if (!question) return res.status(404).json({ error: 'Question not found' })
    const reflections = await Reflection.find({ userId: req.user._id, questionId: question._id }).sort({ createdAt: -1 })
    res.json(reflections)
}))

export default router
