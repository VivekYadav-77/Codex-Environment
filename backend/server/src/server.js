import { createApp } from './app.js'
import { connectDatabase } from './config/db.js'
import { env } from './config/env.js'

async function start() {
    await connectDatabase()
    const app = createApp()

    app.listen(env.port, '0.0.0.0', () => {
        console.log(`Codex Environment API running on port ${env.port}`)
    })
}

start().catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
})
