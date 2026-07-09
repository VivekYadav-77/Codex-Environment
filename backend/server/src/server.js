import { createApp } from './app.js'
import { connectDatabase } from './config/db.js'
import { env } from './config/env.js'
import { createServer } from 'http'
import { initSocket } from './socket/index.js'

async function start() {
    await connectDatabase()
    const app = createApp()
    const server = createServer(app)
    
    // Initialize Socket.io
    initSocket(server)

    server.listen(env.port, '0.0.0.0', () => {
        console.log(`Codex Environment API & WebSockets running on port ${env.port}`)
    })
}

start().catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
})
