import express from 'express';
import { getTracks, getLesson } from '../controllers/learningTracksController.js';

const router = express.Router();

// GET /api/learning/tracks
router.get('/tracks', getTracks);

// GET /api/learning/lessons/*
// We use a wildcard or param to capture the full path like dsa/arrays/intro
router.get('/lessons/*', (req, res, next) => {
    // extract slug from path
    const slug = req.params[0];
    req.params.slug = slug;
    getLesson(req, res, next);
});

export default router;
