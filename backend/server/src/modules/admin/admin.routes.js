import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { requireAdmin } from '../../middleware/adminMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { Question } from '../questions/question.model.js'
import { Pattern } from '../patterns/pattern.model.js'
import { ConceptCheck } from '../conceptChecks/conceptCheck.model.js'
import { LearningTrack } from '../tracks/learningTrack.model.js'
import { auditCourseDepth, scorePatternQuality, scoreQuestionQuality } from './contentQuality.service.js'
import { AdminAudit } from './adminAudit.model.js'

const router = Router()
router.use(requireAuth, requireAdmin)

const audit = (req, action, targetType, targetId, metadata = {}) => (
    AdminAudit.create({ userId: req.user._id, action, targetType, targetId: String(targetId || ''), metadata, requestId: req.requestId })
)

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

router.get('/questions/:id/quality', asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json(await scoreQuestionQuality(question))
}))

router.get('/patterns/:id/quality', asyncHandler(async (req, res) => {
    const pattern = await Pattern.findById(req.params.id)
    if (!pattern) return res.status(404).json({ error: 'Pattern not found' })
    res.json(await scorePatternQuality(pattern))
}))

router.get('/course-depth', asyncHandler(async (req, res) => {
    res.json(await auditCourseDepth())
}))

router.post('/questions/:id/validate', asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json(await scoreQuestionQuality(question))
}))

router.get('/questions/:id/solution', asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json(question.officialSolution || {})
}))

router.patch('/questions/:id/solution', asyncHandler(async (req, res) => {
    const question = await Question.findByIdAndUpdate(
        req.params.id,
        { $set: { officialSolution: req.body } },
        { new: true, runValidators: true }
    )
    if (!question) return res.status(404).json({ error: 'Question not found' })
    await audit(req, 'question.solution.updated', 'question', question._id)
    res.json({ officialSolution: question.officialSolution, quality: await scoreQuestionQuality(question) })
}))

router.get('/questions/:id/content', asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json(question)
}))

router.patch('/questions/:id/content', asyncHandler(async (req, res) => {
    const allowed = [
        'title',
        'topic',
        'patterns',
        'primaryPattern',
        'prerequisites',
        'learningOrder',
        'coachTags',
        'lessonRefs',
        'difficulty',
        'description',
        'examples',
        'starterCode',
        'functionName',
        'testCases',
        'hints',
        'learningObjectives',
        'beginnerExplanation',
        'workedExample',
        'visualWalkthrough',
        'edgeCases',
        'revisionPrompts',
        'profileSignals',
        'isActive',
        'officialSolution',
    ]
    const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
    const question = await Question.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true })
    if (!question) return res.status(404).json({ error: 'Question not found' })
    await audit(req, 'question.content.updated', 'question', question._id, { fields: Object.keys(update) })
    res.json({ question, quality: await scoreQuestionQuality(question) })
}))

router.get('/audit', asyncHandler(async (req, res) => {
    const rows = await AdminAudit.find({}).sort({ createdAt: -1 }).limit(100).populate('userId', 'name email role')
    res.json(rows)
}))

router.post('/questions/:id/publish-check', asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ error: 'Question not found' })
    const quality = await scoreQuestionQuality(question)
    await audit(req, 'question.publish_check', 'question', question._id, { score: quality.score, publishReady: quality.publishReady })
    res.json(quality)
}))

export default router
