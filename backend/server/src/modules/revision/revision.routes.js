import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { RevisionItem } from './revisionItem.model.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { z } from 'zod'

const router = Router()

router.use(requireAuth)

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

export default router
