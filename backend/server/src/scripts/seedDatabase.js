import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { connectDatabase } from '../config/db.js'
import { Question } from '../modules/questions/question.model.js'
import { Algorithm } from '../modules/algorithms/algorithm.model.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', '..', 'data')

const readJson = (filename) => JSON.parse(readFileSync(join(dataDir, filename), 'utf-8'))

const hashingJudge = {
    'two-sum': {
        functionName: 'twoSum',
        patterns: ['hash-map', 'one-pass'],
        starterCode: {
            javascript: 'function twoSum(nums, target) {\n  // Your code here\n}',
            python: 'def twoSum(nums, target):\n    # Your code here\n    pass',
        },
        testCases: [
            { name: 'Example 1', input: [[2, 7, 11, 15], 9], expected: [0, 1], visible: true, category: 'Example' },
            { name: 'Example 2', input: [[3, 2, 4], 6], expected: [1, 2], visible: true, category: 'Example' },
            { name: 'Negative numbers', input: [[-3, 4, 3, 90], 0], expected: [0, 2], visible: false, category: 'Edge case' },
            { name: 'Duplicate values', input: [[3, 3], 6], expected: [0, 1], visible: false, category: 'Duplicate handling' },
        ],
    },
    'contains-duplicate': {
        functionName: 'containsDuplicate',
        patterns: ['hash-set'],
        starterCode: {
            javascript: 'function containsDuplicate(nums) {\n  // Your code here\n}',
            python: 'def containsDuplicate(nums):\n    pass',
        },
        testCases: [
            { name: 'Has duplicate', input: [[1, 2, 3, 1]], expected: true, visible: true, category: 'Example' },
            { name: 'All distinct', input: [[1, 2, 3, 4]], expected: false, visible: true, category: 'Example' },
            { name: 'Single item', input: [[1]], expected: false, visible: false, category: 'Edge case' },
            { name: 'Repeated negative', input: [[-1, -2, -1]], expected: true, visible: false, category: 'Negative numbers' },
        ],
    },
    'first-unique-char': {
        functionName: 'firstUniqChar',
        patterns: ['frequency-map'],
        starterCode: {
            javascript: 'function firstUniqChar(s) {\n  // Your code here\n}',
            python: 'def firstUniqChar(s):\n    pass',
        },
        testCases: [
            { name: 'First char unique', input: ['leetcode'], expected: 0, visible: true, category: 'Example' },
            { name: 'Middle unique', input: ['loveleetcode'], expected: 2, visible: true, category: 'Example' },
            { name: 'No unique', input: ['aabb'], expected: -1, visible: false, category: 'No answer' },
        ],
    },
    'group-anagrams': {
        functionName: 'groupAnagrams',
        patterns: ['hash-map', 'sorting-key'],
        starterCode: {
            javascript: 'function groupAnagrams(strs) {\n  // Your code here\n}',
            python: 'def groupAnagrams(strs):\n    pass',
        },
        testCases: [
            { name: 'Mixed groups', input: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']], visible: true, category: 'Example', compareMode: 'unordered' },
            { name: 'Empty string', input: [['']], expected: [['']], visible: false, category: 'Edge case', compareMode: 'unordered' },
            { name: 'Single string', input: [['a']], expected: [['a']], visible: false, category: 'Edge case', compareMode: 'unordered' },
        ],
    },
    'longest-consecutive': {
        functionName: 'longestConsecutive',
        patterns: ['hash-set', 'sequence'],
        starterCode: {
            javascript: 'function longestConsecutive(nums) {\n  // Your code here\n}',
            python: 'def longestConsecutive(nums):\n    pass',
        },
        testCases: [
            { name: 'Example 1', input: [[100, 4, 200, 1, 3, 2]], expected: 4, visible: true, category: 'Example' },
            { name: 'Empty array', input: [[]], expected: 0, visible: false, category: 'Edge case' },
            { name: 'Duplicates', input: [[1, 2, 0, 1]], expected: 3, visible: false, category: 'Duplicates' },
        ],
    },
    'subarray-sum-k': {
        functionName: 'subarraySum',
        patterns: ['prefix-sum', 'hash-map'],
        starterCode: {
            javascript: 'function subarraySum(nums, k) {\n  // Your code here\n}',
            python: 'def subarraySum(nums, k):\n    pass',
        },
        testCases: [
            { name: 'Example 1', input: [[1, 1, 1], 2], expected: 2, visible: true, category: 'Example' },
            { name: 'Example 2', input: [[1, 2, 3], 3], expected: 2, visible: true, category: 'Example' },
            { name: 'Includes zero', input: [[0, 0, 0], 0], expected: 6, visible: false, category: 'Zeros' },
        ],
    },
    'top-k-frequent': {
        functionName: 'topKFrequent',
        patterns: ['frequency-map', 'heap'],
        starterCode: {
            javascript: 'function topKFrequent(nums, k) {\n  // Your code here\n}',
            python: 'def topKFrequent(nums, k):\n    pass',
        },
        testCases: [
            { name: 'Example 1', input: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2], visible: true, category: 'Example', compareMode: 'unordered' },
            { name: 'Single result', input: [[1], 1], expected: [1], visible: true, category: 'Example', compareMode: 'unordered' },
            { name: 'Negative numbers', input: [[-1, -1, 2, 2, 2, 3], 2], expected: [2, -1], visible: false, category: 'Negative numbers', compareMode: 'unordered' },
        ],
    },
    'valid-anagram': {
        functionName: 'isAnagram',
        patterns: ['frequency-map'],
        starterCode: {
            javascript: 'function isAnagram(s, t) {\n  // Your code here\n}',
            python: 'def isAnagram(s, t):\n    pass',
        },
        testCases: [
            { name: 'Valid anagram', input: ['anagram', 'nagaram'], expected: true, visible: true, category: 'Example' },
            { name: 'Different letters', input: ['rat', 'car'], expected: false, visible: true, category: 'Example' },
            { name: 'Different length', input: ['a', 'ab'], expected: false, visible: false, category: 'Length mismatch' },
        ],
    },
    'isomorphic-strings': {
        functionName: 'isIsomorphic',
        patterns: ['hash-map', 'bijection'],
        starterCode: {
            javascript: 'function isIsomorphic(s, t) {\n  // Your code here\n}',
            python: 'def isIsomorphic(s, t):\n    pass',
        },
        testCases: [
            { name: 'Paper title', input: ['paper', 'title'], expected: true, visible: true, category: 'Example' },
            { name: 'Foo bar', input: ['foo', 'bar'], expected: false, visible: true, category: 'Example' },
            { name: 'Bad reverse mapping', input: ['ab', 'aa'], expected: false, visible: false, category: 'Bijection' },
        ],
    },
}

