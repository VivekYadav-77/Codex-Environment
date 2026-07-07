import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { join } from 'path'

process.env.NODE_ENV = 'test'
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/codex_environment_test'
process.env.JWT_SECRET = 'test_secret_for_platform_checks'
process.env.FRONTEND_URL = 'http://localhost:5173'

const { createApp } = await import('../src/app.js')
const { connectDatabase } = await import('../src/config/db.js')
const { parseEnv } = await import('../src/config/env.js')
const { runJudgedSubmission } = await import('../src/modules/execution/execution.service.js')
const { User } = await import('../src/modules/users/user.model.js')
const { Question } = await import('../src/modules/questions/question.model.js')
const { Pattern } = await import('../src/modules/patterns/pattern.model.js')
const { LearningTrack } = await import('../src/modules/tracks/learningTrack.model.js')
const { RevisionItem } = await import('../src/modules/revision/revisionItem.model.js')
const { corePatterns, enrichQuestion, hashingJudge, trackSeed } = await import('../src/scripts/seedDatabase.js')

const app = createApp()

const seedMinimalCoachData = async () => {
    await Pattern.create(corePatterns[0])
    await LearningTrack.create({
        ...trackSeed,
        patterns: [{ patternSlug: corePatterns[0].slug, order: 1 }],
        estimatedProblemCount: 1,
    })
    await Question.create({
        slug: 'two-sum',
        title: 'Two Sum',
        topic: 'hashing',
        patterns: ['hash-map-lookup'],
        primaryPattern: 'hash-map-lookup',
        difficulty: 'Easy',
        description: 'Find two indices that add to target.',
        examples: [],
        starterCode: {
            javascript: 'function twoSum(nums, target) {\n}',
            python: 'def twoSum(nums, target):\n    pass',
        },
        functionName: 'twoSum',
        testCases: hashingJudge['two-sum'].testCases,
        isActive: true,
    })
}

const register = async () => {
    const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: `user${Date.now()}@test.local`, password: 'password123' })
    return response.body.token
}

beforeAll(async () => {
    await connectDatabase()
})

beforeEach(async () => {
    await mongoose.connection.dropDatabase()
})

afterAll(async () => {
    await mongoose.disconnect()
})

describe('environment validation', () => {
    it('rejects invalid URLs', () => {
        expect(() => parseEnv({ FRONTEND_URL: 'not-a-url' })).toThrow(/Invalid environment configuration/)
    })
})

describe('auth and route protection', () => {
    it('validates registration input', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ name: 'A', email: 'bad-email', password: '123' })

        expect(response.status).toBe(400)
        expect(response.body.error).toBe('Validation failed')
    })

    it('registers, logs in, and rejects protected routes without JWT', async () => {
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })

        expect(registerResponse.status).toBe(201)
        expect(registerResponse.body.token).toBeTruthy()

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password123' })

        expect(loginResponse.status).toBe(200)
        expect(loginResponse.body.token).toBeTruthy()

        const protectedResponse = await request(app).get('/api/progress/me')
        expect(protectedResponse.status).toBe(401)
    })
})

describe('judge smoke tests', () => {
    const question = {
        functionName: 'twoSum',
        testCases: [{ name: 'Example', input: [[2, 7, 11, 15], 9], expected: [0, 1], visible: true, category: 'Example' }],
    }

    it('accepts JavaScript solutions', async () => {
        const result = await runJudgedSubmission({
            language: 'javascript',
            question,
            code: 'function twoSum(nums,target){const seen=new Map(); for(let i=0;i<nums.length;i++){const need=target-nums[i]; if(seen.has(need)) return [seen.get(need), i]; seen.set(nums[i], i);}}',
        })
        expect(result.status).toBe('accepted')
    })

    it('accepts Python solutions and detects wrong answers', async () => {
        const accepted = await runJudgedSubmission({
            language: 'python',
            question,
            code: 'def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        need = target - num\n        if need in seen:\n            return [seen[need], i]\n        seen[num] = i',
        })
        expect(accepted.status).toBe('accepted')

        const wrong = await runJudgedSubmission({
            language: 'javascript',
            question,
            code: 'function twoSum(){ return [0, 2] }',
        })
        expect(wrong.status).toBe('wrong_answer')
    })
})

describe('seed integrity', () => {
    it('enriches every question with valid pattern metadata and judge cases', () => {
        const questions = JSON.parse(readFileSync(join(process.cwd(), 'data', 'questions.json'), 'utf-8'))
        const patternSlugs = new Set(corePatterns.map((pattern) => pattern.slug))
        const trackPatternSlugs = new Set(trackSeed.patterns.map((pattern) => pattern.patternSlug))

        for (const patternSlug of trackPatternSlugs) {
            expect(patternSlugs.has(patternSlug)).toBe(true)
        }

        for (const question of questions.map(enrichQuestion)) {
            expect(question.primaryPattern).toBeTruthy()
            expect(patternSlugs.has(question.primaryPattern)).toBe(true)

            if (question.testCases.length > 0) {
                expect(question.functionName).toBeTruthy()
                for (const testCase of question.testCases) {
                    expect(testCase).toHaveProperty('input')
                    expect(testCase).toHaveProperty('expected')
                }
            }
        }
    })
})

