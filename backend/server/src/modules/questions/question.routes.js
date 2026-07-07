import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { Question } from './question.model.js'
import { Progress } from '../progress/progress.model.js'
import { LearningTimelineEvent } from '../timeline/learningTimelineEvent.model.js'

const router = Router()

const toQuestionResponse = (question, options = {}) => ({
    id: question.slug,
    _id: question._id,
    slug: question.slug,
    title: question.title,
    topic: question.topic,
    patterns: options.hidePattern ? [] : question.patterns || [],
    primaryPattern: options.hidePattern ? undefined : question.primaryPattern,
    prerequisites: question.prerequisites || [],
    learningOrder: question.learningOrder,
    coachTags: question.coachTags || [],
    lessonRefs: question.lessonRefs || [],
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

router.get('/mixed', requireAuth, asyncHandler(async (req, res) => {
    const level = req.query.level
    const progress = await Progress.find({ userId: req.user._id, status: 'solved' }).select('questionId')
    const solvedQuestionIds = progress.map((row) => row.questionId)
    const solvedQuestions = await Question.find({ _id: { $in: solvedQuestionIds } }).select('primaryPattern patterns')
    const introducedPatterns = [...new Set(solvedQuestions.flatMap((question) => [question.primaryPattern, ...(question.patterns || [])]).filter(Boolean))]

    const filter = { isActive: true }
    if (introducedPatterns.length) filter.primaryPattern = { $in: introducedPatterns }
    if (['Easy', 'Medium', 'Hard'].includes(level)) filter.difficulty = level

    const questions = await Question.find(filter).sort({ learningOrder: 1, difficulty: 1 }).limit(12)
    res.json(questions.map((question) => toQuestionResponse(question, { hidePattern: true })))
}))

router.get('/:slug/timeline/me', requireAuth, asyncHandler(async (req, res) => {
    const question = await Question.findOne({ slug: req.params.slug, isActive: true })
    if (!question) return res.status(404).json({ error: 'Question not found' })

    const events = await LearningTimelineEvent.find({ userId: req.user._id, questionId: question._id }).sort({ createdAt: -1 }).limit(100)
    res.json(events)
}))

router.get('/:slug', asyncHandler(async (req, res) => {
    const question = await Question.findOne({ slug: req.params.slug, isActive: true })

    if (!question) {
        return res.status(404).json({ error: 'Question not found' })
    }

    res.json(toQuestionResponse(question))
}))

export default router
