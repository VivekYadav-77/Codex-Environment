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
import { ConceptCheck } from '../modules/conceptChecks/conceptCheck.model.js'
import { SystemDesignConcept } from '../modules/systemDesign/systemDesignConcept.model.js'
import { SystemDesignPrompt } from '../modules/systemDesign/systemDesignPrompt.model.js'
import { systemDesignConceptSeeds, systemDesignPromptSeeds } from '../modules/systemDesign/systemDesign.content.js'

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

export const trackSeeds = [
    {
        slug: 'track-1-foundation',
        title: 'Track 1: The Foundation (Beginner)',
        level: 'beginner',
        targetOutcome: 'For a student who has never done DSA. Focuses on mental models and the language of efficiency.',
        estimatedProblemCount: 20,
        patterns: [
            { patternSlug: 'hash-map-lookup', order: 1 },
            { patternSlug: 'frequency-map', order: 2 },
            { patternSlug: 'two-pointers', order: 3 }
        ],
    },
    {
        slug: 'track-2-intermediate',
        title: 'Track 2: Intermediate Data Structures (Core)',
        level: 'intermediate',
        targetOutcome: 'Building the essential toolkit. Learn about Linked Lists, Stacks, Queues, and Trees.',
        estimatedProblemCount: 40,
        patterns: [
            { patternSlug: 'sliding-window', order: 1 },
            { patternSlug: 'stack-pattern', order: 2 },
            { patternSlug: 'binary-search', order: 3 },
            { patternSlug: 'linked-list-pointers', order: 4 },
            { patternSlug: 'tree-dfs', order: 5 },
            { patternSlug: 'tree-bfs', order: 6 }
        ],
    },
    {
        slug: 'track-3-advanced',
        title: 'Track 3: Advanced Algorithms (Industry Level)',
        level: 'intermediate',
        targetOutcome: 'The separator between good and great. Graphs, Dynamic Programming, Heaps, and Tries.',
        estimatedProblemCount: 30,
        patterns: [
            { patternSlug: 'graph-bfs-dfs', order: 1 },
            { patternSlug: 'heap-priority-queue', order: 2 },
            { patternSlug: 'dp-foundations', order: 3 }
        ],
    },
    {
        slug: 'track-4-interview',
        title: 'Track 4: Interview Masterclass',
        level: 'interview',
        targetOutcome: 'Curated patterns to crack top tech companies.',
        estimatedProblemCount: 50,
        patterns: [
            { patternSlug: 'backtracking', order: 1 },
            { patternSlug: 'dp-foundations', order: 2 }
        ],
    }
]

