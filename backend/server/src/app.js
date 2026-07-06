import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorMiddleware, notFound } from './middleware/errorMiddleware.js'
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

export function createApp() {
    const app = express()

    app.use(helmet())
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

    app.use(notFound)
    app.use(errorMiddleware)

    return app
}
