import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../../config/env.js'
import { aiLimiter } from '../../middleware/rateLimiters.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { Question } from '../questions/question.model.js'
import { Submission } from '../submissions/submission.model.js'
import { MistakeInsight } from '../insights/mistakeInsight.model.js'
import { MentorSession } from './mentorSession.model.js'
import { LearningTimelineEvent } from '../timeline/learningTimelineEvent.model.js'
import { recordLearningEvent } from '../events/event.service.js'
import { getLearnerMemory } from '../learnerMemory/learnerMemory.service.js'

const router = Router()
const genAI = new GoogleGenerativeAI(env.geminiApiKey)

const HINT_SYSTEM_PROMPT = `You are a Socratic teaching assistant for a DSA learning platform. Never provide full solution code. Give one concise hint at a time that helps the learner reason independently.`

const CODE_REVIEW_SYSTEM_PROMPT = `You are a strict DSA code reviewer. Be concise. Use submission test context when provided. Explain correctness, complexity, and the next fix without writing full solution code.`
const MENTOR_SYSTEM_PROMPT = `You are a strict Socratic DSA mentor. Do not provide full solution code before the learner solves the problem. Ask one useful question or give one small nudge at a time. Help the learner explain the next move.`
const hintLadder = [
    'Clarify constraints',
    'Identify pattern signal',
    'Suggest data structure',
    'Point to invariant',
    'Highlight edge case',
    'Pseudocode-level nudge',
]

const ensureAiConfigured = (res) => {
    if (!env.geminiApiKey || env.geminiApiKey === 'your_gemini_api_key_here') {
        res.status(500).json({ error: 'AI features not configured. Please set GEMINI_API_KEY.' })
        return false
    }
    return true
}

const fallbackHints = [
    'Restate the input, output, and constraint that matters most before changing code.',
    'Look for the signal that points to a pattern: repeated lookup, monotonic condition, window, stack order, or recursion.',
    'Name the data structure that removes repeated work, then explain what it stores.',
    'Write the invariant that must remain true after each loop iteration.',
    'Test the edge case most likely to break your logic: empty, duplicate, single item, negative, or large input.',
    'Sketch pseudocode in three steps without language syntax, then map each step to code.',
]

const fallbackReview = ({ submissionResult }) => {
    const status = submissionResult?.status || 'not_run'
    return [
        `AI review is unavailable, so here is a deterministic review checklist for status: ${status}.`,
        '- Correctness: compare your output against visible examples and one custom edge case.',
        '- Complexity: identify the largest loop or recursive branch and state time/space.',
        '- Edge cases: check empty input, duplicates, single item, and no-answer cases.',
        '- Next fix: isolate the first failed test and explain why expected and actual differ.',
    ].join('\n')
}

router.post('/hint', requireAuth, aiLimiter, asyncHandler(async (req, res) => {
    const { code, question, previousHints = [], hintLevel = 1, mode = 'practice', approach = {}, submissionResult = null, forceFallback = false } = req.body
    if (!code || !question) {
        return res.status(400).json({ error: 'Code and question are required' })
    }
    const safeHintLevel = Math.max(1, Math.min(6, Number(hintLevel) || 1))

    const memory = await getLearnerMemory(req.user._id)
    let hintText = fallbackHints[safeHintLevel - 1]
    const aiConfigured = !forceFallback && env.geminiApiKey && env.geminiApiKey !== 'your_gemini_api_key_here'
    if (aiConfigured) {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: HINT_SYSTEM_PROMPT,
        })

        const prompt = `Problem: ${question.title}\n${question.description}

Mode: ${mode}
Hint level ${safeHintLevel}: ${hintLadder[safeHintLevel - 1]}
Approach notes: ${JSON.stringify(approach)}
Submission result: ${JSON.stringify(submissionResult || {})}
Learner memory: ${memory?.summary || 'No learner memory yet.'}

Current code:
${code}

Previous hints:
${previousHints.map((h) => h.content || h).join('\n')}

Give one concise Socratic hint for this level. Do not provide full solution code.`
        const result = await model.generateContent(prompt)
        const response = await result.response
        hintText = response.text()
    }
    const event = await recordLearningEvent({
        userId: req.user._id,
        type: 'hint_requested',
        questionId: question._id,
        metadata: { hintLevel: safeHintLevel, mode },
    })

    res.json({
        hint: hintText,
        hintLevel: safeHintLevel,
        nextHintAvailable: safeHintLevel < hintLadder.length,
        learningEventId: event?._id,
        aiFallback: !aiConfigured,
    })
}))

