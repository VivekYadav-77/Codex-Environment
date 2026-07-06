import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { pathToFileURL } from 'url'
import mongoose from 'mongoose'
import { connectDatabase } from '../config/db.js'
import { Question } from '../modules/questions/question.model.js'
import { Algorithm } from '../modules/algorithms/algorithm.model.js'
import { Pattern } from '../modules/patterns/pattern.model.js'
import { LearningTrack } from '../modules/tracks/learningTrack.model.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', '..', 'data')

const readJson = (filename) => JSON.parse(readFileSync(join(dataDir, filename), 'utf-8'))

export const corePatterns = [
    {
        slug: 'hash-map-lookup',
        name: 'Hash Map Lookup',
        category: 'Hashing',
        difficultyBand: 'beginner',
        description: 'Use a hash map to remember values you have seen so future lookups become constant time.',
        whenToUse: 'Use when the problem asks whether a complement, previous value, index, or mapping exists.',
        mentalModel: 'Carry a notebook of facts while scanning once. Each new item can answer a future question instantly.',
        prerequisites: [],
        templateNotes: 'Check the map before inserting when the same element cannot be reused.',
        commonMistakes: ['Updating the map before checking the complement', 'Forgetting duplicate values', 'Returning values instead of indices'],
        order: 1,
    },
    {
        slug: 'frequency-map',
        name: 'Frequency Map',
        category: 'Hashing',
        difficultyBand: 'beginner',
        description: 'Count how often each value appears, then use those counts to compare, group, or rank data.',
        whenToUse: 'Use when duplicates, anagrams, majority, uniqueness, or top-k frequency matters.',
        mentalModel: 'Turn a messy list into a compact count table.',
        prerequisites: ['hash-map-lookup'],
        templateNotes: 'Build counts first, then make decisions from the count table.',
        commonMistakes: ['Not handling missing keys', 'Comparing unsorted grouped output directly', 'Ignoring character or number ranges'],
        order: 2,
    },
    {
        slug: 'prefix-sum',
        name: 'Prefix Sum',
        category: 'Arrays',
        difficultyBand: 'intermediate',
        description: 'Track cumulative sums so range totals and target subarrays can be found without recomputing.',
        whenToUse: 'Use when a problem asks about subarray sums, range sums, or count of ranges.',
        mentalModel: 'A subarray sum is the distance between two milestones on a running total line.',
        prerequisites: ['hash-map-lookup'],
        templateNotes: 'Initialize count of prefix sum 0 before scanning.',
        commonMistakes: ['Forgetting the zero prefix', 'Updating count before checking target difference', 'Confusing subarray with subsequence'],
        order: 3,
    },
    {
        slug: 'two-pointers',
        name: 'Two Pointers',
        category: 'Arrays',
        difficultyBand: 'beginner',
        description: 'Move two indexes through a structure to shrink search space or compare positions efficiently.',
        whenToUse: 'Use on sorted arrays, pair searching, palindrome checks, or in-place partitioning.',
        mentalModel: 'Two hands move from useful positions and discard impossible areas.',
        prerequisites: [],
        templateNotes: 'Define exactly when left moves and when right moves.',
        commonMistakes: ['Moving both pointers too early', 'Using it on unsorted data without a reason', 'Missing equal-pointer termination'],
        order: 4,
    },
    {
        slug: 'sliding-window',
        name: 'Sliding Window',
        category: 'Arrays',
        difficultyBand: 'intermediate',
        description: 'Maintain a valid window over contiguous data while expanding and shrinking boundaries.',
        whenToUse: 'Use when the problem asks about longest, shortest, or count over contiguous subarrays/substrings.',
        mentalModel: 'A flexible frame moves across the array, keeping only the useful current segment.',
        prerequisites: ['two-pointers', 'frequency-map'],
        templateNotes: 'Expand right every step; shrink left while the window is invalid.',
        commonMistakes: ['Shrinking at the wrong time', 'Not updating answer after restoring validity', 'Using window for non-contiguous problems'],
        order: 5,
    },
    {
        slug: 'stack-pattern',
        name: 'Stack Patterns',
        category: 'Stacks',
        difficultyBand: 'intermediate',
        description: 'Use last-in-first-out memory to match, undo, evaluate, or maintain monotonic order.',
        whenToUse: 'Use for parentheses, next greater element, expression evaluation, or nested structures.',
        mentalModel: 'The most recent unresolved item should be solved first.',
        prerequisites: [],
        templateNotes: 'Push unresolved items; pop when the current item resolves them.',
        commonMistakes: ['Forgetting final stack validation', 'Storing values when indices are needed', 'Breaking monotonic stack direction'],
        order: 6,
    },
    {
        slug: 'binary-search',
        name: 'Binary Search',
        category: 'Searching',
        difficultyBand: 'intermediate',
        description: 'Repeatedly halve a sorted or monotonic search space.',
        whenToUse: 'Use when data is sorted or the answer space has a monotonic true/false property.',
        mentalModel: 'Ask a yes/no question that removes half the remaining possibilities.',
        prerequisites: [],
        templateNotes: 'Choose inclusive or exclusive boundaries and keep them consistent.',
        commonMistakes: ['Infinite loops from boundary updates', 'Overflow or wrong midpoint', 'Using binary search without monotonicity'],
        order: 7,
    },
    {
        slug: 'linked-list-pointers',
        name: 'Linked List Pointers',
        category: 'Linked Lists',
        difficultyBand: 'intermediate',
        description: 'Manipulate node references carefully with dummy nodes, slow/fast pointers, or previous/current links.',
        whenToUse: 'Use for reversal, cycle detection, merging, removal, and pointer rearrangement.',
        mentalModel: 'You are rewiring arrows; never lose the next node before changing a link.',
        prerequisites: ['two-pointers'],
        templateNotes: 'Save next before rewiring current.next.',
        commonMistakes: ['Losing a node reference', 'Not using a dummy node for head changes', 'Off-by-one on nth-from-end'],
        order: 8,
    },
    {
        slug: 'tree-dfs',
        name: 'Tree DFS',
        category: 'Trees',
        difficultyBand: 'intermediate',
        description: 'Use recursion or an explicit stack to explore tree branches deeply.',
        whenToUse: 'Use for depth, paths, validation, inversion, and subtree comparisons.',
        mentalModel: 'Solve the current node by asking the left and right subtrees for answers.',
        prerequisites: [],
        templateNotes: 'Define base case, recursive result, and combine step.',
        commonMistakes: ['Missing null base case', 'Confusing height and depth', 'Using global state when return values are cleaner'],
        order: 9,
    },
    {
        slug: 'tree-bfs',
        name: 'Tree BFS',
        category: 'Trees',
        difficultyBand: 'intermediate',
        description: 'Use a queue to process trees level by level.',
        whenToUse: 'Use for level order, shortest depth, width, or nearest node by edges.',
        mentalModel: 'Visit everyone at the current distance before moving farther away.',
        prerequisites: ['tree-dfs'],
        templateNotes: 'Capture queue length before each level loop.',
        commonMistakes: ['Mixing levels accidentally', 'Using shift repeatedly on huge JS arrays', 'Forgetting to enqueue children conditionally'],
        order: 10,
    },
    {
        slug: 'graph-bfs-dfs',
        name: 'Graph BFS/DFS',
        category: 'Graphs',
        difficultyBand: 'intermediate',
        description: 'Traverse graph nodes with visited state to avoid cycles and repeated work.',
        whenToUse: 'Use for connectivity, islands, cloning, components, and reachability.',
        mentalModel: 'Explore a map while marking places already visited.',
        prerequisites: ['tree-dfs', 'tree-bfs'],
        templateNotes: 'Mark visited when enqueuing or entering a node, not after all neighbors.',
        commonMistakes: ['No visited set', 'Mutating grid accidentally', 'Confusing directed and undirected edges'],
        order: 11,
    },
    {
        slug: 'heap-priority-queue',
        name: 'Heap / Priority Queue',
        category: 'Queues',
        difficultyBand: 'intermediate',
        description: 'Keep only the next best item available by priority.',
        whenToUse: 'Use for top-k, scheduling, merging sorted lists, or repeated min/max extraction.',
        mentalModel: 'A todo list that always hands you the most urgent item.',
        prerequisites: ['frequency-map'],
        templateNotes: 'For top-k, choose min-heap of size k or max-heap of all items.',
        commonMistakes: ['Using full sort when heap is enough', 'Wrong heap direction', 'Not limiting heap size'],
        order: 12,
    },
    {
        slug: 'backtracking',
        name: 'Backtracking',
        category: 'Backtracking',
        difficultyBand: 'advanced',
        description: 'Explore choices recursively, undoing each choice before trying the next.',
        whenToUse: 'Use for combinations, permutations, subsets, constraints, and search over decisions.',
        mentalModel: 'Walk a decision tree; each branch tries one possible future.',
        prerequisites: ['tree-dfs'],
        templateNotes: 'Choose, recurse, unchoose.',
        commonMistakes: ['Forgetting to undo state', 'Adding mutable references to answers', 'Missing pruning opportunities'],
        order: 13,
    },
    {
        slug: 'dp-foundations',
        name: 'Dynamic Programming Foundations',
        category: 'Dynamic Programming',
        difficultyBand: 'advanced',
        description: 'Break problems into overlapping subproblems and store results.',
        whenToUse: 'Use when recursion repeats the same states and the optimal answer depends on smaller answers.',
        mentalModel: 'Turn expensive repeated thinking into a table of remembered answers.',
        prerequisites: ['backtracking'],
        templateNotes: 'Define state, transition, base case, and answer extraction.',
        commonMistakes: ['Wrong state definition', 'Missing base case', 'Confusing greedy with DP'],
        order: 14,
    },
]

