import { config } from 'dotenv'
import { z } from 'zod'

config()

const DEFAULT_JWT_SECRET = 'local_dev_secret_change_later'

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/codex_environment'),
    JWT_SECRET: z.string().min(12).default(DEFAULT_JWT_SECRET),
    FRONTEND_URL: z.url().default('http://localhost:5173'),
    REQUEST_API_SECRET: z.string().optional().default(''),
    REQUESTAPISECRET: z.string().optional().default(''),
    GEMINI_API_KEY: z.string().optional().default(''),
})

export function parseEnv(source = process.env) {
    const parsed = envSchema.safeParse(source)

    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
        throw new Error(`Invalid environment configuration: ${details}`)
    }

    const data = parsed.data
    return {
        nodeEnv: data.NODE_ENV,
        port: data.PORT,
        mongoUri: data.MONGODB_URI,
        jwtSecret: data.JWT_SECRET,
        frontendUrl: data.FRONTEND_URL,
        requestApiSecret: data.REQUEST_API_SECRET || data.REQUESTAPISECRET || '',
        geminiApiKey: data.GEMINI_API_KEY || '',
    }
}

export const env = parseEnv()
export const isProduction = env.nodeEnv === 'production'

if (!isProduction && env.jwtSecret === DEFAULT_JWT_SECRET) {
    console.warn('Warning: using default JWT_SECRET. Set a stronger secret outside local development.')
}
