import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { LearningTrack } from './learningTrack.model.js'
import { Pattern } from '../patterns/pattern.model.js'

const router = Router()

const hydrateTrack = async (track) => {
    const patterns = await Pattern.find({ slug: { $in: track.patterns.map((item) => item.patternSlug) } })
    const patternMap = new Map(patterns.map((pattern) => [pattern.slug, pattern]))
    return {
        ...track.toObject(),
        patterns: track.patterns
            .sort((a, b) => a.order - b.order)
            .map((item) => ({
                order: item.order,
                patternSlug: item.patternSlug,
                pattern: patternMap.get(item.patternSlug),
            })),
    }
}

router.get('/', asyncHandler(async (req, res) => {
    const tracks = await LearningTrack.find({}).sort({ level: 1, title: 1 })
    res.json(tracks)
}))

router.get('/:slug', asyncHandler(async (req, res) => {
    const track = await LearningTrack.findOne({ slug: req.params.slug })
    if (!track) return res.status(404).json({ error: 'Track not found' })
    res.json(await hydrateTrack(track))
}))

export default router
