import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { requireAdmin } from '../../middleware/adminMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { Question } from '../questions/question.model.js'
import { Pattern } from '../patterns/pattern.model.js'
import { ConceptCheck } from '../conceptChecks/conceptCheck.model.js'
import { LearningTrack } from '../tracks/learningTrack.model.js'

const router = Router()
router.use(requireAuth, requireAdmin)

const crud = (Model) => {
    const child = Router()
    child.get('/', asyncHandler(async (req, res) => {
        res.json(await Model.find({}).sort({ createdAt: -1 }).limit(100))
    }))
    child.post('/', asyncHandler(async (req, res) => {
        const item = await Model.create(req.body)
        res.status(201).json(item)
    }))
    child.patch('/:id', asyncHandler(async (req, res) => {
        const item = await Model.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true })
        if (!item) return res.status(404).json({ error: 'Item not found' })
        res.json(item)
    }))
    return child
}

router.use('/questions', crud(Question))
router.use('/patterns', crud(Pattern))
router.use('/concept-checks', crud(ConceptCheck))
router.use('/tracks', crud(LearningTrack))

export default router
