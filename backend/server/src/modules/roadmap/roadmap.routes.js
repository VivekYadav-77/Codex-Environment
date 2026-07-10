import { Router } from 'express'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

const dsaRoadmap = JSON.parse(readFileSync(join(__dirname, '../../../data/dsaRoadmap.json'), 'utf8'))

// GET /api/roadmap/dsa - return all 13 phases
router.get('/dsa', (req, res) => {
    res.json(dsaRoadmap)
})

// GET /api/roadmap/dsa/phase/:phase - return one phase
router.get('/dsa/phase/:phase', (req, res) => {
    const phase = dsaRoadmap.find(p => p.phase === parseInt(req.params.phase))
    if (!phase) return res.status(404).json({ error: 'Phase not found' })
    res.json(phase)
})

// GET /api/roadmap/dsa/topic/:topicId - return a single topic with phase context
router.get('/dsa/topic/:topicId', (req, res) => {
    for (const phase of dsaRoadmap) {
        const topic = phase.topics.find(t => t.id === req.params.topicId)
        if (topic) {
            return res.json({
                ...topic,
                phase: phase.phase,
                phaseTitle: phase.title,
                phaseColor: phase.color,
                phaseTier: phase.tier,
            })
        }
    }
    res.status(404).json({ error: 'Topic not found' })
})

export default router