describe('coach and revision flow', () => {
    it('returns a beginner daily plan and creates revision from wrong submissions', async () => {
        await seedMinimalCoachData()
        const token = await register()

        const today = await request(app)
            .get('/api/coach/me/today')
            .set('Authorization', `Bearer ${token}`)

        expect(today.status).toBe(200)
        expect(today.body.tasks.some((task) => task.type === 'learn')).toBe(true)

        const wrong = await request(app)
            .post('/api/submissions/run')
            .set('Authorization', `Bearer ${token}`)
            .send({ questionId: 'two-sum', language: 'javascript', code: 'function twoSum(){ return [0, 2] }' })

        expect(wrong.status).toBe(200)
        expect(wrong.body.status).toBe('wrong_answer')
        expect(wrong.body.patternProgress.status).toBe('practicing')

        const revisions = await request(app)
            .get('/api/revision/me')
            .set('Authorization', `Bearer ${token}`)

        expect(revisions.status).toBe(200)
        expect(revisions.body).toHaveLength(1)
        expect(revisions.body[0].reason).toBe('wrong_answer')

        const mistakes = await request(app)
            .get('/api/coach/me/mistakes')
            .set('Authorization', `Bearer ${token}`)

        expect(mistakes.status).toBe(200)
        expect(mistakes.body.byTag.some((item) => item.tag === 'wrong_answer')).toBe(true)
        expect(mistakes.body.byTag[0]).toHaveProperty('advice')
    })

    it('updates mastery after accepted submissions', async () => {
        await seedMinimalCoachData()
        const token = await register()

        const accepted = await request(app)
            .post('/api/submissions/run')
            .set('Authorization', `Bearer ${token}`)
            .send({
                questionId: 'two-sum',
                language: 'javascript',
                code: 'function twoSum(nums,target){const seen=new Map(); for(let i=0;i<nums.length;i++){const need=target-nums[i]; if(seen.has(need)) return [seen.get(need), i]; seen.set(nums[i], i);}}',
            })

        expect(accepted.status).toBe(200)
        expect(accepted.body.status).toBe('accepted')
        expect(accepted.body.patternProgress.masteryScore).toBeGreaterThan(0)
    })

    it('prioritizes due revision in next actions and returns a skill profile', async () => {
        await seedMinimalCoachData()
        const token = await register()
        const question = await Question.findOne({ slug: 'two-sum' })
        const userResponse = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)

        await RevisionItem.create({
            userId: userResponse.body.user.id,
            questionId: question._id,
            patternSlug: 'hash-map-lookup',
            reason: 'manual',
            dueAt: new Date(Date.now() - 1000),
            priority: 1,
        })

        const actions = await request(app)
            .get('/api/coach/me/next-actions')
            .set('Authorization', `Bearer ${token}`)

        expect(actions.status).toBe(200)
        expect(actions.body[0].type).toBe('revision')

        const profile = await request(app)
            .get('/api/coach/me/skill-profile')
            .set('Authorization', `Bearer ${token}`)

        expect(profile.status).toBe(200)
        expect(profile.body).toHaveProperty('readinessScore')
        expect(profile.body).toHaveProperty('mistakeDistribution')
        expect(profile.body).toHaveProperty('recommendedPlan')
        expect(profile.body).toHaveProperty('blockers')
    })

    it('serves mixed practice with hidden pattern metadata', async () => {
        await seedMinimalCoachData()
        const token = await register()

        const mixed = await request(app)
            .get('/api/questions/mixed')
            .set('Authorization', `Bearer ${token}`)

        expect(mixed.status).toBe(200)
        expect(mixed.body[0].primaryPattern).toBeUndefined()
        expect(mixed.body[0].patterns).toEqual([])

        const run = await request(app)
            .post('/api/submissions/run')
            .set('Authorization', `Bearer ${token}`)
            .send({
                questionId: 'two-sum',
                language: 'javascript',
                code: 'function twoSum(){ return [0, 2] }',
                mode: 'mixed',
                patternGuess: 'hash-map-lookup',
            })

        expect(run.status).toBe(200)
        expect(run.body.revealedPattern.correctGuess).toBe(true)
    })
})

describe('interview and admin flows', () => {
    it('starts, runs, and finishes an interview session', async () => {
        await seedMinimalCoachData()
        const token = await register()

        const started = await request(app)
            .post('/api/interview/start')
            .set('Authorization', `Bearer ${token}`)
            .send({ language: 'javascript' })

        expect(started.status).toBe(201)
        expect(started.body.session._id).toBeTruthy()

        const run = await request(app)
            .post(`/api/interview/${started.body.session._id}/run`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                language: 'javascript',
                code: 'function twoSum(nums,target){const seen=new Map(); for(let i=0;i<nums.length;i++){const need=target-nums[i]; if(seen.has(need)) return [seen.get(need), i]; seen.set(nums[i], i);}}',
            })

        expect(run.status).toBe(200)
        expect(run.body.status).toBe('accepted')

        const finished = await request(app)
            .post(`/api/interview/${started.body.session._id}/finish`)
            .set('Authorization', `Bearer ${token}`)
            .send({ explanation: 'I track previously seen numbers in a map and return once the complement appears.' })

        expect(finished.status).toBe(200)
        expect(finished.body.status).toBe('finished')
        expect(finished.body.finalScore).toBeGreaterThan(0)
        expect(finished.body.scoreBreakdown).toHaveProperty('communication')
    })

    it('rejects admin content routes for non-admin users', async () => {
        await seedMinimalCoachData()
        const token = await register()

        const response = await request(app)
            .get('/api/admin/questions')
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(403)
    })
})
