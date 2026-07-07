import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { Algorithm } from './algorithm.model.js'

const router = Router()

const toAlgorithmResponse = (algorithm) => ({
    id: algorithm.slug,
    slug: algorithm.slug,
    name: algorithm.name,
    category: algorithm.category,
    complexity: algorithm.complexity,
    description: algorithm.description,
    operations: algorithm.operations || [],
    code: algorithm.code,
    practice: algorithm.practice,
    prerequisites: algorithm.prerequisites || [],
    learningObjectives: algorithm.learningObjectives || [],
    beginnerExplanation: algorithm.beginnerExplanation,
    mentalModel: algorithm.mentalModel,
    workedExample: algorithm.workedExample,
    visualWalkthrough: algorithm.visualWalkthrough || [],
    complexityReasoning: algorithm.complexityReasoning,
    commonMisconceptions: algorithm.commonMisconceptions || [],
    edgeCases: algorithm.edgeCases || [],
    interviewExplanation: algorithm.interviewExplanation,
    revisionPrompts: algorithm.revisionPrompts || [],
})

router.get('/', asyncHandler(async (req, res) => {
    const algorithms = await Algorithm.find({}).sort({ category: 1, name: 1 })
    res.json(algorithms.map(toAlgorithmResponse))
}))

router.get('/:category', asyncHandler(async (req, res) => {
    const algorithms = await Algorithm.find({ category: req.params.category }).sort({ name: 1 })
    res.json(algorithms.map(toAlgorithmResponse))
}))

router.get('/:category/:slug', asyncHandler(async (req, res) => {
    const algorithm = await Algorithm.findOne({ category: req.params.category, slug: req.params.slug })

    if (!algorithm) {
        return res.status(404).json({ error: 'Algorithm not found' })
    }

    res.json(toAlgorithmResponse(algorithm))
}))

export default router