const patternLabExtras = {
    'hash-map-lookup': {
        analogy: 'Imagine checking a guest list while people enter. Instead of asking everyone again, you keep a notebook of who already arrived.',
        signalRules: ['Need to find a complement or previous value', 'Need O(1) lookup while scanning', 'Problem mentions pairs, indexes, or seen-before values'],
        antiSignals: ['Input must remain sorted and order alone solves it', 'The problem needs all combinations, not one lookup decision'],
        visualSteps: ['Start with an empty map', 'For each value, compute the needed complement', 'Check the map before inserting current value', 'Return once the complement is found'],
        trapExamples: ['Inserting before checking can reuse the same element', 'Returning values instead of indexes in Two Sum'],
        bruteForceToOptimized: 'The brute force checks every pair in O(n^2). The optimized version remembers previous values in a map so each complement check becomes O(1).',
        guidedProblemSlugs: ['two-sum', 'contains-duplicate', 'isomorphic-strings'],
        mixedProblemSlugs: ['longest-consecutive', 'subarray-sum-k', 'valid-anagram'],
        interviewProblemSlugs: ['two-sum'],
    },
    'frequency-map': {
        analogy: 'Like sorting votes into buckets before deciding who won.',
        signalRules: ['Duplicates or counts matter', 'Need compare two collections', 'Words like frequency, anagram, unique, majority, top-k appear'],
        antiSignals: ['Only relative position matters', 'Need contiguous window without global counts'],
        visualSteps: ['Create a count table', 'Increment count for each value', 'Use counts to compare, group, or rank', 'Handle missing keys explicitly'],
        trapExamples: ['Forgetting different lengths in anagram checks', 'Comparing grouped arrays without unordered comparison'],
        bruteForceToOptimized: 'Repeated counting scans the same data many times. A frequency map counts once and answers many questions from the table.',
        guidedProblemSlugs: ['contains-duplicate', 'first-unique-char', 'valid-anagram'],
        mixedProblemSlugs: ['group-anagrams', 'top-k-frequent'],
        interviewProblemSlugs: ['group-anagrams'],
    },
    'two-pointers': {
        analogy: 'Two people walk from opposite ends of a street and eliminate impossible shops as they move.',
        signalRules: ['Sorted array or string symmetry', 'Need pair search, palindrome check, partition, or in-place movement', 'Can discard one side after each comparison'],
        antiSignals: ['Unsorted data with no monotonic rule', 'Need random membership lookup instead of directional movement'],
        visualSteps: ['Place left and right pointers', 'Compare current values', 'Move the pointer that cannot be part of the answer', 'Stop when pointers meet or cross'],
        trapExamples: ['Moving both pointers after one comparison', 'Forgetting to sort only when index preservation is not required'],
        bruteForceToOptimized: 'The brute force tries many pairs. Two pointers use sorted structure or symmetry to discard impossible pairs in linear time.',
        guidedProblemSlugs: ['sort-colors'],
        mixedProblemSlugs: ['merge-intervals'],
        interviewProblemSlugs: ['sort-colors'],
    },
    'binary-search': {
        analogy: 'Like guessing a number by always asking whether the answer is higher or lower.',
        signalRules: ['Sorted input', 'Monotonic yes/no condition', 'Need minimum feasible answer or exact target'],
        antiSignals: ['No sorted order or monotonic predicate', 'Every item must be inspected independently'],
        visualSteps: ['Define search boundaries', 'Pick middle', 'Ask the monotonic question', 'Discard half safely'],
        trapExamples: ['Boundary update causes infinite loop', 'Using binary search when predicate is not monotonic'],
        bruteForceToOptimized: 'Linear scan checks each candidate. Binary search asks a stronger question and removes half the space each step.',
        guidedProblemSlugs: ['binary-search-target', 'search-insert'],
        mixedProblemSlugs: ['search-rotated', 'find-minimum-rotated'],
        interviewProblemSlugs: ['search-2d-matrix'],
    },
}

const sentence = (value, fallback = '') => (value || fallback || '').replace(/\s+/g, ' ').trim()

const makePracticeLadder = (pattern) => [
    {
        title: 'Understand',
        body: `Name the signal that suggests ${pattern.name} before writing code.`,
        bullets: [pattern.whenToUse || pattern.description, 'Write the invariant in one sentence.'],
    },
    {
        title: 'Apply',
        body: 'Solve a labeled guided problem and explain the template out loud.',
        bullets: ['Trace a small input by hand.', 'Run visible examples before hidden edge cases.'],
    },
    {
        title: 'Transfer',
        body: 'Solve a mixed problem where the pattern label is hidden.',
        bullets: ['Compare this pattern against at least one anti-signal.', 'Record why the final approach is better than brute force.'],
    },
]

