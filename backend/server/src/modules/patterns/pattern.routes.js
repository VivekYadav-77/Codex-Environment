import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { Pattern } from './pattern.model.js'
import { Question } from '../questions/question.model.js'
import { ConceptCheck } from '../conceptChecks/conceptCheck.model.js'

const router = Router()

router.get('/', asyncHandler(async (req, res) => {
    const patterns = await Pattern.find({}).sort({ order: 1 })
    res.json(patterns)
}))

router.get('/:slug/concept-checks', asyncHandler(async (req, res) => {
    const pattern = await Pattern.findOne({ slug: req.params.slug })
    if (!pattern) return res.status(404).json({ error: 'Pattern not found' })

    const checks = await ConceptCheck.find({ patternSlug: pattern.slug, isActive: true }).limit(3)
    if (checks.length) return res.json(checks)

    res.json([
        {
            _id: `generated-${pattern.slug}-use`,
            patternSlug: pattern.slug,
            question: `When should you consider using ${pattern.name}?`,
            options: [
                pattern.whenToUse || 'When the problem structure matches this pattern.',
                'Only when the input is already sorted.',
                'Only when recursion is required.',
            ],
            correctIndex: 0,
            explanation: pattern.whenToUse || pattern.description,
            generated: true,
        },
    ])
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
