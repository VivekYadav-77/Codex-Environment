import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { getDashboard, getMastery, getTodayPlan, recalculateAllProgress } from './coach.service.js'

const router = Router()

router.use(requireAuth)

router.get('/me/dashboard', asyncHandler(async (req, res) => {
    res.json(await getDashboard(req.user._id))
}))

router.get('/me/today', asyncHandler(async (req, res) => {
    res.json(await getTodayPlan(req.user._id))
}))

router.get('/me/mastery', asyncHandler(async (req, res) => {
    res.json(await getMastery(req.user._id))
}))

router.post('/me/recalculate', asyncHandler(async (req, res) => {
    const results = await recalculateAllProgress(req.user._id)
    res.json({ updated: results.filter(Boolean).length })
}))

export default router
