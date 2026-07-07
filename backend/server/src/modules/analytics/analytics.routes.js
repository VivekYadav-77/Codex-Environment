import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { getLearningAnalytics } from './analytics.service.js'

const router = Router()
router.use(requireAuth)

router.get('/me/learning', asyncHandler(async (req, res) => {
    res.json(await getLearningAnalytics(req.user._id))
}))

export default router
