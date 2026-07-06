import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../modules/users/user.model.js'
import { asyncHandler } from './asyncHandler.js'

export const requireAuth = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    try {
        const payload = jwt.verify(token, env.jwtSecret)
        const user = await User.findById(payload.userId).select('-passwordHash')

        if (!user) {
            return res.status(401).json({ error: 'Invalid token user' })
        }

        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' })
    }
})
