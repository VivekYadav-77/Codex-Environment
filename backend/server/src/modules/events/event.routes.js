import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { LearningEvent, eventTypes } from './learningEvent.model.js'
import { getEventSummary, recordLearningEvent } from './event.service.js'

const router = Router()
router.use(requireAuth)

const eventSchema = z.object({
    body: z.object({
        type: z.enum(eventTypes),
        questionId: z.string().optional(),
        sessionId: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
    }),
    params: z.object({}),
    query: z.object({}),
})

router.post('/', validateRequest(eventSchema), asyncHandler(async (req, res) => {
    const event = await recordLearningEvent({ userId: req.user._id, ...req.body })
    res.status(201).json(event)
}))

router.get('/me', asyncHandler(async (req, res) => {
    const events = await LearningEvent.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(200)
    res.json(events)
}))

router.get('/me/summary', asyncHandler(async (req, res) => {
    res.json(await getEventSummary(req.user._id))
}))

export default router
