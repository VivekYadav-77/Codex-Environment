import { config } from 'dotenv'

config()

export const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3000),
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codex_environment',
    jwtSecret: process.env.JWT_SECRET || 'local_dev_secret_change_later',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    requestApiSecret: process.env.REQUEST_API_SECRET || process.env.REQUESTAPISECRET || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
}

export const isProduction = env.nodeEnv === 'production'
