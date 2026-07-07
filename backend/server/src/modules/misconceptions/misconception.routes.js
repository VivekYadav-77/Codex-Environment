import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { Misconception } from './misconception.model.js'
import { ensureDefaultMisconceptions, getLearnerMisconceptions } from './misconception.service.js'

const router = Router()

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
    res.json(await getLearnerMisconceptions(req.user._id))
}))

router.get('/:slug', asyncHandler(async (req, res) => {
    await ensureDefaultMisconceptions()
    const misconception = await Misconception.findOne({ slug: req.params.slug, isActive: true })
    if (!misconception) return res.status(404).json({ error: 'Misconception not found' })
    res.json(misconception)
}))

export default router
