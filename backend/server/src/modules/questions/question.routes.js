import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { Question } from './question.model.js'

const router = Router()

const toQuestionResponse = (question) => ({
    id: question.slug,
    _id: question._id,
    slug: question.slug,
    title: question.title,
    topic: question.topic,
    patterns: question.patterns || [],
    difficulty: question.difficulty,
    description: question.description,
    examples: question.examples || [],
    starterCode: question.starterCode || {},
    functionName: question.functionName,
    hasJudge: Boolean(question.functionName && question.testCases?.length),
    hints: question.hints || [],
})

router.get('/', asyncHandler(async (req, res) => {
    const filter = { isActive: true }
    if (req.query.topic) filter.topic = req.query.topic

    const questions = await Question.find(filter).sort({ topic: 1, difficulty: 1, title: 1 })
    res.json(questions.map(toQuestionResponse))
}))

router.get('/:slug', asyncHandler(async (req, res) => {
    const question = await Question.findOne({ slug: req.params.slug, isActive: true })

    if (!question) {
        return res.status(404).json({ error: 'Question not found' })
    }

    res.json(toQuestionResponse(question))
}))

export default router
