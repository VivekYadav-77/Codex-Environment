import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../../config/env.js'
import { aiLimiter } from '../../middleware/rateLimiters.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'

const router = Router()
const genAI = new GoogleGenerativeAI(env.geminiApiKey)

const HINT_SYSTEM_PROMPT = `You are a Socratic teaching assistant for a DSA learning platform. Never provide full solution code. Give one concise hint at a time that helps the learner reason independently.`

const CODE_REVIEW_SYSTEM_PROMPT = `You are a strict DSA code reviewer. Be concise. Use submission test context when provided. Explain correctness, complexity, and the next fix without writing full solution code.`

const ensureAiConfigured = (res) => {
    if (!env.geminiApiKey || env.geminiApiKey === 'your_gemini_api_key_here') {
        res.status(500).json({ error: 'AI features not configured. Please set GEMINI_API_KEY.' })
        return false
    }
    return true
}

router.post('/hint', aiLimiter, asyncHandler(async (req, res) => {
    if (!ensureAiConfigured(res)) return

    const { code, question, previousHints = [] } = req.body
    if (!code || !question) {
        return res.status(400).json({ error: 'Code and question are required' })
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: HINT_SYSTEM_PROMPT,
    })

    const prompt = `Problem: ${question.title}\n${question.description}\n\nCurrent code:\n${code}\n\nPrevious hints:\n${previousHints.map((h) => h.content || h).join('\n')}\n\nGive the next Socratic hint.`
    const result = await model.generateContent(prompt)
    const response = await result.response

    res.json({ hint: response.text() })
}))

router.post('/review', aiLimiter, asyncHandler(async (req, res) => {
    if (!ensureAiConfigured(res)) return

    const { code, question, language, submissionResult } = req.body
    if (!code || !question) {
        return res.status(400).json({ error: 'Code and question are required' })
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

export default router
