import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { execFile } from 'child_process'
import { env } from './config/env.js'
import { errorMiddleware, notFound } from './middleware/errorMiddleware.js'
import { requestIdMiddleware } from './middleware/requestIdMiddleware.js'
import authRoutes from './modules/auth/auth.routes.js'
import questionRoutes from './modules/questions/question.routes.js'
import algorithmRoutes from './modules/algorithms/algorithm.routes.js'
import submissionRoutes from './modules/submissions/submission.routes.js'
import progressRoutes from './modules/progress/progress.routes.js'
import aiTutorRoutes from './modules/aiTutor/aiTutor.routes.js'
import patternRoutes from './modules/patterns/pattern.routes.js'
import trackRoutes from './modules/tracks/track.routes.js'
import coachRoutes from './modules/coach/coach.routes.js'
import revisionRoutes from './modules/revision/revision.routes.js'
import interviewRoutes from './modules/interview/interview.routes.js'
import adminRoutes from './modules/admin/admin.routes.js'
import eventRoutes from './modules/events/event.routes.js'
import sessionRoutes from './modules/sessions/session.routes.js'
import reflectionRoutes from './modules/reflections/reflection.routes.js'
import misconceptionRoutes from './modules/misconceptions/misconception.routes.js'
import analyticsRoutes from './modules/analytics/analytics.routes.js'
import executionRoutes from './modules/execution/execution.routes.js'
import onboardingRoutes from './modules/onboarding/onboarding.routes.js'
import systemDesignRoutes from './modules/systemDesign/systemDesign.routes.js'

export function createApp() {
    const app = express()

    app.use(helmet())
    app.use(requestIdMiddleware)
    app.use(cors({
        origin: (origin, callback) => {
            const allowed = [env.frontendUrl, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean)
            if (!origin || allowed.includes(origin)) return callback(null, true)
            callback(new Error('Not allowed by CORS'))
        },
        credentials: true,
    }))
    app.use(express.json({ limit: '1mb' }))

    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() })
    })

    app.get('/health/deep', async (req, res) => {
        const checkRuntime = (command, args = ['--version']) => new Promise((resolve) => {
            execFile(command, args, { timeout: 1500 }, (error, stdout, stderr) => {
                resolve({ available: !error, version: (stdout || stderr || '').trim(), error: error?.message })
            })
        })
        const [nodeRuntime, pythonRuntime] = await Promise.all([
            checkRuntime('node'),
            checkRuntime('python'),
        ])
        const payload = {
            status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
            requestId: req.requestId,
            database: { connected: mongoose.connection.readyState === 1, readyState: mongoose.connection.readyState },
            ai: { configured: Boolean(env.geminiApiKey && env.geminiApiKey !== 'your_gemini_api_key_here') },
            judge: { node: nodeRuntime, python: pythonRuntime },
            timestamp: new Date().toISOString(),
        }
        res.status(payload.status === 'ok' ? 200 : 503).json(payload)
    })

    app.use('/api/auth', authRoutes)
    app.use('/api/questions', questionRoutes)
    app.use('/api/algorithms', algorithmRoutes)
    app.use('/api/submissions', submissionRoutes)
    app.use('/api/progress', progressRoutes)
    app.use('/api/ai', aiTutorRoutes)
    app.use('/api/patterns', patternRoutes)
    app.use('/api/tracks', trackRoutes)
    app.use('/api/coach', coachRoutes)
    app.use('/api/revision', revisionRoutes)
    app.use('/api/interview', interviewRoutes)
    app.use('/api/admin', adminRoutes)
    app.use('/api/events', eventRoutes)
    app.use('/api/session', sessionRoutes)
    app.use('/api/reflections', reflectionRoutes)
    app.use('/api/misconceptions', misconceptionRoutes)
    app.use('/api/analytics', analyticsRoutes)
    app.use('/api/execution', executionRoutes)
    app.use('/api/onboarding', onboardingRoutes)
    app.use('/api/system-design', systemDesignRoutes)

    app.use(notFound)
    app.use(errorMiddleware)

    return app
}
