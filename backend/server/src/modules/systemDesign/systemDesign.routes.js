import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { SystemDesignConcept } from './systemDesignConcept.model.js'
import { SystemDesignPrompt } from './systemDesignPrompt.model.js'
import { ArchitectureDraft } from './architectureDraft.model.js'
import { SystemDesignAttempt } from './systemDesignAttempt.model.js'

const router = Router()

const scoreAttempt = (body) => {
    const fields = ['requirements', 'estimates', 'highLevelDesign', 'bottlenecks', 'tradeoffs', 'finalRecommendation']
    const completed = fields.filter((field) => (body[field] || '').trim().length >= 30)
    const score = Math.round((completed.length / fields.length) * 100)
    const missing = fields.filter((field) => !completed.includes(field))
    return {
        score,
        feedback: missing.length
            ? `Good start. Strengthen: ${missing.map((item) => item.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}.`
            : 'Strong interview loop: requirements, scale, design, bottlenecks, tradeoffs, and recommendation are all present.',
    }
}

router.get('/concepts', asyncHandler(async (req, res) => {
    const query = req.query.category ? { category: req.query.category } : {}
    const concepts = await SystemDesignConcept.find(query).sort({ order: 1, title: 1 })
    res.json(concepts)
}))

router.get('/concepts/:slug', asyncHandler(async (req, res) => {
    const concept = await SystemDesignConcept.findOne({ slug: req.params.slug })
    if (!concept) return res.status(404).json({ error: 'System design concept not found' })
    res.json(concept)
}))

router.get('/prompts', asyncHandler(async (req, res) => {
    const prompts = await SystemDesignPrompt.find({}).sort({ order: 1, difficulty: 1 })
    res.json(prompts)
}))

router.get('/prompts/:slug', asyncHandler(async (req, res) => {
    const prompt = await SystemDesignPrompt.findOne({ slug: req.params.slug })
    if (!prompt) return res.status(404).json({ error: 'System design prompt not found' })
    res.json(prompt)
}))

router.use(requireAuth)

const draftSchema = z.object({
    body: z.object({
        title: z.string().min(2),
        promptSlug: z.string().optional().default(''),
        components: z.array(z.any()).optional().default([]),
        connections: z.array(z.any()).optional().default([]),
        notes: z.string().optional().default(''),
    }),
    params: z.object({}),
    query: z.object({}),
})

router.get('/drafts', asyncHandler(async (req, res) => {
    const drafts = await ArchitectureDraft.find({ userId: req.user._id }).sort({ updatedAt: -1 })
    res.json(drafts)
}))

router.post('/drafts', validateRequest(draftSchema), asyncHandler(async (req, res) => {
    const draft = await ArchitectureDraft.create({ ...req.body, userId: req.user._id })
    res.status(201).json(draft)
}))

const attemptSchema = z.object({
    body: z.object({
        promptSlug: z.string().min(1),
        requirements: z.string().optional().default(''),
        estimates: z.string().optional().default(''),
        highLevelDesign: z.string().optional().default(''),
        bottlenecks: z.string().optional().default(''),
        tradeoffs: z.string().optional().default(''),
        finalRecommendation: z.string().optional().default(''),
    }),
    params: z.object({}),
    query: z.object({}),
})

router.get('/attempts', asyncHandler(async (req, res) => {
    const attempts = await SystemDesignAttempt.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json(attempts)
}))

router.post('/attempts', validateRequest(attemptSchema), asyncHandler(async (req, res) => {
    const prompt = await SystemDesignPrompt.findOne({ slug: req.body.promptSlug })
    if (!prompt) return res.status(404).json({ error: 'System design prompt not found' })
    const scored = scoreAttempt(req.body)
    const attempt = await SystemDesignAttempt.create({ ...req.body, ...scored, userId: req.user._id })
    res.status(201).json(attempt)
}))

export default router