router.post('/review', aiLimiter, asyncHandler(async (req, res) => {
    const { code, question, language, submissionResult } = req.body
    if (!code || !question) {
        return res.status(400).json({ error: 'Code and question are required' })
    }

    if (!env.geminiApiKey || env.geminiApiKey === 'your_gemini_api_key_here') {
        return res.json({ reviewText: fallbackReview({ submissionResult }), aiFallback: true })
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: CODE_REVIEW_SYSTEM_PROMPT,
    })

    const prompt = `Problem: ${question.title}\n${question.description}\n\nLanguage: ${language}\n\nSubmission result:\n${JSON.stringify(submissionResult || {}, null, 2)}\n\nCode:\n${code}\n\nReview the submission.`
    const result = await model.generateContent(prompt)
    const response = await result.response

    res.json({ reviewText: response.text() })
}))

const questionLookup = (value) => {
    const lookup = [{ slug: value }]
    if (/^[a-f\d]{24}$/i.test(value)) lookup.push({ _id: value })
    return { $or: lookup }
}

router.get('/mentor/session/:questionId', requireAuth, asyncHandler(async (req, res) => {
    const question = await Question.findOne(questionLookup(req.params.questionId))
    if (!question) return res.status(404).json({ error: 'Question not found' })

    const session = await MentorSession.findOne({ userId: req.user._id, questionId: question._id })
    res.json(session || { questionId: question._id, messages: [], hintLevel: 0 })
}))

router.post('/mentor/message', requireAuth, aiLimiter, asyncHandler(async (req, res) => {
    const { questionId, message, code = '', approach = {}, mode = 'practice' } = req.body
    if (!questionId || !message) return res.status(400).json({ error: 'Question and message are required' })

    const question = await Question.findOne(questionLookup(questionId))
    if (!question) return res.status(404).json({ error: 'Question not found' })

    const [submissions, mistakes, memory] = await Promise.all([
        Submission.find({ userId: req.user._id, questionId: question._id }).sort({ createdAt: -1 }).limit(5),
        MistakeInsight.find({ userId: req.user._id, questionId: question._id }).sort({ createdAt: -1 }).limit(10),
        getLearnerMemory(req.user._id),
    ])
    const solved = submissions.some((submission) => submission.status === 'accepted')
    const hidePattern = ['mixed', 'interview'].includes(mode) && !solved

    let mentorText = 'What invariant or condition can you state before writing the next line?'
    if (env.geminiApiKey && env.geminiApiKey !== 'your_gemini_api_key_here') {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: MENTOR_SYSTEM_PROMPT,
        })
        const prompt = `Problem: ${question.title}
${question.description}

Mode: ${mode}
Pattern: ${hidePattern ? 'Hidden until solved' : question.primaryPattern || 'Unknown'}
Solved already: ${solved}
Approach notes: ${JSON.stringify(approach)}
Recent submissions: ${JSON.stringify(submissions.map((row) => ({ status: row.status, mistakeTags: row.mistakeTags, passedCount: row.passedCount, totalCount: row.totalCount })))}
Mistakes: ${JSON.stringify(mistakes.map((row) => row.tags))}
Learner memory: ${memory?.summary || 'No learner memory yet.'}
Current code:
${code}

Learner message: ${message}

Respond with one Socratic mentor message.`
        const result = await model.generateContent(prompt)
        const response = await result.response
        mentorText = response.text()
    }

    const session = await MentorSession.findOneAndUpdate(
        { userId: req.user._id, questionId: question._id },
        {
            $set: { mode },
            $inc: { hintLevel: 1 },
            $push: {
                messages: {
                    $each: [
                        { role: 'learner', content: message },
                        { role: 'mentor', content: mentorText },
                    ],
                    $slice: -40,
                },
            },
        },
        { upsert: true, new: true }
    )

    await LearningTimelineEvent.create({
        userId: req.user._id,
        questionId: question._id,
        type: 'mentor_message',
        title: 'Mentor exchange',
        details: { message, mentorText },
    })
    await recordLearningEvent({
        userId: req.user._id,
        type: 'mentor_message_sent',
        questionId: question._id,
        metadata: { mode },
    })

    res.json({ message: mentorText, session })
}))

export default router
