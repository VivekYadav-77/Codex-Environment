import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { buildDailySession, completeSessionTask, finishDailySession, startDailySession } from './session.service.js'

const router = Router()
router.use(requireAuth)

router.get('/today', asyncHandler(async (req, res) => {
    res.json(await buildDailySession(req.user._id))
}))

router.post('/start', asyncHandler(async (req, res) => {
    res.json(await startDailySession(req.user._id))
}))

const taskSchema = z.object({
    body: z.object({ taskId: z.string().min(1) }),
    params: z.object({ id: z.string().min(1) }),
    query: z.object({}),
})

router.post('/:id/complete-task', validateRequest(taskSchema), asyncHandler(async (req, res) => {
    const session = await completeSessionTask({ userId: req.user._id, sessionId: req.params.id, taskId: req.body.taskId })
    if (!session) return res.status(404).json({ error: 'Session task not found' })
    res.json(session)
}))

router.post('/:id/finish', asyncHandler(async (req, res) => {
    const session = await finishDailySession({ userId: req.user._id, sessionId: req.params.id })
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session)
}))

export default router