const buildPatternDepth = (pattern, extras = {}) => ({
    learningObjectives: [
        `Recognize when ${pattern.name} is the right pattern.`,
        `Explain the invariant behind ${pattern.name}.`,
        `Move from brute force to the optimized ${pattern.name} approach.`,
        'Handle common edge cases without relying on hints.',
    ],
    beginnerExplanation: `${pattern.name} is useful because it gives you a repeatable way to reduce unnecessary work. Start by identifying the input structure, then keep the smallest state needed to make each next decision.`,
    workedExample: {
        title: `${pattern.name} mini trace`,
        body: `Take a small example, mark the useful state after each step, and explain why every discarded option can no longer improve the answer.`,
        bullets: extras.visualSteps || ['Identify the signal', 'Track the invariant', 'Update the state', 'Check the answer'],
    },
    codeTemplate: {
        javascript: `// ${pattern.name} template\nfunction solve(input) {\n  // 1. Identify the signal\n  // 2. Maintain the invariant\n  // 3. Update the answer safely\n  return null;\n}`,
        python: `# ${pattern.name} template\ndef solve(input):\n    # 1. Identify the signal\n    # 2. Maintain the invariant\n    # 3. Update the answer safely\n    return None`,
    },
    complexityReasoning: {
        title: 'Complexity reasoning',
        body: 'Count how many times each input item can enter and leave the maintained state, then count any extra storage used for lookup, recursion, or queues.',
        bullets: ['Avoid saying only the final Big O; explain why repeated work disappeared.', 'Mention the data structure that creates the space cost.'],
    },
    edgeCases: ['Empty input or single item', 'Duplicate values', 'Already optimal or no-answer case', 'Boundary movement at the first and last index'],
    misconceptions: [
        {
            title: 'Pattern overuse',
            body: `Do not force ${pattern.name} unless the problem has the signal and invariant it depends on.`,
            bullets: extras.antiSignals || ['Check whether another simpler pattern fits better.'],
        },
    ],
    interviewExplanation: `I would first state the ${pattern.name} signal, describe the invariant, then trace a small example before coding. After coding, I would test the edge cases that usually break this pattern.`,
    revisionPrompts: [
        `What exact signal made ${pattern.name} applicable?`,
        'What state did I maintain, and why was it enough?',
        'Which edge case would break a careless implementation?',
    ],
    practiceLadder: makePracticeLadder(pattern),
})

const enrichPattern = (pattern) => ({
    ...pattern,
    analogy: patternLabExtras[pattern.slug]?.analogy || pattern.mentalModel,
    signalRules: patternLabExtras[pattern.slug]?.signalRules || [pattern.whenToUse],
    antiSignals: patternLabExtras[pattern.slug]?.antiSignals || ['When the input lacks the structure this pattern depends on.'],
    visualSteps: patternLabExtras[pattern.slug]?.visualSteps || ['Identify the signal', 'Write the invariant', 'Apply the template', 'Test edge cases'],
    trapExamples: patternLabExtras[pattern.slug]?.trapExamples || pattern.commonMistakes,
    bruteForceToOptimized: patternLabExtras[pattern.slug]?.bruteForceToOptimized || 'Start from the obvious correct solution, then remove repeated work by using the pattern invariant.',
    guidedProblemSlugs: patternLabExtras[pattern.slug]?.guidedProblemSlugs || [],
    mixedProblemSlugs: patternLabExtras[pattern.slug]?.mixedProblemSlugs || [],
    interviewProblemSlugs: patternLabExtras[pattern.slug]?.interviewProblemSlugs || [],
    ...buildPatternDepth(pattern, patternLabExtras[pattern.slug]),
})

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
    'longest-substring-without-repeating-characters': 'sliding-window',
    'number-of-islands': 'graph-bfs-dfs',
    'climbing-stairs': 'dp-foundations',
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
    const pattern = corePatterns.find((item) => item.slug === primaryPattern)
    const examples = question.examples || []
    const visibleExample = examples[0]
    const officialSolution = {
        bruteForceApproach: `Start with the most direct correct approach: try the obvious choices, compare them against the requirement, and keep the best valid answer. This is useful for correctness but may repeat work.`,
        optimizedApproach: `Use ${pattern?.name || primaryPattern} to remove repeated checks. Maintain the pattern state while scanning or exploring so each decision uses information already collected.`,
        complexityExplanation: `The optimized approach should explain time in terms of input visits and space in terms of the maintained ${pattern?.name || 'pattern'} state.`,
        code: judge.starterCode || question.starterCode || {},
        commonMistakes: pattern?.commonMistakes || ['Missing edge cases', 'Returning the wrong shape', 'Not testing duplicates or empty input'],
        patternSignals: [pattern?.whenToUse || primaryPattern, ...(patternList || [])].filter(Boolean),
        interviewExplanation: `I would explain the brute force first, identify the ${pattern?.name || primaryPattern} signal, then show how the maintained state avoids repeated work and test the edge cases.`,
        followUpVariants: ['Return all valid answers instead of one.', 'Optimize for memory when the input is very large.', 'Explain how the approach changes when input constraints change.'],
        relatedProblems: [],
        misconceptionSlugs: [`${primaryPattern}-signal`, `${primaryPattern}-edge-case`],
    }

    return {
        slug: question.id,
        title: question.title,
        topic: question.topic,
        patterns: patternList,
        primaryPattern,
        prerequisites: pattern?.prerequisites || [],
        learningOrder: pattern?.order || 999,
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
        officialSolution,
        learningObjectives: [
            `Identify why ${pattern?.name || primaryPattern} fits this problem.`,
            'Write a correct brute-force baseline before optimizing.',
            'Handle edge cases visible in examples and hidden tests.',
        ],
        beginnerExplanation: `${question.title} is a ${question.difficulty} ${question.topic} problem. Focus first on the input/output contract, then decide what information must be remembered or discarded after each step.`,
        workedExample: {
            title: visibleExample ? 'Walk through the first example' : 'Build a small trace',
            body: visibleExample ? `Use the first example to trace every state update before coding.` : 'Create a tiny input and trace the state by hand before opening the editor.',
            bullets: ['Restate the expected output', 'Track the key state after each step', 'Explain why the answer is valid'],
        },
        visualWalkthrough: ['Read input constraints', 'Choose the pattern state', 'Process each item', 'Validate answer and edge cases'],
        edgeCases: ['Empty or minimum-size input', 'Duplicate values', 'No valid answer if allowed by the prompt', 'Large input that exposes repeated work'],
        revisionPrompts: ['Could I solve it again without hints?', 'What pattern signal did I notice?', 'Which test case caught the risky branch?'],
        profileSignals: [primaryPattern, question.difficulty.toLowerCase(), question.topic],
        isActive: true,
    }
}

