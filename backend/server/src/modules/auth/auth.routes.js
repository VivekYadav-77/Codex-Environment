import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAuth } from '../../middleware/authMiddleware.js'
import { User } from '../users/user.model.js'

const router = Router()

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
})

const signToken = (user) => jwt.sign({ userId: user._id }, env.jwtSecret, { expiresIn: '7d' })

router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
        return res.status(409).json({ error: 'Email is already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash })

    res.status(201).json({ token: signToken(user), user: publicUser(user) })
}))

router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' })
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' })
    }

    res.json({ token: signToken(user), user: publicUser(user) })
}))

router.get('/me', requireAuth, (req, res) => {
    res.json({ user: publicUser(req.user) })
})

export default router
