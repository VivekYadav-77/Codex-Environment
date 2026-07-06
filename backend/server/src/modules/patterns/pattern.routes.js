import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { Pattern } from './pattern.model.js'
import { Question } from '../questions/question.model.js'

const router = Router()

router.get('/', asyncHandler(async (req, res) => {
    const patterns = await Pattern.find({}).sort({ order: 1 })
    res.json(patterns)
}))

router.get('/:slug', asyncHandler(async (req, res) => {
    const pattern = await Pattern.findOne({ slug: req.params.slug })
    if (!pattern) return res.status(404).json({ error: 'Pattern not found' })

    const questions = await Question.find({ primaryPattern: pattern.slug, isActive: true })
        .sort({ learningOrder: 1, difficulty: 1 })
        .select('slug title topic difficulty primaryPattern patterns hasJudge')

    res.json({ pattern, questions })
}))

export default router