const enrichAlgorithm = (algorithm) => ({
    slug: algorithm.id,
    name: algorithm.name,
    category: algorithm.category,
    complexity: algorithm.complexity,
    description: sentence(algorithm.description, `${algorithm.name} explains a core ${algorithm.category} technique.`),
    operations: algorithm.operations || [],
    code: algorithm.code,
    practice: algorithm.practice,
    prerequisites: algorithm.category === 'advanced' ? ['arrays', 'recursion'] : [],
    learningObjectives: [
        `Explain what ${algorithm.name} does and when it is useful.`,
        `Trace ${algorithm.name} step by step on a small input.`,
        'Connect the implementation to its time and space complexity.',
    ],
    beginnerExplanation: `${algorithm.name} is best learned by watching how its state changes after each operation. Focus on the invariant: what must remain true after every step.`,
    mentalModel: `Think of ${algorithm.name} as a repeatable procedure made from these operations: ${(algorithm.operations || ['inspect', 'update']).join(', ')}.`,
    workedExample: {
        title: `${algorithm.name} trace`,
        body: 'Use a tiny input, write the state before and after each operation, and explain why the final state is correct.',
        bullets: (algorithm.operations || []).slice(0, 4).map((operation) => `Watch the ${operation} operation`) || ['Trace the state changes'],
    },
    visualWalkthrough: [
        'Initialize the input and helper state',
        'Highlight the active values or nodes',
        'Apply the core operation',
        'Repeat until the invariant proves completion',
    ],
    complexityReasoning: {
        title: `${algorithm.name} complexity`,
        body: `Time is ${algorithm.complexity?.time || 'based on input growth'} and space is ${algorithm.complexity?.space || 'based on helper state'}. The explanation should connect each loop, recursion level, or data structure to that bound.`,
        bullets: ['Count repeated visits', 'Count helper memory', 'Mention best/worst cases when they differ'],
    },
    commonMisconceptions: [
        {
            title: 'Memorizing code without invariant',
            body: `The important part of ${algorithm.name} is why each operation preserves correctness, not just the syntax.`,
            bullets: ['Trace before memorizing', 'Name the invariant in plain language'],
        },
    ],
    edgeCases: ['Empty input', 'Single item input', 'Already processed input', 'Duplicate or equal values when comparisons matter'],
    interviewExplanation: `In an interview, introduce ${algorithm.name}, state the invariant, explain the complexity, and walk through one edge case before coding.`,
    revisionPrompts: [`What invariant does ${algorithm.name} maintain?`, 'Where does the time complexity come from?', 'Which edge case changes the control flow?'],
})