export const trackSeed = {
    slug: 'dsa-foundations-to-interview-ready',
    title: 'DSA Foundations to Interview Ready',
    level: 'beginner',
    targetOutcome: 'Move from core DSA fundamentals to interview-ready pattern recognition.',
    estimatedProblemCount: 80,
    patterns: corePatterns.map((pattern) => ({ patternSlug: pattern.slug, order: pattern.order })),
}

export const topicDefaults = {
    hashing: 'hash-map-lookup',
    searching: 'binary-search',
    stacks: 'stack-pattern',
    queues: 'heap-priority-queue',
    'linked-lists': 'linked-list-pointers',
    trees: 'tree-dfs',
    graphs: 'graph-bfs-dfs',
    sorting: 'two-pointers',
}

export const questionPatternOverrides = {
    'two-sum': 'hash-map-lookup',
    'contains-duplicate': 'frequency-map',
    'first-unique-char': 'frequency-map',
    'group-anagrams': 'frequency-map',
    'longest-consecutive': 'hash-map-lookup',
    'subarray-sum-k': 'prefix-sum',
    'top-k-frequent': 'heap-priority-queue',
    'valid-anagram': 'frequency-map',
    'isomorphic-strings': 'hash-map-lookup',
    'binary-search-target': 'binary-search',
    'search-insert': 'binary-search',
    'search-rotated': 'binary-search',
    'find-minimum-rotated': 'binary-search',
    'search-2d-matrix': 'binary-search',
    'valid-parentheses': 'stack-pattern',
    'daily-temperatures': 'stack-pattern',
    'reverse-linked-list': 'linked-list-pointers',
    'linked-list-cycle': 'linked-list-pointers',
    'middle-linked-list': 'linked-list-pointers',
    'num-islands': 'graph-bfs-dfs',
    'course-schedule': 'graph-bfs-dfs',
    'sort-colors': 'two-pointers',
    'merge-intervals': 'two-pointers',
}

