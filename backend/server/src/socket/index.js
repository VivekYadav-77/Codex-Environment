import { Server } from 'socket.io';
import { env } from '../config/env.js';

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: [env.frontendUrl, 'http://localhost:5174', 'http://localhost:3000'].filter(Boolean),
            methods: ['GET', 'POST'],
            credentials: true,
        }
    });

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('join_session', (sessionId) => {
            socket.join(sessionId);
            console.log(`Socket ${socket.id} joined session ${sessionId}`);
        });

        socket.on('leave_session', (sessionId) => {
            socket.leave(sessionId);
            console.log(`Socket ${socket.id} left session ${sessionId}`);
        });

        socket.on('code_change', (data) => {
            // Broadcast to other users in the same session
            if (data.sessionId) {
                socket.to(data.sessionId).emit('code_update', data);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
}
