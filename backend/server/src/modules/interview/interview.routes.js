import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { Question } from '../questions/question.model.js'
import { Submission } from '../submissions/submission.model.js'
import { runJudgedSubmission } from '../execution/execution.service.js'
import { InterviewSession } from './interviewSession.model.js'
import { recordLearningEvent } from '../events/event.service.js'

const router = Router()
router.use(requireAuth)

const scoreInterview = ({ result, attempts, elapsedMinutes, explanation }) => {
    const correctness = result?.status === 'accepted' ? 80 : Math.round(((result?.passedCount || 0) / Math.max(result?.totalCount || 1, 1)) * 55)
    const debugging = Math.max(0, 100 - Math.max(0, attempts - 1) * 20)
    const timeManagement = Math.max(0, 100 - Math.floor(elapsedMinutes / 3) * 8)
    const communication = explanation?.trim().length > 120 ? 85 : explanation?.trim().length > 50 ? 60 : explanation?.trim().length > 20 ? 35 : 10
    const edgeCases = /edge|empty|duplicate|negative|large|case/i.test(explanation || '') ? 80 : 45
    const complexity = /O\(|time|space|complex/i.test(explanation || '') ? 80 : 45
    const finalScore = Math.round((correctness * 0.35) + (complexity * 0.15) + (communication * 0.2) + (edgeCases * 0.1) + (debugging * 0.1) + (timeManagement * 0.1))
    return {
        finalScore: Math.max(0, Math.min(100, finalScore)),
        breakdown: { correctness, complexity, communication, edgeCases, debugging, timeManagement },
    }
}

router.post('/start', asyncHandler(async (req, res) => {
    const difficulty = req.body?.difficulty
    const filter = { isActive: true, functionName: { $exists: true, $ne: '' }, testCases: { $ne: [] } }
    if (['Easy', 'Medium', 'Hard'].includes(difficulty)) filter.difficulty = difficulty

    const question = await Question.findOne(filter).sort({ difficulty: 1, learningOrder: 1 })
    if (!question) return res.status(404).json({ error: 'No interview-ready question found' })

    const session = await InterviewSession.create({
        userId: req.user._id,
        questionId: question._id,
        language: req.body?.language || 'javascript',
        code: question.starterCode?.[req.body?.language || 'javascript'] || '',
    })

    res.status(201).json({ session, question: { slug: question.slug, title: question.title, difficulty: question.difficulty, description: question.description, examples: question.examples, starterCode: question.starterCode } })
}))

const runSchema = z.object({
    body: z.object({
        language: z.enum(['javascript', 'python']),
        code: z.string().min(1).max(50000),
    }),
    params: z.object({ id: z.string().min(1) }),
    query: z.object({}),
})

router.post('/:id/run', validateRequest(runSchema), asyncHandler(async (req, res) => {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id, status: 'active' })
    if (!session) return res.status(404).json({ error: 'Active interview session not found' })

    const question = await Question.findById(session.questionId)
    const result = await runJudgedSubmission({ code: req.body.code, language: req.body.language, question })
    const submission = await Submission.create({
        userId: req.user._id,
        questionId: question._id,
        language: req.body.language,
        code: req.body.code,
        status: result.status,
        testResults: result.testResults,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        runtimeMs: result.runtimeMs,
        mode: 'interview',
    })

    session.code = req.body.code
    session.language = req.body.language
    session.submissions.push(submission._id)
    await session.save()

    res.json({
        submissionId: submission._id,
        status: result.status,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        runtimeMs: result.runtimeMs,
    })
}))

router.post('/:id/finish', asyncHandler(async (req, res) => {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id }).populate('submissions')
    if (!session) return res.status(404).json({ error: 'Interview session not found' })

    const latest = session.submissions.at(-1)
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - session.startedAt.getTime()) / 60000))
    const score = scoreInterview({
        result: latest,
        attempts: session.submissions.length,
        elapsedMinutes,
        explanation: req.body?.explanation || '',
    })

    session.status = 'finished'
    session.endedAt = new Date()
    session.explanation = req.body?.explanation || ''
    session.finalScore = score.finalScore
    session.scoreBreakdown = score.breakdown
    session.feedback = score.finalScore >= 75
        ? 'Strong interview attempt. Keep practicing concise explanation and edge-case coverage.'
        : 'Good practice signal. Review the pattern, explain the invariant, then retry a similar problem.'
    await session.save()
    await recordLearningEvent({
        userId: req.user._id,
        type: 'interview_finished',
        questionId: session.questionId,
        metadata: { finalScore: session.finalScore, scoreBreakdown: session.scoreBreakdown },
    })

    res.json(session)
}))

router.get('/me', asyncHandler(async (req, res) => {
    const sessions = await InterviewSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(25).populate('questionId', 'slug title difficulty topic')
    res.json(sessions)
}))

export default router
