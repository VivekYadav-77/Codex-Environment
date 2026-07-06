import rateLimit from 'express-rate-limit'

export const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many AI requests, please try again later.' },
})

export const submissionLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: 'Too many execution requests, please wait.' },
})