const enrichQuestion = (question) => {
    const judge = hashingJudge[question.id] || {}
    return {
        slug: question.id,
        title: question.title,
        topic: question.topic,
        patterns: judge.patterns || [],
        difficulty: question.difficulty,
        description: question.description,
        examples: question.examples || [],
        starterCode: {
            javascript: judge.starterCode?.javascript || question.starterCode?.javascript || '',
            python: judge.starterCode?.python || question.starterCode?.python || '',
        },
        functionName: judge.functionName || '',
        testCases: judge.testCases || [],
        hints: question.hints || [],
        isActive: true,
    }
}

async function seed() {
    await connectDatabase()

    const questions = readJson('questions.json').map(enrichQuestion)
    const algorithms = readJson('algorithms.json').map((algorithm) => ({
        slug: algorithm.id,
        name: algorithm.name,
        category: algorithm.category,
        complexity: algorithm.complexity,
        description: algorithm.description,
        operations: algorithm.operations || [],
        code: algorithm.code,
        practice: algorithm.practice,
    }))

    await Question.deleteMany({})
    await Algorithm.deleteMany({})
    await Question.insertMany(questions)
    await Algorithm.insertMany(algorithms)

    console.log(`Seeded ${questions.length} questions and ${algorithms.length} algorithms.`)
    await mongoose.disconnect()
}

seed().catch(async (error) => {
    console.error('Seed failed:', error)
    await mongoose.disconnect()
    process.exit(1)
})