const buildConceptChecks = (pattern) => [
    {
        patternSlug: pattern.slug,
        skill: 'signal',
        difficulty: 'intro',
        question: `Which signal best suggests using ${pattern.name}?`,
        options: [
            pattern.whenToUse || pattern.description,
            'The problem only asks for formatting output.',
            'The input must always be ignored.',
        ],
        correctIndex: 0,
        explanation: pattern.whenToUse || pattern.description,
    },
    {
        patternSlug: pattern.slug,
        skill: 'misconception',
        difficulty: 'practice',
        question: `What is a common mistake with ${pattern.name}?`,
        options: [
            pattern.commonMistakes?.[0] || 'Forgetting to maintain the invariant.',
            'Always writing more nested loops is required.',
            'Never testing boundary inputs.',
        ],
        correctIndex: 0,
        explanation: pattern.commonMistakes?.[0] || `The invariant is what makes ${pattern.name} reliable.`,
    },
    {
        patternSlug: pattern.slug,
        skill: 'edge_case',
        difficulty: 'interview',
        question: `Before claiming ${pattern.name} is correct, what should you verify?`,
        options: [
            'Minimum-size input, duplicates, and boundary movement.',
            'Only the happy path from the sample.',
            'Only whether the code is short.',
        ],
        correctIndex: 0,
        explanation: 'Profile value improves when a learner can name the risky edge cases, not only pass the sample.',
    },
]

export async function seed() {
    await connectDatabase()

    const questions = readJson('questions.json').map(enrichQuestion)

    // Merge main algorithms with all supplementary phase files
    const baseAlgorithms = readJson('algorithms.json')
    const supplementaryFiles = ['algorithms_phase1.json']
    const extraAlgorithms = supplementaryFiles.flatMap(f => {
        try { return readJson(f) } catch { return [] }
    })
    // De-duplicate by id (supplementary overrides base if same id)
    const allAlgorithmMap = new Map()
    for (const a of [...baseAlgorithms, ...extraAlgorithms]) {
        allAlgorithmMap.set(a.id || a.slug, a)
    }
    const algorithms = [...allAlgorithmMap.values()].map(enrichAlgorithm)

    await Question.deleteMany({})
    await Algorithm.deleteMany({})
    await Pattern.deleteMany({})
    await LearningTrack.deleteMany({})
    await ConceptCheck.deleteMany({})
    await SystemDesignConcept.deleteMany({})
    await SystemDesignPrompt.deleteMany({})
    await Question.insertMany(questions)
    await Algorithm.insertMany(algorithms)
    await Pattern.insertMany(corePatterns.map(enrichPattern))
    await ConceptCheck.insertMany(corePatterns.flatMap((pattern) => buildConceptChecks(pattern)))
    await LearningTrack.insertMany(trackSeeds)
    await SystemDesignConcept.insertMany(systemDesignConceptSeeds)
    await SystemDesignPrompt.insertMany(systemDesignPromptSeeds)

    console.log(`Seeded ${questions.length} questions, ${algorithms.length} algorithms, ${corePatterns.length} patterns, ${corePatterns.length * 3} concept checks, ${systemDesignConceptSeeds.length} system design concepts, ${systemDesignPromptSeeds.length} prompts, and ${trackSeeds.length} learning tracks.`)
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
