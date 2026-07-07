import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { RevisionItem } from './revisionItem.model.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { z } from 'zod'
import { recordLearningEvent } from '../events/event.service.js'
import { rebuildLearnerMemory } from '../learnerMemory/learnerMemory.service.js'

const router = Router()

router.use(requireAuth)

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)

router.get('/me', asyncHandler(async (req, res) => {
    const items = await RevisionItem.find({ userId: req.user._id, status: 'queued' })
        .sort({ dueAt: 1, priority: 1 })
        .populate('questionId', 'slug title topic difficulty primaryPattern')
    res.json(items)
}))

const updateRevisionSchema = z.object({
    body: z.object({
        status: z.enum(['completed', 'skipped', 'queued']),
    }),
    params: z.object({
        id: z.string().min(1),
    }),
    query: z.object({}),
})

router.patch('/me/:id', validateRequest(updateRevisionSchema), asyncHandler(async (req, res) => {
    const status = req.body.status
    const item = await RevisionItem.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: { status } },
        { new: true }
    )

    if (!item) return res.status(404).json({ error: 'Revision item not found' })
    res.json(item)
}))

router.post('/me/:id/complete', asyncHandler(async (req, res) => {
    const item = await RevisionItem.findOne({ _id: req.params.id, userId: req.user._id })
    if (!item) return res.status(404).json({ error: 'Revision item not found' })

    const nextInterval = Math.min(30, Math.max(2, (item.intervalDays || 1) * 2))
    item.status = 'completed'
    item.lastResult = 'successful_revision'
    item.intervalDays = nextInterval
    await item.save()
    await recordLearningEvent({ userId: req.user._id, type: 'revision_completed', questionId: item.questionId, metadata: { patternSlug: item.patternSlug } })
    await rebuildLearnerMemory(req.user._id)

    res.json(item)
}))

router.post('/me/:id/skip', asyncHandler(async (req, res) => {
    const item = await RevisionItem.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: { status: 'skipped', lastResult: 'skipped' } },
        { new: true }
    )
    if (!item) return res.status(404).json({ error: 'Revision item not found' })
    res.json(item)
}))

const rescheduleSchema = z.object({
    body: z.object({
        days: z.number().int().min(1).max(30).default(1),
    }),
    params: z.object({
        id: z.string().min(1),
    }),
    query: z.object({}),
})

router.post('/me/:id/reschedule', validateRequest(rescheduleSchema), asyncHandler(async (req, res) => {
    const item = await RevisionItem.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        {
            $set: {
                status: 'queued',
                dueAt: addDays(new Date(), req.body.days),
                intervalDays: req.body.days,
                lastResult: 'rescheduled',
            },
        },
        { new: true }
    )
    if (!item) return res.status(404).json({ error: 'Revision item not found' })
    res.json(item)
}))

export default router
