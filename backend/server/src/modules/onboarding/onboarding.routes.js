import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { User } from '../users/user.model.js'

const router = Router()
router.use(requireAuth)

router.get('/me', asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('onboarding')
    res.json(user?.onboarding || {})
}))

const onboardingSchema = z.object({
    body: z.object({
        goal: z.enum(['college_learning', 'placement_prep', 'interview_prep']),
        level: z.enum(['beginner', 'knows_basics', 'solving_problems', 'interview_ready']),
        dailyTimeMinutes: z.number().int().refine((value) => [20, 45, 90].includes(value)),
        selectedTracks: z.array(z.enum(['dsa', 'system_design'])).min(1),
    }),
    params: z.object({}),
    query: z.object({}),
})

router.put('/me', validateRequest(onboardingSchema), asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { onboarding: { ...req.body, completed: true } } },
        { new: true, runValidators: true },
    ).select('onboarding')
    res.json(user.onboarding)
}))

export default router