export const hashingJudge = {
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

export const enrichQuestion = (question) => {
    const judge = hashingJudge[question.id] || {}
    const primaryPattern = questionPatternOverrides[question.id] || topicDefaults[question.topic] || 'hash-map-lookup'
    const patternList = Array.from(new Set([primaryPattern, ...(judge.patterns || [])]))
    return {
        slug: question.id,
        title: question.title,
        topic: question.topic,
        patterns: patternList,
        primaryPattern,
        prerequisites: corePatterns.find((pattern) => pattern.slug === primaryPattern)?.prerequisites || [],
        learningOrder: corePatterns.find((pattern) => pattern.slug === primaryPattern)?.order || 999,
        coachTags: [question.topic, question.difficulty.toLowerCase(), primaryPattern],
        lessonRefs: [primaryPattern],
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

export async function seed() {
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
    await Pattern.deleteMany({})
    await LearningTrack.deleteMany({})
    await Question.insertMany(questions)
    await Algorithm.insertMany(algorithms)
    await Pattern.insertMany(corePatterns)
    await LearningTrack.create(trackSeed)

    console.log(`Seeded ${questions.length} questions, ${algorithms.length} algorithms, ${corePatterns.length} patterns, and 1 learning track.`)
    await mongoose.disconnect()
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
    seed().catch(async (error) => {
        console.error('Seed failed:', error)
        await mongoose.disconnect()
        process.exit(1)
    })
}
