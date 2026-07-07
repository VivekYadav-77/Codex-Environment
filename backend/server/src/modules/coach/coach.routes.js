import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { getDashboard, getMastery, getMistakes, getNextActions, getSkillProfile, getTodayPlan, recalculateAllProgress, recordConceptCheckAttempt } from './coach.service.js'
import { z } from 'zod'

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

router.get('/me/skill-profile', asyncHandler(async (req, res) => {
    res.json(await getSkillProfile(req.user._id))
}))

router.get('/me/mistakes', asyncHandler(async (req, res) => {
    res.json(await getMistakes(req.user._id))
}))

router.get('/me/next-actions', asyncHandler(async (req, res) => {
    res.json(await getNextActions(req.user._id))
}))

const conceptAttemptSchema = z.object({
    body: z.object({
        conceptCheckId: z.string().min(1),
        selectedIndex: z.number().int().min(0),
    }),
    params: z.object({}),
    query: z.object({}),
})

router.post('/me/concept-checks/attempt', validateRequest(conceptAttemptSchema), asyncHandler(async (req, res) => {
    const result = await recordConceptCheckAttempt({
        userId: req.user._id,
        conceptCheckId: req.body.conceptCheckId,
        selectedIndex: req.body.selectedIndex,
    })
    if (!result) return res.status(404).json({ error: 'Concept check not found' })
    res.json(result)
}))

const recalculateSchema = z.object({
    body: z.object({}).passthrough(),
    params: z.object({}),
    query: z.object({}),
})

router.post('/me/recalculate', validateRequest(recalculateSchema), asyncHandler(async (req, res) => {
    const results = await recalculateAllProgress(req.user._id)
    res.json({ updated: results.filter(Boolean).length })
}))

export default router
