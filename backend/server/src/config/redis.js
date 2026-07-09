import Redis from 'ioredis';
import { env } from './env.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisClient {
    constructor() {
        this.client = new Redis(REDIS_URL, {
            maxRetriesPerRequest: null,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        this.client.on('connect', () => {
            console.log('Successfully connected to Redis');
        });
    }

    async get(key) {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set(key, value, expireSeconds = 3600) {
        await this.client.set(key, JSON.stringify(value), 'EX', expireSeconds);
    }

    async del(key) {
        await this.client.del(key);
    }
}

export const redisCache = new RedisClient();
