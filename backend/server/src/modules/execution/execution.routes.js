import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { ExecutionJob } from './executionJob.model.js'

const router = Router()
router.use(requireAuth)

router.get('/jobs/:id', asyncHandler(async (req, res) => {
    const job = await ExecutionJob.findOne({ _id: req.params.id, userId: req.user._id })
    if (!job && req.user.role !== 'admin') return res.status(404).json({ error: 'Execution job not found' })
    if (!job && req.user.role === 'admin') {
        const adminJob = await ExecutionJob.findById(req.params.id)
        if (!adminJob) return res.status(404).json({ error: 'Execution job not found' })
        return res.json(adminJob)
    }
    res.json(job)
}))

export default router
