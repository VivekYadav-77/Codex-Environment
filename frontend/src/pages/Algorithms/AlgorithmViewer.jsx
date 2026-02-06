import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    RotateCcw,
    Shuffle,
    Code2,
    BarChart3,
    Loader2
} from 'lucide-react'
import { Button, IconButton } from '../../components/ui/Button'
import { GlassPanel } from '../../components/ui/Glass'
import {
    setSteps,
    setCurrentStep,
    nextStep,
    prevStep,
    pause,
    togglePlay,
    setPlaybackSpeed,
    setInputData,
} from '../../store/slices/executionSlice'


const ArrayVisualization = ({ step, maxValue }) => {
    const arr = step.array || []
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-end justify-center gap-1 min-h-[200px]">
                <AnimatePresence mode="popLayout">
                    {arr.map((value, index) => {
                        const isComparing = step.comparing?.includes(index)
                        const isSwapping = step.swapping?.includes(index)
                        const isSorted = step.sorted?.includes(index)
                        const isFound = step.found?.includes(index)
                        const isInWindow = step.window?.includes(index)
                        const isPointer = step.pointers?.includes(index)

                        let boxColor = 'bg-gradient-to-b from-google-blue to-blue-600'
                        if (isComparing) boxColor = 'bg-gradient-to-b from-google-yellow to-yellow-600'
                        if (isSwapping) boxColor = 'bg-gradient-to-b from-google-red to-red-600'
                        if (isSorted) boxColor = 'bg-gradient-to-b from-google-green to-green-600'
                        if (isFound) boxColor = 'bg-gradient-to-b from-purple-500 to-purple-700'
                        if (isInWindow) boxColor = 'bg-gradient-to-b from-cyan-500 to-cyan-700'

                        const height = Math.max(40, (value / maxValue) * 180)

                        return (
                            <motion.div
                                key={index}
                                className="flex flex-col items-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <motion.div
                                    className={`
                                        w-10 md:w-12 rounded-t-lg flex items-center justify-center
                                        ${boxColor} shadow-lg
                                        ${isPointer ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''}
                                    `}
                                    animate={{ height }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <span className="text-white font-bold text-sm">{value}</span>
                                </motion.div>
                                <div className={`
                                    w-10 md:w-12 text-center text-xs py-1 
                                    ${isPointer ? 'text-google-yellow font-bold' : 'text-gray-400'}
                                `}>
                                    [{index}]
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
            {step.range && (
                <div className="text-sm text-gray-400">
                    Range: [{step.range[0]}, {step.range[1]}] {step.target && `| Target: ${step.target}`}
                </div>
            )}
        </div>
    )
}

const TreeVisualization = ({ step }) => {
    const nodes = step.treeNodes || step.array || []
    const currentNode = step.currentNode
    const visitedNodes = step.visitedNodes || []
    const positions = {}

    const calculatePos = (idx, x, y, dx) => {
        if (idx >= 31) return
        positions[idx] = { x, y }
        calculatePos(2 * idx + 1, x - dx, y + 16, dx / 1.8)
        calculatePos(2 * idx + 2, x + dx, y + 16, dx / 1.8)
    }
    calculatePos(0, 50, 10, 20)

    return (
        <div className="relative w-full h-[350px] flex items-center justify-center p-4 bg-white/5 rounded-xl overflow-hidden border border-white/5 select-none">
            <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Edges Layer */}
                {nodes.map((_, i) => {
                    const node = nodes[i]
                    if (node === null || node === undefined) return null

                    const left = 2 * i + 1
                    const right = 2 * i + 2
                    const edges = []

                    if (positions[i] && positions[left] && nodes[left] !== null) {
                        edges.push(
                            <motion.line
                                key={`edge-${i}-${left}`}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                x1={positions[i].x} y1={positions[i].y}
                                x2={positions[left].x} y2={positions[left].y}
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="0.8"
                                strokeLinecap="round"
                            />
                        )
                    }
                    if (positions[i] && positions[right] && nodes[right] !== null) {
                        edges.push(
                            <motion.line
                                key={`edge-${i}-${right}`}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                x1={positions[i].x} y1={positions[i].y}
                                x2={positions[right].x} y2={positions[right].y}
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="0.8"
                                strokeLinecap="round"
                            />
                        )
                    }
                    return edges
                })}

                {/* Nodes Layer */}
                {nodes.map((node, i) => {
                    if (node === null || node === undefined) return null
                    if (!positions[i]) return null

                    const pos = positions[i]
                    const isVisited = visitedNodes.includes(i)
                    const isCurrent = currentNode === i

                    let fillColor = "#4285F4"
                    let textColor = "#FFFFFF"
                    let radius = 6
                    if (isVisited) {
                        fillColor = "#34A853"
                    }
                    if (isCurrent) {
                        fillColor = "#FBBC04"
                        textColor = "#000000"
                        radius = 7
                    }

                    return (
                        <motion.g
                            key={`node-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                            {/* Active Node Halo */}
                            {isCurrent && (
                                <motion.circle
                                    cx={pos.x} cy={pos.y}
                                    r={radius + 4}
                                    fill="none"
                                    stroke="#FBBC04"
                                    strokeWidth="0.5"
                                    strokeOpacity={0.5}
                                    initial={{ scale: 0.8, opacity: 1 }}
                                    animate={{ scale: 1.2, opacity: 0 }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            )}

                            {/* Node Circle */}
                            <motion.circle
                                cx={pos.x} cy={pos.y}
                                r={radius}
                                animate={{
                                    fill: fillColor,
                                    r: radius
                                }}
                                transition={{ duration: 0.3 }}
                                className="drop-shadow-sm"
                                stroke={isCurrent ? "#FFF" : "none"}
                                strokeWidth={isCurrent ? 1 : 0}
                            />

                            {/* Node Value */}
                            <motion.text
                                x={pos.x} y={pos.y}
                                dy="2"
                                textAnchor="middle"
                                fontSize="3.5"
                                fontWeight="bold"
                                fill={textColor}
                                animate={{ fill: textColor }}
                            >
                                {node}
                            </motion.text>
                        </motion.g>
                    )
                })}
            </svg>

            {/* Traversal Order Display */}
            <AnimatePresence>
                {step.traversalOrder && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        component="div"
                        className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none"
                    >
                        <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Traversal</span>
                            <div className="h-3 w-[1px] bg-white/20"></div>
                            <span className="text-white text-sm font-mono font-medium">
                                [{step.traversalOrder.slice(-8).join(' → ')}
                                {step.traversalOrder.length > 8 && '...'}
                                ]
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}










// Graph Visualization - Shows graph as network
const GraphVisualization = ({ step }) => {
    const nodes = step.graphNodes || [0, 1, 2, 3, 4, 5]
    const edges = step.graphEdges || [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]]
    const visited = step.visited || []
    const current = step.current
    const queue = step.queue || []

    // Simple circular layout
    const nodePositions = nodes.map((_, i) => ({
        x: 150 + 100 * Math.cos((2 * Math.PI * i) / nodes.length - Math.PI / 2),
        y: 120 + 80 * Math.sin((2 * Math.PI * i) / nodes.length - Math.PI / 2)
    }))

    return (
        <div className="flex flex-col items-center gap-4">
            <svg width="300" height="250" className="overflow-visible">
                {/* Edges */}
                {edges.map(([from, to], idx) => {
                    const isActive = current === from || current === to
                    return (
                        <motion.line
                            key={idx}
                            x1={nodePositions[from]?.x || 0}
                            y1={nodePositions[from]?.y || 0}
                            x2={nodePositions[to]?.x || 0}
                            y2={nodePositions[to]?.y || 0}
                            stroke={isActive ? '#FBBC04' : '#4285F4'}
                            strokeWidth={isActive ? 3 : 2}
                            strokeOpacity={0.6}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                        />
                    )
                })}
                {/* Nodes */}
                {nodes.map((node, idx) => {
                    const isVisited = visited.includes(node)
                    const isCurrent = current === node
                    const isInQueue = queue.includes(node)

                    let fill = '#4285F4'
                    if (isVisited) fill = '#34A853'
                    if (isInQueue) fill = '#FBBC04'
                    if (isCurrent) fill = '#EA4335'

                    return (
                        <motion.g key={idx}>
                            <motion.circle
                                cx={nodePositions[idx]?.x || 0}
                                cy={nodePositions[idx]?.y || 0}
                                r={isCurrent ? 22 : 18}
                                fill={fill}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            />
                            <text
                                x={nodePositions[idx]?.x || 0}
                                y={nodePositions[idx]?.y || 0}
                                textAnchor="middle"
                                dy="0.35em"
                                fill="white"
                                fontWeight="bold"
                                fontSize="14"
                            >
                                {node}
                            </text>
                        </motion.g>
                    )
                })}
            </svg>
            {queue.length > 0 && (
                <div className="text-sm text-gray-400">
                    Queue/Stack: [{queue.join(', ')}]
                </div>
            )}
        </div>
    )
}

// Linked List Visualization - Shows nodes with arrows
const LinkedListVisualization = ({ step }) => {
    const nodes = step.listNodes || step.array || []
    const head = step.head ?? 0
    const current = step.current
    const prev = step.prev
    const next = step.next
    const isDoubly = step.isDoubly

    return (
        <div className="flex flex-col items-center gap-4 overflow-x-auto py-4">
            <div className="text-sm text-gray-400 mb-2">{isDoubly ? 'DLL HEAD ↓' : 'HEAD ↓'}</div>
            <div className="flex items-center gap-0">
                {nodes.map((node, idx) => {
                    const isHead = idx === head
                    const isCurrent = idx === current
                    const isPrev = idx === prev
                    const isNext = idx === next
                    const isFound = step.found?.includes(idx)

                    let nodeColor = 'bg-google-blue'
                    if (isPrev) nodeColor = 'bg-purple-500'
                    if (isNext) nodeColor = 'bg-cyan-500'
                    if (isCurrent) nodeColor = 'bg-google-yellow'
                    if (isFound) nodeColor = 'bg-google-green'

                    return (
                        <motion.div
                            key={idx}
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            {idx === 0 && isDoubly && (
                                <div className="mr-2 text-gray-500 text-sm">NULL ⇄</div>
                            )}
                            <div className={`
                                flex items-center rounded-lg overflow-hidden shadow-lg
                                ${isCurrent ? 'ring-2 ring-white scale-105' : ''}
                            `}>
                                <div className={`w-12 h-12 flex items-center justify-center ${nodeColor} text-white font-bold`}>
                                    {node}
                                </div>
                                <div className="w-8 h-12 flex items-center justify-center bg-gray-700 text-gray-400 text-xs font-mono">
                                    {isDoubly ? '⇄' : '•→'}
                                </div>
                            </div>
                            {idx < nodes.length - 1 && (
                                <div className="w-6 h-0.5 bg-gray-500" />
                            )}
                            {idx === nodes.length - 1 && (
                                <div className="ml-2 text-gray-500 text-sm">
                                    {isDoubly ? '⇄ NULL' : '→ NULL'}
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>
            {isDoubly && <div className="text-[10px] text-gray-500 mt-2 uppercase tracking-tighter">prev ⇄ next</div>}
        </div>
    )
}

// Stack Visualization - Vertical LIFO
const StackVisualization = ({ step }) => {
    const items = step.stackItems || step.array || []
    const top = step.top ?? items.length - 1
    const operation = step.operation
    const highlightIndex = step.highlightIndex

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-gray-400 mb-2">← TOP</div>
            <div className="flex flex-col-reverse gap-1">
                {items.map((item, idx) => {
                    const isTop = idx === top
                    const isHighlight = idx === highlightIndex
                    const isPush = operation === 'push' && idx === items.length - 1
                    const isPop = operation === 'pop' && idx === top

                    let itemColor = 'bg-google-blue'
                    if (isTop) itemColor = 'bg-google-yellow'
                    if (isPush) itemColor = 'bg-google-green'
                    if (isPop) itemColor = 'bg-google-red'
                    if (isHighlight) itemColor = 'bg-purple-500'

                    return (
                        <motion.div
                            key={idx}
                            className={`
                                w-24 h-10 flex items-center justify-center rounded-lg
                                ${itemColor} text-white font-bold shadow-lg
                                ${isTop ? 'ring-2 ring-white' : ''}
                            `}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                        >
                            {item}
                        </motion.div>
                    )
                })}
            </div>
            <div className="w-28 h-2 bg-gray-600 rounded-b-lg mt-1" />
            <div className="text-sm text-gray-500 mt-2">BOTTOM</div>
        </div>
    )
}

// Queue Visualization - Horizontal FIFO
const QueueVisualization = ({ step }) => {
    const items = step.queueItems || step.array || []
    const front = step.front ?? 0
    const rear = step.rear ?? items.length - 1
    const operation = step.operation

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="text-sm text-gray-400">FRONT →</div>
                <div className="flex items-center gap-1">
                    <AnimatePresence mode="popLayout">
                        {items.map((item, idx) => {
                            const isFront = idx === front
                            const isRear = idx === rear
                            const isDequeue = operation === 'dequeue' && idx === front
                            const isEnqueue = operation === 'enqueue' && idx === rear

                            let itemColor = 'bg-google-blue'
                            if (isFront) itemColor = 'bg-google-green'
                            if (isRear) itemColor = 'bg-google-yellow'
                            if (isDequeue) itemColor = 'bg-google-red'
                            if (isEnqueue) itemColor = 'bg-cyan-500'

                            return (
                                <motion.div
                                    key={idx}
                                    className={`
                                        w-12 h-12 flex items-center justify-center rounded-lg
                                        ${itemColor} text-white font-bold shadow-lg
                                    `}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {item}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
                <div className="text-sm text-gray-400">← REAR</div>
            </div>
            <div className="flex gap-8 text-xs text-gray-500">
                <span>Front: {front}</span>
                <span>Rear: {rear}</span>
                <span>Size: {items.length}</span>
            </div>
        </div>
    )
}

// Hash Table Visualization - Buckets with chaining
const HashTableVisualization = ({ step }) => {
    const buckets = step.buckets || Array(7).fill([])
    const currentHash = step.currentHash
    const key = step.key
    const operation = step.operation

    const displayBuckets = step.buckets || step.array?.map((v, i) => i === currentHash ? [v] : []) || Array(7).fill([])

    return (
        <div className="flex flex-col items-center gap-4">
            {key !== undefined && (
                <div className="text-sm text-gray-400">
                    {operation === 'insert' ? 'Inserting' : 'Searching'}: {key} → hash = {currentHash}
                </div>
            )}
            <div className="flex gap-2">
                {displayBuckets.slice(0, 7).map((bucket, idx) => {
                    const isActive = idx === currentHash
                    const items = Array.isArray(bucket) ? bucket : [bucket]

                    return (
                        <div key={idx} className="flex flex-col items-center gap-1">
                            <div className="text-xs text-gray-500">[{idx}]</div>
                            <motion.div
                                className={`
                                    w-12 min-h-[80px] rounded-lg border-2 flex flex-col items-center justify-end p-1 gap-1
                                    ${isActive ? 'border-google-yellow bg-google-yellow/10' : 'border-gray-600 bg-gray-800/50'}
                                `}
                                animate={{ scale: isActive ? 1.05 : 1 }}
                            >
                                {items.filter(i => i !== undefined && i !== null && i !== 0).map((item, itemIdx) => (
                                    <motion.div
                                        key={itemIdx}
                                        className={`
                                            w-10 h-8 rounded flex items-center justify-center text-white text-sm font-bold
                                            ${isActive ? 'bg-google-yellow' : 'bg-google-blue'}
                                        `}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        {item}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    )
                })}
            </div>
            <div className="text-xs text-gray-500">Hash Table Buckets</div>
        </div>
    )
}

// Get visualization type based on category
const getVisualizationType = (category) => {
    const vizMap = {
        'sorting': 'array',
        'searching': 'array',
        'arrays': 'array',
        'trees': 'tree',
        'graphs': 'graph',
        'linked-lists': 'linkedlist',
        'stacks': 'stack',
        'queues': 'queue',
        'hashing': 'hashtable',
        'strings': 'array',
        'dynamic-programming': 'array',
        'greedy': 'array',
        'bit-manipulation': 'array',
        'advanced': 'array',
    }
    return vizMap[category] || 'array'
}

// Render appropriate visualization based on type
const VisualizationRenderer = ({ type, step, maxValue }) => {
    switch (type) {
        case 'tree':
            return <TreeVisualization step={step} />
        case 'graph':
            return <GraphVisualization step={step} />
        case 'linkedlist':
            return <LinkedListVisualization step={step} />
        case 'stack':
            return <StackVisualization step={step} />
        case 'queue':
            return <QueueVisualization step={step} />
        case 'hashtable':
            return <HashTableVisualization step={step} />
        case 'array':
        default:
            return <ArrayVisualization step={step} maxValue={maxValue} />
    }
}

// Step generators for sorting algorithms (visualization logic)
const sortingGenerators = {
    bubble: (arr) => {
        const steps = []
        const array = [...arr]
        const n = array.length

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                steps.push({
                    array: [...array],
                    comparing: [j, j + 1],
                    swapping: [],
                    sorted: array.slice(n - i).map((_, idx) => n - i + idx),
                    message: `Comparing ${array[j]} and ${array[j + 1]}`,
                    line: 3,
                })

                if (array[j] > array[j + 1]) {
                    steps.push({
                        array: [...array],
                        comparing: [],
                        swapping: [j, j + 1],
                        sorted: array.slice(n - i).map((_, idx) => n - i + idx),
                        message: `Swapping ${array[j]} and ${array[j + 1]}`,
                        line: 4,
                    })
                        ;[array[j], array[j + 1]] = [array[j + 1], array[j]]
                }
            }
        }

        steps.push({
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: array.map((_, i) => i),
            message: 'Array is sorted!',
            line: 6,
        })

        return steps
    },
    selection: (arr) => {
        const steps = []
        const array = [...arr]
        const n = array.length

        for (let i = 0; i < n - 1; i++) {
            let minIdx = i
            for (let j = i + 1; j < n; j++) {
                steps.push({
                    array: [...array],
                    comparing: [minIdx, j],
                    swapping: [],
                    sorted: Array.from({ length: i }, (_, idx) => idx),
                    message: `Finding minimum: comparing ${array[minIdx]} and ${array[j]}`,
                    line: 4,
                })
                if (array[j] < array[minIdx]) {
                    minIdx = j
                }
            }

            if (minIdx !== i) {
                steps.push({
                    array: [...array],
                    comparing: [],
                    swapping: [i, minIdx],
                    sorted: Array.from({ length: i }, (_, idx) => idx),
                    message: `Swapping ${array[i]} and ${array[minIdx]}`,
                    line: 7,
                })
                    ;[array[i], array[minIdx]] = [array[minIdx], array[i]]
            }
        }

        steps.push({
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: array.map((_, i) => i),
            message: 'Array is sorted!',
            line: 9,
        })

        return steps
    },
    insertion: (arr) => {
        const steps = []
        const array = [...arr]
        const n = array.length

        for (let i = 1; i < n; i++) {
            const key = array[i]
            let j = i - 1

            while (j >= 0 && array[j] > key) {
                steps.push({
                    array: [...array],
                    comparing: [j, j + 1],
                    swapping: [],
                    sorted: Array.from({ length: i }, (_, idx) => idx),
                    message: `Comparing ${array[j]} with key ${key}`,
                    line: 4,
                })

                array[j + 1] = array[j]
                steps.push({
                    array: [...array],
                    comparing: [],
                    swapping: [j, j + 1],
                    sorted: Array.from({ length: i }, (_, idx) => idx),
                    message: `Shifting ${array[j]} to the right`,
                    line: 5,
                })
                j--
            }
            array[j + 1] = key
        }

        steps.push({
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: array.map((_, i) => i),
            message: 'Array is sorted!',
            line: 8,
        })

        return steps
    },
    quick: (arr) => {
        const steps = []
        const array = [...arr]

        function quickSort(low, high) {
            if (low < high) {
                const pivotIdx = partition(low, high)
                quickSort(low, pivotIdx - 1)
                quickSort(pivotIdx + 1, high)
            }
        }

        function partition(low, high) {
            const pivot = array[high]
            steps.push({
                array: [...array],
                comparing: [high],
                swapping: [],
                sorted: [],
                message: `Pivot selected: ${pivot}`,
                line: 2,
            })

            let i = low - 1

            for (let j = low; j < high; j++) {
                steps.push({
                    array: [...array],
                    comparing: [j, high],
                    swapping: [],
                    sorted: [],
                    message: `Comparing ${array[j]} with pivot ${pivot}`,
                    line: 5,
                })

                if (array[j] < pivot) {
                    i++
                    if (i !== j) {
                        steps.push({
                            array: [...array],
                            comparing: [],
                            swapping: [i, j],
                            sorted: [],
                            message: `Swapping ${array[i]} and ${array[j]}`,
                            line: 7,
                        })
                            ;[array[i], array[j]] = [array[j], array[i]]
                    }
                }
            }

            steps.push({
                array: [...array],
                comparing: [],
                swapping: [i + 1, high],
                sorted: [],
                message: `Placing pivot at position ${i + 1}`,
                line: 10,
            })
                ;[array[i + 1], array[high]] = [array[high], array[i + 1]]

            return i + 1
        }

        quickSort(0, array.length - 1)

        steps.push({
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: array.map((_, i) => i),
            message: 'Array is sorted!',
            line: 12,
        })

        return steps
    },
    merge: (arr) => {
        const steps = []
        const array = [...arr]

        function mergeSort(start, end) {
            if (start >= end) return

            const mid = Math.floor((start + end) / 2)

            steps.push({
                array: [...array],
                found: [mid],
                comparing: [start, end],
                range: [start, end], // Helper for UI to create a bracket?
                message: `Divide: Splitting array [${start}...${end}] at index ${mid}.`,
                line: 2
            })

            mergeSort(start, mid)
            mergeSort(mid + 1, end)
            merge(start, mid, end)
        }

        function merge(start, mid, end) {
            const left = array.slice(start, mid + 1)
            const right = array.slice(mid + 1, end + 1)

            let i = 0, j = 0, k = start

            steps.push({
                array: [...array],
                comparing: [],
                range: [start, end],
                message: `Conquer: Merging subarrays [${start}...${mid}] and [${mid + 1}...${end}]`,
                line: 5
            })

            while (i < left.length && j < right.length) {
                steps.push({
                    array: [...array],
                    comparing: [start + i, mid + 1 + j],
                    swapping: [],
                    sorted: [],
                    message: `Comparing ${left[i]} and ${right[j]}. Smaller goes to position ${k}.`,
                    line: 7,
                })

                if (left[i] <= right[j]) {
                    array[k] = left[i]
                    i++
                } else {
                    array[k] = right[j]
                    j++
                }
                k++
            }

            while (i < left.length) {
                array[k] = left[i]
                i++
                k++
            }

            while (j < right.length) {
                array[k] = right[j]
                j++
                k++
            }

            // Post-merge snapshot
            steps.push({
                array: [...array],
                found: Array.from({ length: end - start + 1 }, (_, idx) => start + idx),
                message: `Merged segment [${start}...${end}] is now sorted.`,
                line: 14,
            })
        }

        mergeSort(0, array.length - 1)

        steps.push({
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: array.map((_, i) => i),
            message: 'Array is sorted!',
            line: 15,
        })

        return steps
    },
    heap: (arr) => {
        const steps = []
        const array = [...arr]
        const n = array.length

        function heapify(n, i) {
            let largest = i
            const left = 2 * i + 1
            const right = 2 * i + 2

            if (left < n && array[left] > array[largest]) {
                largest = left
            }
            if (right < n && array[right] > array[largest]) {
                largest = right
            }

            if (largest !== i) {
                steps.push({
                    array: [...array],
                    comparing: [],
                    swapping: [i, largest],
                    sorted: [],
                    message: `Heapify: swapping ${array[i]} and ${array[largest]}`,
                    line: 5,
                })
                    ;[array[i], array[largest]] = [array[largest], array[i]]
                heapify(n, largest)
            }
        }

        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            heapify(n, i)
        }

        // Extract elements
        for (let i = n - 1; i > 0; i--) {
            steps.push({
                array: [...array],
                comparing: [],
                swapping: [0, i],
                sorted: Array.from({ length: n - i }, (_, idx) => n - 1 - idx),
                message: `Moving ${array[0]} to sorted position`,
                line: 8,
            })
                ;[array[0], array[i]] = [array[i], array[0]]
            heapify(i, 0)
        }

        steps.push({
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: array.map((_, i) => i),
            message: 'Array is sorted!',
            line: 10,
        })

        return steps
    },
}

// Step generators for searching algorithms
const searchingGenerators = {
    'linear-search': (arr, target) => {
        const steps = []
        target = target || arr[Math.floor(Math.random() * arr.length)]

        for (let i = 0; i < arr.length; i++) {
            steps.push({
                array: [...arr],
                comparing: [i],
                swapping: [],
                sorted: [],
                found: arr[i] === target ? [i] : [],
                target,
                message: `Checking index ${i}: ${arr[i]} ${arr[i] === target ? '= ' + target + ' (Found!)' : '≠ ' + target}`,
                line: 2,
            })
            if (arr[i] === target) {
                steps.push({
                    array: [...arr],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: [i],
                    target,
                    message: `Found ${target} at index ${i}!`,
                    line: 3,
                })
                return steps
            }
        }
        steps.push({
            array: [...arr],
            comparing: [],
            swapping: [],
            sorted: [],
            found: [],
            target,
            message: `${target} not found in array`,
            line: 5,
        })
        return steps
    },
    'binary-search': (arr) => {
        const steps = []
        const sortedArr = [...arr].sort((a, b) => a - b)
        const target = sortedArr[Math.floor(Math.random() * sortedArr.length)]
        let left = 0, right = sortedArr.length - 1

        while (left <= right) {
            const mid = Math.floor((left + right) / 2)
            steps.push({
                array: [...sortedArr],
                comparing: [mid],
                swapping: [],
                sorted: [],
                found: [],
                target,
                range: [left, right],
                message: `Searching in range [${left}, ${right}], mid = ${mid}, arr[mid] = ${sortedArr[mid]}`,
                line: 3,
            })

            if (sortedArr[mid] === target) {
                steps.push({
                    array: [...sortedArr],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: [mid],
                    target,
                    message: `Found ${target} at index ${mid}!`,
                    line: 4,
                })
                return steps
            } else if (sortedArr[mid] < target) {
                steps.push({
                    array: [...sortedArr],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: [],
                    target,
                    range: [mid + 1, right],
                    message: `${sortedArr[mid]} < ${target}, search right half`,
                    line: 6,
                })
                left = mid + 1
            } else {
                steps.push({
                    array: [...sortedArr],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: [],
                    target,
                    range: [left, mid - 1],
                    message: `${sortedArr[mid]} > ${target}, search left half`,
                    line: 8,
                })
                right = mid - 1
            }
        }
        return steps
    },
    'jump-search': (arr) => {
        const steps = []
        const sortedArr = [...arr].sort((a, b) => a - b)
        const n = sortedArr.length
        const target = sortedArr[Math.floor(Math.random() * n)]
        const jumpSize = Math.floor(Math.sqrt(n))
        let prev = 0

        steps.push({
            array: [...sortedArr],
            comparing: [],
            swapping: [],
            sorted: [],
            found: [],
            target,
            message: `Jump size = √${n} = ${jumpSize}`,
            line: 1,
        })

        let curr = 0
        while (curr < n && sortedArr[curr] < target) {
            steps.push({
                array: [...sortedArr],
                comparing: [curr],
                swapping: [],
                sorted: [],
                found: [],
                target,
                range: [prev, curr],
                message: `Jumping: arr[${curr}] = ${sortedArr[curr]} < ${target}`,
                line: 3,
            })
            prev = curr
            curr = Math.min(curr + jumpSize, n - 1)
        }

        steps.push({
            array: [...sortedArr],
            comparing: [],
            swapping: [],
            sorted: [],
            found: [],
            target,
            range: [prev, curr],
            message: `Linear search from ${prev} to ${curr}`,
            line: 5,
        })

        for (let i = prev; i <= curr && i < n; i++) {
            if (sortedArr[i] === target) {
                steps.push({
                    array: [...sortedArr],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: [i],
                    target,
                    message: `Found ${target} at index ${i}!`,
                    line: 7,
                })
                return steps
            }
        }
        return steps
    },
    'interpolation-search': (arr) => {
        const steps = []
        const sortedArr = [...arr].sort((a, b) => a - b)
        const target = sortedArr[Math.floor(Math.random() * sortedArr.length)]
        let low = 0, high = sortedArr.length - 1

        while (low <= high && target >= sortedArr[low] && target <= sortedArr[high]) {
            const pos = low + Math.floor(
                ((target - sortedArr[low]) * (high - low)) / (sortedArr[high] - sortedArr[low])
            )

            steps.push({
                array: [...sortedArr],
                comparing: [pos],
                swapping: [],
                sorted: [],
                found: [],
                target,
                range: [low, high],
                message: `Interpolated position = ${pos}, arr[${pos}] = ${sortedArr[pos]}`,
                line: 3,
            })

            if (sortedArr[pos] === target) {
                steps.push({
                    array: [...sortedArr],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: [pos],
                    target,
                    message: `Found ${target} at index ${pos}!`,
                    line: 4,
                })
                return steps
            }
            if (sortedArr[pos] < target) {
                low = pos + 1
            } else {
                high = pos - 1
            }
        }
        return steps
    },
}

// Step generators for array algorithms
const arraysGenerators = {
    'prefix-sum': (arr) => {
        const steps = []
        const prefix = [0]

        steps.push({
            array: [...arr],
            comparing: [],
            swapping: [],
            sorted: [],
            prefix: [0],
            message: `Building prefix sum array. Start with prefix[0] = 0`,
            line: 1,
        })

        for (let i = 0; i < arr.length; i++) {
            prefix.push(prefix[i] + arr[i])
            steps.push({
                array: [...arr],
                comparing: [i],
                swapping: [],
                sorted: [],
                prefix: [...prefix],
                message: `prefix[${i + 1}] = prefix[${i}] + arr[${i}] = ${prefix[i]} + ${arr[i]} = ${prefix[i + 1]}`,
                line: 3,
            })
        }

        // Demo range query
        const l = 2, r = Math.min(5, arr.length - 1)
        if (r >= l) {
            steps.push({
                array: [...arr],
                comparing: [],
                swapping: [],
                sorted: [],
                prefix: [...prefix],
                range: [l, r],
                message: `Range sum [${l}, ${r}] = prefix[${r + 1}] - prefix[${l}] = ${prefix[r + 1]} - ${prefix[l]} = ${prefix[r + 1] - prefix[l]}`,
                line: 6,
            })
        }
        return steps
    },
    'sliding-window': (arr) => {
        const steps = []
        const k = Math.min(3, arr.length)
        let windowSum = 0
        let maxSum = -Infinity

        steps.push({
            array: [...arr],
            comparing: [],
            swapping: [],
            sorted: [],
            window: [],
            message: `Sliding window of size k = ${k}`,
            line: 1,
        })

        // Build first window
        for (let i = 0; i < k; i++) {
            windowSum += arr[i]
            steps.push({
                array: [...arr],
                comparing: Array.from({ length: i + 1 }, (_, idx) => idx),
                swapping: [],
                sorted: [],
                window: Array.from({ length: i + 1 }, (_, idx) => idx),
                windowSum,
                message: `Building window: adding ${arr[i]}, sum = ${windowSum}`,
                line: 3,
            })
        }
        maxSum = windowSum

        // Slide window
        for (let i = k; i < arr.length; i++) {
            const removed = arr[i - k]
            windowSum = windowSum - removed + arr[i]

            steps.push({
                array: [...arr],
                comparing: [i],
                swapping: [i - k],
                sorted: [],
                window: Array.from({ length: k }, (_, idx) => i - k + 1 + idx),
                windowSum,
                maxSum: Math.max(maxSum, windowSum),
                message: `Slide: remove ${removed}, add ${arr[i]}, sum = ${windowSum}`,
                line: 5,
            })
            maxSum = Math.max(maxSum, windowSum)
        }

        steps.push({
            array: [...arr],
            comparing: [],
            swapping: [],
            sorted: [],
            window: [],
            maxSum,
            message: `Maximum sum of window size ${k} = ${maxSum}`,
            line: 7,
        })
        return steps
    },
    'two-pointers': (arr) => {
        const steps = []
        const sortedArr = [...arr].sort((a, b) => a - b)
        const target = sortedArr[0] + sortedArr[sortedArr.length - 1]
        let left = 0, right = sortedArr.length - 1

        steps.push({
            array: [...sortedArr],
            comparing: [],
            swapping: [],
            sorted: [],
            pointers: [left, right],
            target,
            message: `Two pointers: find pair that sums to ${target}`,
            line: 1,
        })

        while (left < right) {
            const sum = sortedArr[left] + sortedArr[right]
            steps.push({
                array: [...sortedArr],
                comparing: [left, right],
                swapping: [],
                sorted: [],
                pointers: [left, right],
                target,
                message: `arr[${left}] + arr[${right}] = ${sortedArr[left]} + ${sortedArr[right]} = ${sum}`,
                line: 3,
            })

            if (sum === target) {
                steps.push({
                    array: [...sortedArr],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: [left, right],
                    target,
                    message: `Found! ${sortedArr[left]} + ${sortedArr[right]} = ${target}`,
                    line: 4,
                })
                return steps
            } else if (sum < target) {
                steps.push({
                    array: [...sortedArr],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    pointers: [left + 1, right],
                    target,
                    message: `${sum} < ${target}, move left pointer right`,
                    line: 6,
                })
                left++
            } else {
                steps.push({
                    array: [...sortedArr],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    pointers: [left, right - 1],
                    target,
                    message: `${sum} > ${target}, move right pointer left`,
                    line: 8,
                })
                right--
            }
        }
        return steps
    },
    'kadanes': (arr) => {
        const steps = []
        // Use arr with some negatives for interesting visualization
        const testArr = arr.map((v, i) => i % 3 === 0 ? -Math.floor(v / 2) : v)
        let maxSum = testArr[0]
        let currentSum = testArr[0]
        let maxStart = 0, maxEnd = 0, tempStart = 0

        steps.push({
            array: [...testArr],
            comparing: [0],
            swapping: [],
            sorted: [],
            currentSum,
            maxSum,
            message: `Initialize: maxSum = currentSum = ${testArr[0]}`,
            line: 1,
        })

        for (let i = 1; i < testArr.length; i++) {
            if (testArr[i] > currentSum + testArr[i]) {
                currentSum = testArr[i]
                tempStart = i
                steps.push({
                    array: [...testArr],
                    comparing: [i],
                    swapping: [],
                    sorted: [],
                    range: [tempStart, i],
                    currentSum,
                    maxSum,
                    message: `Reset: ${testArr[i]} > ${currentSum - testArr[i]} + ${testArr[i]}, start new subarray`,
                    line: 3,
                })
            } else {
                currentSum += testArr[i]
                steps.push({
                    array: [...testArr],
                    comparing: [i],
                    swapping: [],
                    sorted: [],
                    range: [tempStart, i],
                    currentSum,
                    maxSum,
                    message: `Extend: currentSum = ${currentSum - testArr[i]} + ${testArr[i]} = ${currentSum}`,
                    line: 4,
                })
            }

            if (currentSum > maxSum) {
                maxSum = currentSum
                maxStart = tempStart
                maxEnd = i
                steps.push({
                    array: [...testArr],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    range: [maxStart, maxEnd],
                    currentSum,
                    maxSum,
                    found: Array.from({ length: maxEnd - maxStart + 1 }, (_, idx) => maxStart + idx),
                    message: `New max! maxSum = ${maxSum} from index ${maxStart} to ${maxEnd}`,
                    line: 5,
                })
            }
        }

        steps.push({
            array: [...testArr],
            comparing: [],
            swapping: [],
            sorted: [],
            found: Array.from({ length: maxEnd - maxStart + 1 }, (_, idx) => maxStart + idx),
            maxSum,
            message: `Maximum subarray sum = ${maxSum}`,
            line: 7,
        })
        return steps
    },
    'dynamic-array': (data) => {
        const steps = []
        // Simulate dynamic array operations
        const inputs = Array.isArray(data) ? data : [1, 2, 3, 4, 5, 6, 7, 8]
        let capacity = 2
        let size = 0
        let arr = new Array(capacity).fill(null)

        steps.push({
            array: [...arr],
            message: `Init Dynamic Array. Capacity: ${capacity}, Size: ${size}`,
            line: 1
        })

        for (const val of inputs) {
            // Check resize
            if (size === capacity) {
                steps.push({
                    array: [...arr],
                    message: `Array full (Size ${size} == Cap ${capacity}). Triggering RESIZE!`,
                    line: 2,
                    swapping: [] // Clear highlights
                })

                // Resize visualization steps
                const oldCap = capacity
                capacity *= 2
                const newArr = new Array(capacity).fill(null)

                steps.push({
                    array: [...newArr],
                    message: `1. Created new array of capacity ${capacity} (Double of ${oldCap})`,
                    line: 3
                })

                // Copy
                for (let i = 0; i < size; i++) {
                    newArr[i] = arr[i]
                    steps.push({
                        array: [...newArr],
                        comparing: [i], // Highlight copy source/dest
                        message: `2. Copying element ${arr[i]} to new array`,
                        line: 3
                    })
                }

                arr = newArr
                steps.push({
                    array: [...arr],
                    message: `3. Resize complete. New Capacity: ${capacity}`,
                    line: 3
                })
            }

            // Insert
            arr[size] = val
            steps.push({
                array: [...arr],
                found: [size], // Highlight insertion
                message: `Inserted ${val} at index ${size}. Size: ${size + 1}/${capacity}`,
                line: 4,
                comparing: []
            })
            size++
        }

        return steps
    },
    'array-insert': () => {
        const steps = []
        const arr = [10, 20, 30, 40, null]
        let size = 4
        const insertVal = 25
        const insertIdx = 1

        steps.push({
            array: [...arr],
            message: `Static Array Insert: Add ${insertVal} at index ${insertIdx}. Current Size: ${size}`,
            line: 1
        })

        // Shift Right
        for (let i = size - 1; i >= insertIdx; i--) {
            steps.push({
                array: [...arr],
                comparing: [i],
                swapping: [i + 1],
                message: `Shift Right: Moving ${arr[i]} from index ${i} to ${i + 1}.`,
                line: 2
            })
            arr[i + 1] = arr[i]
            arr[i] = null
            steps.push({
                array: [...arr],
                found: [i + 1],
                message: `Shifted. Space created at index ${i}.`,
                line: 2
            })
        }

        // Insert
        arr[insertIdx] = insertVal
        steps.push({
            array: [...arr],
            found: [insertIdx],
            message: `Inserted ${insertVal} at index ${insertIdx}. Time Complexity: O(n) due to shifting.`,
            line: 3
        })

        return steps
    },
    'array-delete': () => {
        const steps = []
        const arr = [10, 20, 30, 40, 50]
        let size = 5
        const deleteIdx = 1 // Value 20

        steps.push({
            array: [...arr],
            comparing: [deleteIdx],
            message: `Static Array Delete: Remove element at index ${deleteIdx} (${arr[deleteIdx]}).`,
            line: 1
        })

        // Logical delete
        arr[deleteIdx] = null
        steps.push({
            array: [...arr],
            message: `Element removed logically. Now must shift left to fill gap.`,
            line: 2
        })

        // Shift Left
        for (let i = deleteIdx; i < size - 1; i++) {
            steps.push({
                array: [...arr],
                comparing: [i + 1],
                swapping: [i],
                message: `Shift Left: Moving ${arr[i + 1]} from index ${i + 1} to ${i}.`,
                line: 3
            })
            arr[i] = arr[i + 1]
            arr[i + 1] = null
            steps.push({
                array: [...arr],
                found: [i],
                message: `Shifted.`,
                line: 3
            })
        }

        size--
        steps.push({
            array: [...arr],
            message: `Deletion Complete. Size is now ${size}. Time Complexity: O(n).`,
            line: 4
        })

        return steps
    }
}

// Step generators for DP algorithms
const dpGenerators = {
    'knapsack-01': () => {
        const steps = []
        const weights = [2, 3, 4, 5]
        const values = [3, 4, 5, 6]
        const W = 5
        const n = weights.length
        const dp = Array(W + 1).fill(0)

        steps.push({
            array: [...dp],
            comparing: [],
            swapping: [],
            sorted: [],
            items: weights.map((w, i) => ({ weight: w, value: values[i] })),
            capacity: W,
            message: `Knapsack: capacity=${W}, items=${n}. Initialize DP array with zeros.`,
            line: 1,
        })

        for (let i = 0; i < n; i++) {
            for (let w = W; w >= weights[i]; w--) {
                const oldVal = dp[w]
                const newVal = dp[w - weights[i]] + values[i]
                if (newVal > oldVal) {
                    dp[w] = newVal
                    steps.push({
                        array: [...dp],
                        comparing: [w],
                        swapping: [],
                        sorted: [],
                        currentItem: i,
                        message: `Item ${i} (w=${weights[i]}, v=${values[i]}): dp[${w}] = max(${oldVal}, dp[${w - weights[i]}]+${values[i]}) = ${dp[w]}`,
                        line: 4,
                    })
                }
            }
        }

        steps.push({
            array: [...dp],
            comparing: [],
            swapping: [],
            sorted: [],
            found: [W],
            message: `Maximum value = ${dp[W]}`,
            line: 7,
        })
        return steps
    },
    'lis': (arr) => {
        const steps = []
        const tails = []

        steps.push({
            array: [...arr],
            comparing: [],
            swapping: [],
            sorted: [],
            tails: [],
            message: `Finding Longest Increasing Subsequence`,
            line: 1,
        })

        for (let i = 0; i < arr.length; i++) {
            const num = arr[i]
            let left = 0, right = tails.length

            while (left < right) {
                const mid = Math.floor((left + right) / 2)
                if (tails[mid] < num) left = mid + 1
                else right = mid
            }

            if (left === tails.length) {
                tails.push(num)
                steps.push({
                    array: [...arr],
                    comparing: [i],
                    swapping: [],
                    sorted: [],
                    tails: [...tails],
                    message: `Extend LIS: append ${num}, length = ${tails.length}`,
                    line: 4,
                })
            } else {
                tails[left] = num
                steps.push({
                    array: [...arr],
                    comparing: [i],
                    swapping: [],
                    sorted: [],
                    tails: [...tails],
                    message: `Replace tails[${left}] with ${num}`,
                    line: 6,
                })
            }
        }

        steps.push({
            array: [...arr],
            comparing: [],
            swapping: [],
            sorted: [],
            tails: [...tails],
            found: [],
            message: `LIS length = ${tails.length}`,
            line: 8,
        })
        return steps
    },
    'fibonacci': (n = 7) => {
        const steps = []
        const dp = new Array(n + 1).fill(0)
        dp[0] = 0; dp[1] = 1

        steps.push({
            array: [...dp],
            message: `Calculate Fib(${n}). Base cases: dp[0]=0, dp[1]=1`,
            highlight: [0, 1],
            line: 1
        })

        for (let i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2]
            steps.push({
                array: [...dp],
                comparing: [i - 1, i - 2],
                found: [i],
                message: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
                line: 2
            })
        }
        return steps
    },
    'lcs': (data) => {
        const str1 = "ACADB"
        const str2 = "CBDA"
        const m = str1.length
        const n = str2.length
        const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0))
        const steps = []

        const flatten = () => dp.reduce((acc, row) => acc.concat(row), [])

        steps.push({
            array: flatten(),
            message: `LCS of "${str1}" vs "${str2}". Initialize ${(m + 1)}x${(n + 1)} table with 0s.`,
            line: 1
        })

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const flatIdx = i * (n + 1) + j
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = 1 + dp[i - 1][j - 1]
                    steps.push({
                        array: flatten(),
                        comparing: [flatIdx],
                        found: [flatIdx],
                        message: `Match '${str1[i - 1]}'. dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] (${dp[i - 1][j - 1]}) = ${dp[i][j]}`,
                        line: 2
                    })
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
                    steps.push({
                        array: flatten(),
                        comparing: [flatIdx],
                        message: `Mismatch. max(top:${dp[i - 1][j]}, left:${dp[i][j - 1]}) = ${dp[i][j]}`,
                        line: 3
                    })
                }
            }
        }
        return steps
    },
    'coin-change': () => {
        const steps = []
        const coins = [1, 2, 5]
        const amount = 11
        const dp = Array(amount + 1).fill(Infinity)
        dp[0] = 0

        steps.push({
            array: dp.map(v => v === Infinity ? '∞' : v),
            comparing: [],
            swapping: [],
            sorted: [],
            coins,
            amount,
            message: `Coin Change: coins=[${coins}], amount=${amount}`,
            line: 1,
        })

        for (const coin of coins) {
            for (let i = coin; i <= amount; i++) {
                if (dp[i - coin] + 1 < dp[i]) {
                    dp[i] = dp[i - coin] + 1
                    steps.push({
                        array: dp.map(v => v === Infinity ? '∞' : v),
                        comparing: [i],
                        swapping: [],
                        sorted: [],
                        currentCoin: coin,
                        message: `Coin ${coin}: dp[${i}] = dp[${i - coin}] + 1 = ${dp[i]}`,
                        line: 4,
                    })
                }
            }
        }

        steps.push({
            array: dp.map(v => v === Infinity ? '∞' : v),
            comparing: [],
            swapping: [],
            sorted: [],
            found: [amount],
            message: `Minimum coins for ${amount} = ${dp[amount]}`,
            line: 7,
        })
        return steps
    },

}

// Step generators for backtracking algorithms  
const backtrackingGenerators = {
    'n-queens': () => {
        const steps = []
        const n = 4
        const board = Array(n).fill().map(() => Array(n).fill(0))

        steps.push({
            array: board.flat(),
            comparing: [],
            swapping: [],
            sorted: [],
            boardSize: n,
            message: `N-Queens: Place ${n} queens on ${n}x${n} board`,
            line: 1,
        })

        function isValid(row, col) {
            for (let i = 0; i < row; i++) {
                if (board[i][col] === 1) return false
                if (col - row + i >= 0 && board[i][col - row + i] === 1) return false
                if (col + row - i < n && board[i][col + row - i] === 1) return false
            }
            return true
        }

        function solve(row) {
            if (row === n) return true

            for (let col = 0; col < n; col++) {
                steps.push({
                    array: board.flat(),
                    comparing: [row * n + col],
                    swapping: [],
                    sorted: [],
                    boardSize: n,
                    message: `Try placing queen at (${row}, ${col})`,
                    line: 3,
                })

                if (isValid(row, col)) {
                    board[row][col] = 1
                    steps.push({
                        array: board.flat(),
                        comparing: [],
                        swapping: [],
                        sorted: [],
                        found: board.flatMap((r, i) => r.map((c, j) => c === 1 ? i * n + j : -1)).filter(x => x >= 0),
                        boardSize: n,
                        message: `Place queen at (${row}, ${col})`,
                        line: 4,
                    })

                    if (solve(row + 1)) return true

                    board[row][col] = 0
                    steps.push({
                        array: board.flat(),
                        comparing: [],
                        swapping: [row * n + col],
                        sorted: [],
                        boardSize: n,
                        message: `Backtrack: remove queen from (${row}, ${col})`,
                        line: 6,
                    })
                }
            }
            return false
        }

        solve(0)

        steps.push({
            array: board.flat(),
            comparing: [],
            swapping: [],
            sorted: [],
            found: board.flatMap((r, i) => r.map((c, j) => c === 1 ? i * n + j : -1)).filter(x => x >= 0),
            boardSize: n,
            message: `Solution found!`,
            line: 8,
        })
        return steps
    },
    'permutations': (arr) => {
        const steps = []
        const nums = arr.slice(0, 4)
        const result = []

        steps.push({
            array: [...nums],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Generate permutations of [${nums}]`,
            line: 1,
        })

        function backtrack(start) {
            if (start === nums.length) {
                result.push([...nums])
                steps.push({
                    array: [...nums],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: nums.map((_, i) => i),
                    permCount: result.length,
                    message: `Permutation ${result.length}: [${nums}]`,
                    line: 3,
                })
                return
            }

            for (let i = start; i < nums.length; i++) {
                if (i !== start) {
                    steps.push({
                        array: [...nums],
                        comparing: [],
                        swapping: [start, i],
                        sorted: [],
                        message: `Swap positions ${start} and ${i}`,
                        line: 5,
                    })
                        ;[nums[start], nums[i]] = [nums[i], nums[start]]
                }

                backtrack(start + 1)

                if (i !== start) {
                    ;[nums[start], nums[i]] = [nums[i], nums[start]]
                    steps.push({
                        array: [...nums],
                        comparing: [],
                        swapping: [start, i],
                        sorted: [],
                        message: `Backtrack: swap back ${start} and ${i}`,
                        line: 7,
                    })
                }
            }
        }

        backtrack(0)

        steps.push({
            array: [...nums],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Total permutations: ${result.length}`,
            line: 9,
        })
        return steps
    },
    'subsets': (arr) => {
        const steps = []
        const nums = arr.slice(0, 4)
        const result = []
        const current = []

        steps.push({
            array: [...nums],
            comparing: [],
            swapping: [],
            sorted: [],
            current: [],
            message: `Generate subsets of [${nums}]`,
            line: 1,
        })

        function backtrack(start) {
            result.push([...current])
            steps.push({
                array: [...nums],
                comparing: [],
                swapping: [],
                sorted: [],
                found: current.map(v => nums.indexOf(v)),
                subsetCount: result.length,
                message: `Subset ${result.length}: [${current}]`,
                line: 3,
            })

            for (let i = start; i < nums.length; i++) {
                current.push(nums[i])
                steps.push({
                    array: [...nums],
                    comparing: [i],
                    swapping: [],
                    sorted: [],
                    found: current.map(v => nums.indexOf(v)),
                    message: `Include ${nums[i]}`,
                    line: 5,
                })

                backtrack(i + 1)

                current.pop()
                steps.push({
                    array: [...nums],
                    comparing: [],
                    swapping: [i],
                    sorted: [],
                    found: current.map(v => nums.indexOf(v)),
                    message: `Exclude ${nums[i]} (backtrack)`,
                    line: 7,
                })
            }
        }

        backtrack(0)

        steps.push({
            array: [...nums],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Total subsets: ${result.length}`,
            line: 9,
        })
        return steps
    },
}

// Step generators for stack algorithms
const stacksGenerators = {
    'stack-impl': (arr) => {
        const steps = []
        const stack = []
        const elements = arr.slice(0, 6)

        steps.push({
            array: [...stack],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Stack Operations Demo - will perform push and pop operations`,
            line: 1,
        })

        // Push operations
        for (let i = 0; i < elements.length; i++) {
            stack.push(elements[i])
            steps.push({
                array: [...stack],
                comparing: [],
                swapping: [],
                sorted: [],
                found: [stack.length - 1],
                message: `Push ${elements[i]} onto stack. Stack size: ${stack.length}`,
                line: 2,
            })
        }

        // Pop operations
        while (stack.length > 0) {
            const popped = stack.pop()
            steps.push({
                array: [...stack],
                comparing: [],
                swapping: [stack.length],
                sorted: [],
                message: `Pop ${popped} from stack. Stack size: ${stack.length}`,
                line: 3,
            })
        }

        steps.push({
            array: [],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Stack is now empty! LIFO order demonstrated`,
            line: 5,
        })
        return steps
    },
    'stack-push': (arr) => {
        const steps = []
        const stack = arr.slice(0, 4)
        const newValue = 99
        const maxSize = 6

        steps.push({
            array: [...stack],
            top: stack.length - 1,
            message: `Initial stack: [${stack.join(', ')}] (Size: ${stack.length}/${maxSize})`,
            line: 1,
        })

        steps.push({
            array: [...stack],
            top: stack.length - 1,
            highlightIndex: stack.length,
            message: `Step 1: Check for overflow. Current size ${stack.length} < ${maxSize}. OK to push.`,
            line: 2,
        })

        const newStack = [...stack, newValue]
        steps.push({
            array: newStack,
            top: newStack.length - 1,
            operation: 'push',
            message: `Step 2: Increment top and insert ${newValue} at index ${newStack.length - 1}`,
            line: 3,
        })

        steps.push({
            array: newStack,
            top: newStack.length - 1,
            sorted: [newStack.length - 1],
            message: `Push complete! Top is now ${newValue} at index ${newStack.length - 1}`,
            line: 4,
        })

        return steps
    },
    'stack-pop': (arr) => {
        const steps = []
        const stack = arr.slice(0, 5)

        steps.push({
            array: [...stack],
            top: stack.length - 1,
            message: `Initial stack: [${stack.join(', ')}] (Size: ${stack.length})`,
            line: 1,
        })

        steps.push({
            array: [...stack],
            top: stack.length - 1,
            message: `Step 1: Check for underflow. Stack is not empty. OK to pop.`,
            line: 2,
        })

        const poppedValue = stack[stack.length - 1]
        steps.push({
            array: [...stack],
            top: stack.length - 1,
            operation: 'pop',
            message: `Step 2: Access the top element: ${poppedValue}`,
            line: 3,
        })

        const newStack = stack.slice(0, -1)
        steps.push({
            array: newStack,
            top: newStack.length - 1,
            message: `Step 3: Decrement top pointer. Popped value: ${poppedValue}`,
            line: 4,
        })

        steps.push({
            array: newStack,
            top: newStack.length - 1,
            swapping: [newStack.length],
            message: `Pop complete! ${poppedValue} removed from stack.`,
            line: 5,
        })

        return steps
    },
    'infix-postfix': () => {
        const steps = []
        const exp = "a+b*c"
        const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 }
        const stack = []
        const result = []

        steps.push({
            array: exp.split(''),
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Convert infix "${exp}" to postfix`,
            line: 1,
        })

        for (let i = 0; i < exp.length; i++) {
            const c = exp[i]
            if (/[a-zA-Z0-9]/.test(c)) {
                result.push(c)
                steps.push({
                    array: result.map((r, idx) => idx + 1),
                    comparing: [i],
                    swapping: [],
                    sorted: [],
                    message: `Operand '${c}' → output. Result: ${result.join('')}`,
                    line: 3,
                })
            } else {
                while (stack.length && prec[stack[stack.length - 1]] >= prec[c]) {
                    result.push(stack.pop())
                }
                stack.push(c)
                steps.push({
                    array: result.map((r, idx) => idx + 1),
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: [stack.length - 1],
                    message: `Operator '${c}' → stack. Stack: [${stack.join(', ')}]`,
                    line: 5,
                })
            }
        }

        while (stack.length) {
            result.push(stack.pop())
            steps.push({
                array: result.map((r, idx) => idx + 1),
                comparing: [],
                swapping: [],
                sorted: [],
                message: `Pop remaining: Result: ${result.join('')}`,
                line: 7,
            })
        }

        steps.push({
            array: result.map((r, idx) => idx + 1),
            comparing: [],
            swapping: [],
            sorted: result.map((r, idx) => idx),
            message: `Postfix: ${result.join('')}`,
            line: 9,
        })
        return steps
    },
}

// Step generators for queue algorithms
const queuesGenerators = {
    'queue-impl': (arr) => {
        const steps = []
        const queue = []
        const elements = arr.slice(0, 6)

        steps.push({
            array: [...queue],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Queue Operations Demo - FIFO order`,
            line: 1,
        })

        // Enqueue operations
        for (let i = 0; i < elements.length; i++) {
            queue.push(elements[i])
            steps.push({
                array: [...queue],
                comparing: [],
                swapping: [],
                sorted: [],
                found: [queue.length - 1],
                message: `Enqueue ${elements[i]} at rear. Queue size: ${queue.length}`,
                line: 2,
            })
        }

        // Dequeue operations
        while (queue.length > 0) {
            const dequeued = queue.shift()
            steps.push({
                array: [...queue],
                comparing: [],
                swapping: [0],
                sorted: [],
                message: `Dequeue ${dequeued} from front. Queue size: ${queue.length}`,
                line: 3,
            })
        }

        steps.push({
            array: [],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Queue is now empty! FIFO order demonstrated`,
            line: 5,
        })
        return steps
    },
    'circular-queue': (arr) => {
        const steps = []
        const size = 5
        const queue = new Array(size).fill(0)
        let front = -1, rear = -1

        steps.push({
            array: [...queue],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Circular Queue of size ${size}. Front: ${front}, Rear: ${rear}`,
            line: 1,
        })

        const elements = arr.slice(0, 4)
        for (const val of elements) {
            if (front === -1) front = 0
            rear = (rear + 1) % size
            queue[rear] = val
            steps.push({
                array: [...queue],
                comparing: [front],
                swapping: [],
                sorted: [],
                found: [rear],
                message: `Enqueue ${val}. Front: ${front}, Rear: ${rear}`,
                line: 3,
            })
        }

        // Dequeue some
        for (let i = 0; i < 2; i++) {
            const val = queue[front]
            queue[front] = 0
            front = (front + 1) % size
            steps.push({
                array: [...queue],
                comparing: [front],
                swapping: [(front - 1 + size) % size],
                sorted: [],
                message: `Dequeue ${val}. Front: ${front}, Rear: ${rear}`,
                line: 5,
            })
        }

        steps.push({
            array: [...queue],
            comparing: [front],
            swapping: [],
            sorted: [],
            found: [rear],
            message: `Circular Queue Demo Complete! Wrapping works.`,
            line: 7,
        })
        return steps
    },
    'queue-enqueue': (arr) => {
        const steps = []
        const queueSize = 5
        const queue = arr.slice(0, 4)
        const newValue = 88

        steps.push({
            array: [...queue],
            front: 0,
            rear: queue.length - 1,
            message: `Initial queue: [${queue.join(', ')}] (Size: ${queue.length}/${queueSize})`,
            line: 1,
        })

        steps.push({
            array: [...queue],
            front: 0,
            rear: queue.length - 1,
            message: `Step 1: Check for overflow. Current size ${queue.length} < ${queueSize}. OK to enqueue.`,
            line: 2,
        })

        const newQueue = [...queue, newValue]
        steps.push({
            array: newQueue,
            front: 0,
            rear: newQueue.length - 1,
            operation: 'enqueue',
            message: `Step 2: Update rear and insert ${newValue} at the end.`,
            line: 3,
        })

        steps.push({
            array: newQueue,
            front: 0,
            rear: newQueue.length - 1,
            sorted: [newQueue.length - 1],
            message: `Enqueue complete! Rear is now ${newValue} at index ${newQueue.length - 1}`,
            line: 4,
        })

        return steps
    },
    'queue-dequeue': (arr) => {
        const steps = []
        const queue = arr.slice(0, 5)

        steps.push({
            array: [...queue],
            front: 0,
            rear: queue.length - 1,
            message: `Initial queue: [${queue.join(', ')}] (Size: ${queue.length})`,
            line: 1,
        })

        steps.push({
            array: [...queue],
            front: 0,
            rear: queue.length - 1,
            message: `Step 1: Check for underflow. Queue is not empty. OK to dequeue.`,
            line: 2,
        })

        const dequeuedValue = queue[0]
        steps.push({
            array: [...queue],
            front: 0,
            rear: queue.length - 1,
            operation: 'dequeue',
            message: `Step 2: Access the front element: ${dequeuedValue}`,
            line: 3,
        })

        const newQueue = queue.slice(1)
        steps.push({
            array: newQueue,
            front: 0,
            rear: newQueue.length - 1,
            message: `Step 3: Update front pointer (remove element from front). Dequeued value: ${dequeuedValue}`,
            line: 4,
        })

        steps.push({
            array: newQueue,
            front: 0,
            rear: newQueue.length - 1,
            swapping: [0],
            message: `Dequeue complete! ${dequeuedValue} removed from front.`,
            line: 5,
        })

        return steps
    },
}

// Step generators for linked list algorithms
const linkedListsGenerators = {
    'singly-linked-list': (arr) => {
        const steps = []
        const nodes = []
        const elements = arr.slice(0, 6)

        steps.push({
            array: [...nodes],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Building Singly Linked List from ${elements.length} elements`,
            line: 1,
        })

        for (let i = 0; i < elements.length; i++) {
            nodes.push(elements[i])
            steps.push({
                array: [...nodes],
                comparing: [],
                swapping: [],
                sorted: [],
                found: [nodes.length - 1],
                message: `Insert ${elements[i]} at tail. List: ${nodes.join(' → ')} → null`,
                line: 3,
            })
        }

        steps.push({
            array: [...nodes],
            comparing: [],
            swapping: [],
            sorted: nodes.map((_, i) => i),
            message: `Final List: ${nodes.join(' → ')} → null`,
            line: 5,
        })
        return steps
    },
    'singly-linked-list-insert-head': (arr) => {
        const steps = []
        const nodes = arr.slice(0, 4)
        const newElement = 99

        steps.push({
            array: [...nodes],
            head: 0,
            message: `Initial list: ${nodes.join(' → ')} → null`,
            line: 1,
        })

        steps.push({
            array: [newElement, ...nodes],
            found: [0],
            head: 1,
            message: `Created new node ${newElement}, pointing its next to current head (${nodes[0]})`,
            line: 2,
        })

        steps.push({
            array: [newElement, ...nodes],
            found: [0],
            head: 0,
            message: `Updated head to point to {newElement}`,
            line: 3,
        })

        steps.push({
            array: [newElement, ...nodes],
            sorted: [0, 1, 2, 3, 4],
            message: `Insertion complete: ${[newElement, ...nodes].join(' → ')} → null`,
            line: 4,
        })

        return steps
    },
    'singly-linked-list-insert-position': (arr) => {
        const steps = []
        const nodes = arr.slice(0, 4)
        const newElement = 55
        const pos = 2

        steps.push({
            array: [...nodes],
            message: `Insert ${newElement} at position ${pos}`,
            line: 1,
        })

        for (let i = 0; i < pos; i++) {
            steps.push({
                array: [...nodes],
                current: i,
                message: `Traversing... currently at node ${i} (value: ${nodes[i]})`,
                line: 2,
            })
        }

        const result = [...nodes]
        result.splice(pos, 0, newElement)

        steps.push({
            array: result,
            prev: pos - 1,
            found: [pos],
            next: pos + 1,
            message: `Update pointers: Node ${nodes[pos - 1]} → ${newElement} → ${nodes[pos]}`,
            line: 3,
        })

        steps.push({
            array: result,
            sorted: result.map((_, i) => i),
            message: `Insertion complete: ${result.join(' → ')} → null`,
            line: 4,
        })

        return steps
    },
    'reverse-linked-list': (arr) => {
        const steps = []
        const nodes = arr.slice(0, 6)
        const original = [...nodes]

        steps.push({
            array: [...nodes],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Reverse list: ${nodes.join(' → ')} → null`,
            line: 1,
        })

        for (let i = 0; i < Math.floor(nodes.length / 2); i++) {
            const j = nodes.length - 1 - i
            steps.push({
                array: [...nodes],
                comparing: [i, j],
                swapping: [],
                sorted: [],
                message: `Swap positions ${i} and ${j}`,
                line: 3,
            })
                ;[nodes[i], nodes[j]] = [nodes[j], nodes[i]]
            steps.push({
                array: [...nodes],
                comparing: [],
                swapping: [i, j],
                sorted: [],
                message: `After swap: ${nodes.join(' → ')} → null`,
                line: 4,
            })
        }

        steps.push({
            array: [...nodes],
            comparing: [],
            swapping: [],
            sorted: nodes.map((_, i) => i),
            message: `Reversed: ${nodes.join(' → ')} → null`,
            line: 6,
        })
        return steps
    },
    'detect-cycle': (arr) => {
        const steps = []
        const nodes = arr.slice(0, 8)

        steps.push({
            array: [...nodes],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Floyd's Cycle Detection: slow moves 1, fast moves 2`,
            line: 1,
        })

        let slow = 0, fast = 0
        for (let i = 0; i < nodes.length && fast < nodes.length - 1; i++) {
            slow++
            fast = Math.min(fast + 2, nodes.length - 1)
            steps.push({
                array: [...nodes],
                comparing: [slow],
                swapping: [],
                sorted: [],
                found: [fast],
                message: `Step ${i + 1}: slow at ${slow}, fast at ${fast}`,
                line: 3,
            })
        }

        steps.push({
            array: [...nodes],
            comparing: [],
            swapping: [],
            sorted: nodes.map((_, i) => i),
            message: `No cycle detected - fast reached end`,
            line: 5,
        })
        return steps
    },
    'doubly-linked-list': (arr) => {
        const steps = []
        const nodes = arr.slice(0, 5)

        steps.push({
            array: [...nodes],
            isDoubly: true,
            message: `Doubly Linked List: each node has prev and next pointers`,
            line: 1,
        })

        const list = []
        for (let i = 0; i < nodes.length; i++) {
            list.push(nodes[i])
            steps.push({
                array: [...list],
                isDoubly: true,
                found: [list.length - 1],
                message: `Insert ${nodes[i]} at tail`,
                line: 3,
            })
        }

        steps.push({
            array: [...list],
            isDoubly: true,
            sorted: list.map((_, i) => i),
            message: `DLL Complete`,
            line: 5,
        })
        return steps
    },
    'doubly-linked-list-insert-head': (arr) => {
        const steps = []
        const nodes = arr.slice(0, 4)
        const newElement = 88

        steps.push({
            array: [...nodes],
            isDoubly: true,
            head: 0,
            message: `Initial Doubly Linked List`,
            line: 1,
        })

        steps.push({
            array: [newElement, ...nodes],
            isDoubly: true,
            found: [0],
            head: 1,
            message: `Created node ${newElement}. Point its next to ${nodes[0]}.`,
            line: 2,
        })

        steps.push({
            array: [newElement, ...nodes],
            isDoubly: true,
            found: [0],
            head: 0,
            next: 1,
            message: `Update head and set ${nodes[0]}.prev to new node.`,
            line: 3,
        })

        steps.push({
            array: [newElement, ...nodes],
            isDoubly: true,
            sorted: [0, 1, 2, 3, 4],
            message: `DLL Head insertion complete`,
            line: 4,
        })

        return steps
    },
    'doubly-linked-list-insert-position': (arr) => {
        const steps = []
        const nodes = arr.slice(0, 4)
        const newElement = 77
        const pos = 2

        steps.push({
            array: [...nodes],
            isDoubly: true,
            message: `DLL: Insert ${newElement} at position ${pos}`,
            line: 1,
        })

        for (let i = 0; i < pos; i++) {
            steps.push({
                array: [...nodes],
                isDoubly: true,
                current: i,
                message: `Traversing... at node ${i}`,
                line: 2,
            })
        }

        const result = [...nodes]
        result.splice(pos, 0, newElement)

        steps.push({
            array: result,
            isDoubly: true,
            prev: pos - 1,
            found: [pos],
            next: pos + 1,
            message: `Link nodes: ${nodes[pos - 1]} ⇄ ${newElement} ⇄ ${nodes[pos]}`,
            line: 3,
        })

        steps.push({
            array: result,
            isDoubly: true,
            sorted: result.map((_, i) => i),
            message: `DLL Position insertion complete`,
            line: 4,
        })
        return steps
    },
    'doubly-reverse-linked-list': (arr) => {
        const steps = []
        const nodes = arr.slice(0, 5)

        steps.push({
            array: [...nodes],
            isDoubly: true,
            message: `Reverse DLL: Swap prev and next for each node`,
            line: 1,
        })

        const result = [...nodes]
        for (let i = 0; i < nodes.length; i++) {
            steps.push({
                array: [...result],
                isDoubly: true,
                current: i,
                message: `Swapping prev and next pointers for node ${nodes[i]}`,
                line: 2,
            })
        }

        result.reverse()
        steps.push({
            array: result,
            isDoubly: true,
            sorted: result.map((_, i) => i),
            message: `DLL Reversal complete`,
            line: 3,
        })
        return steps
    },
}





// Step generators for string algorithms
const stringsGenerators = {
    'kmp': () => {
        const steps = []
        const text = "ABABDABACDABABCABAB"
        const pattern = "ABABC"

        steps.push({
            array: pattern.split('').map((_, i) => i + 1),
            comparing: [],
            swapping: [],
            sorted: [],
            message: `KMP: Find "${pattern}" in text`,
            line: 1,
        })

        // Build LPS
        const lps = [0]
        let len = 0
        for (let i = 1; i < pattern.length; i++) {
            if (pattern[i] === pattern[len]) {
                lps.push(++len)
            } else {
                lps.push(0)
                len = 0
            }
        }

        steps.push({
            array: lps,
            comparing: [],
            swapping: [],
            sorted: [],
            found: lps.map((_, i) => i),
            message: `LPS array: [${lps.join(', ')}]`,
            line: 3,
        })

        // Search
        let matches = 0
        for (let i = 0; i < text.length - pattern.length + 1; i++) {
            let match = true
            for (let j = 0; j < pattern.length; j++) {
                if (text[i + j] !== pattern[j]) {
                    match = false
                    break
                }
            }
            if (match) {
                matches++
                steps.push({
                    array: lps,
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: lps.map((_, i) => i),
                    message: `Pattern found at index ${i}!`,
                    line: 5,
                })
            }
        }

        steps.push({
            array: lps,
            comparing: [],
            swapping: [],
            sorted: lps.map((_, i) => i),
            message: `KMP Complete! Found ${matches} match(es)`,
            line: 7,
        })
        return steps
    },
    'rabin-karp': () => {
        const steps = []
        const text = "AABAACAADAABAABA"
        const pattern = "AABA"
        const d = 256, q = 101

        steps.push({
            array: [1, 2, 3, 4],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Rabin-Karp: Rolling hash to find "${pattern}"`,
            line: 1,
        })

        // Calculate pattern hash
        let pHash = 0
        for (let i = 0; i < pattern.length; i++) {
            pHash = (pHash * d + pattern.charCodeAt(i)) % q
        }

        steps.push({
            array: [pHash, 0, 0, 0],
            comparing: [],
            swapping: [],
            sorted: [],
            found: [0],
            message: `Pattern hash = ${pHash}`,
            line: 3,
        })

        let matches = []
        for (let i = 0; i <= text.length - pattern.length; i++) {
            if (text.substring(i, i + pattern.length) === pattern) {
                matches.push(i)
                steps.push({
                    array: [pHash, i, 0, 0],
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: [0, 1],
                    message: `Hash match at index ${i}! Verified: "${pattern}"`,
                    line: 5,
                })
            }
        }

        steps.push({
            array: [pHash, matches.length, 0, 0],
            comparing: [],
            swapping: [],
            sorted: [0, 1],
            message: `Rabin-Karp Complete! Found at indices: [${matches.join(', ')}]`,
            line: 7,
        })
        return steps
    },
    'trie-impl': () => {
        const steps = []
        const words = ["cat", "car", "card", "care"]

        steps.push({
            array: [1, 2, 3, 4],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Trie: Insert words [${words.join(', ')}]`,
            line: 1,
        })

        for (let i = 0; i < words.length; i++) {
            steps.push({
                array: words.map((_, idx) => idx + 1),
                comparing: [],
                swapping: [],
                sorted: [],
                found: [i],
                message: `Insert "${words[i]}": c → a → ${words[i].slice(2).split('').join(' → ')} [end]`,
                line: 3,
            })
        }

        steps.push({
            array: words.map((_, idx) => idx + 1),
            comparing: [],
            swapping: [],
            sorted: [0, 1, 2, 3],
            message: `Trie built! Prefix "car" matches: car, card, care`,
            line: 6,
        })
        return steps
    },
}

// Step generators for greedy algorithms
const greedyGenerators = {
    'interval-scheduling': () => {
        const steps = []
        const intervals = [[1, 3], [2, 4], [3, 5], [0, 6], [5, 7], [6, 8]]

        steps.push({
            array: intervals.map(i => i[1]),
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Interval Scheduling: Select max non-overlapping intervals`,
            line: 1,
        })

        // Sort by end time
        intervals.sort((a, b) => a[1] - b[1])
        steps.push({
            array: intervals.map(i => i[1]),
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Sorted by end time: ${intervals.map(i => `[${i}]`).join(', ')}`,
            line: 2,
        })

        const selected = []
        let lastEnd = -Infinity
        for (let i = 0; i < intervals.length; i++) {
            if (intervals[i][0] >= lastEnd) {
                selected.push(i)
                lastEnd = intervals[i][1]
                steps.push({
                    array: intervals.map(i => i[1]),
                    comparing: [],
                    swapping: [],
                    sorted: [],
                    found: [...selected],
                    message: `Select [${intervals[i]}], lastEnd = ${lastEnd}`,
                    line: 4,
                })
            } else {
                steps.push({
                    array: intervals.map(i => i[1]),
                    comparing: [i],
                    swapping: [],
                    sorted: [],
                    found: [...selected],
                    message: `Skip [${intervals[i]}] - overlaps`,
                    line: 5,
                })
            }
        }

        steps.push({
            array: intervals.map(i => i[1]),
            comparing: [],
            swapping: [],
            sorted: selected,
            message: `Max non-overlapping: ${selected.length} intervals`,
            line: 7,
        })
        return steps
    },
    'huffman-coding': () => {
        const steps = []
        const freqs = [5, 9, 12, 13, 16, 45]
        const chars = ['a', 'b', 'c', 'd', 'e', 'f']

        steps.push({
            array: [...freqs],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Huffman: Build optimal codes for frequencies`,
            line: 1,
        })

        const heap = [...freqs].sort((a, b) => a - b)
        while (heap.length > 1) {
            const a = heap.shift()
            const b = heap.shift()
            const combined = a + b
            heap.push(combined)
            heap.sort((a, b) => a - b)

            steps.push({
                array: [...heap],
                comparing: [],
                swapping: [],
                sorted: [],
                found: [heap.indexOf(combined)],
                message: `Combine ${a} + ${b} = ${combined}`,
                line: 4,
            })
        }

        steps.push({
            array: [heap[0]],
            comparing: [],
            swapping: [],
            sorted: [0],
            message: `Huffman tree root = ${heap[0]}. Optimal encoding built!`,
            line: 7,
        })
        return steps
    },
}

// Step generators for bit manipulation
const bitManipulationGenerators = {
    'bit-basics': (arr) => {
        const steps = []
        const num = arr[0] || 42

        steps.push({
            array: [num],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Bit operations on ${num} (binary: ${num.toString(2)})`,
            line: 1,
        })

        const bits = num.toString(2).split('').map(Number)
        steps.push({
            array: bits.map(b => b * 50),
            comparing: [],
            swapping: [],
            sorted: [],
            found: bits.map((b, i) => b === 1 ? i : -1).filter(i => i >= 0),
            message: `Binary: ${num.toString(2).padStart(8, '0')}`,
            line: 2,
        })

        const setBit = num | (1 << 0)
        steps.push({
            array: setBit.toString(2).split('').map(b => Number(b) * 50),
            comparing: [],
            swapping: [],
            sorted: [],
            found: [setBit.toString(2).length - 1],
            message: `Set bit 0: ${num} | 1 = ${setBit}`,
            line: 3,
        })

        const clearBit = num & ~(1 << 1)
        steps.push({
            array: clearBit.toString(2).split('').map(b => Number(b) * 50),
            comparing: [],
            swapping: [clearBit.toString(2).length - 2],
            sorted: [],
            message: `Clear bit 1: ${num} & ~2 = ${clearBit}`,
            line: 4,
        })

        const toggleBit = num ^ (1 << 2)
        steps.push({
            array: toggleBit.toString(2).split('').map(b => Number(b) * 50),
            comparing: [],
            swapping: [],
            sorted: [],
            found: [toggleBit.toString(2).length - 3],
            message: `Toggle bit 2: ${num} ^ 4 = ${toggleBit}`,
            line: 5,
        })

        const popcount = num.toString(2).split('').filter(b => b === '1').length
        steps.push({
            array: [popcount * 10],
            comparing: [],
            swapping: [],
            sorted: [0],
            message: `Count bits: ${num} has ${popcount} set bits`,
            line: 6,
        })
        return steps
    },
    'xor-tricks': (arr) => {
        const steps = []
        const nums = [2, 3, 2, 4, 3]

        steps.push({
            array: [...nums],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Find single number using XOR: [${nums.join(', ')}]`,
            line: 1,
        })

        let xor = 0
        for (let i = 0; i < nums.length; i++) {
            xor ^= nums[i]
            steps.push({
                array: [...nums],
                comparing: [i],
                swapping: [],
                sorted: [],
                found: [i],
                message: `XOR with ${nums[i]}: result = ${xor}`,
                line: 3,
            })
        }

        steps.push({
            array: [xor],
            comparing: [],
            swapping: [],
            sorted: [0],
            message: `Single number = ${xor} (XOR of pairs = 0)`,
            line: 5,
        })
        return steps
    },
}

// Step generators for advanced algorithms
const advancedGenerators = {
    'dsu': (arr) => {
        const steps = []
        const n = Math.min(arr.length, 6)
        const parent = Array.from({ length: n }, (_, i) => i)
        const rank = new Array(n).fill(0)

        steps.push({
            array: [...parent],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Union-Find: ${n} elements, each is its own parent`,
            line: 1,
        })

        // Union operations
        const unions = [[0, 1], [1, 2], [3, 4]]
        for (const [x, y] of unions) {
            if (x < n && y < n) {
                parent[y] = parent[x]
                steps.push({
                    array: [...parent],
                    comparing: [x, y],
                    swapping: [],
                    sorted: [],
                    found: [x],
                    message: `Union(${x}, ${y}): parent[${y}] = ${parent[y]}`,
                    line: 3,
                })
            }
        }

        // Find with path compression
        steps.push({
            array: [...parent],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Find(2) with path compression`,
            line: 5,
        })

        let root = 2
        while (parent[root] !== root) {
            parent[root] = parent[parent[root]]
            root = parent[root]
        }

        steps.push({
            array: [...parent],
            comparing: [],
            swapping: [],
            sorted: parent.map((_, i) => i),
            message: `DSU Complete! Components identified`,
            line: 7,
        })
        return steps
    },
    'segment-tree': (arr) => {
        const steps = []
        const n = Math.min(arr.length, 8)
        const nums = arr.slice(0, n)
        const tree = new Array(4 * n).fill(0)

        steps.push({
            array: [...nums],
            comparing: [],
            swapping: [],
            sorted: [],
            message: `Segment Tree: Build for range sum queries`,
            line: 1,
        })

        for (let i = 0; i < n; i++) {
            tree[n + i] = nums[i]
        }
        for (let i = n - 1; i > 0; i--) {
            tree[i] = tree[2 * i] + tree[2 * i + 1]
        }

        steps.push({
            array: tree.slice(1, 2 * n),
            comparing: [],
            swapping: [],
            sorted: [],
            found: [0],
            message: `Tree built. Root = ${tree[1]} (total sum)`,
            line: 3,
        })

        // Query example
        const l = 1, r = 3
        let sum = 0
        for (let i = l; i <= r; i++) {
            sum += nums[i]
        }

        steps.push({
            array: tree.slice(1, 2 * n),
            comparing: [],
            swapping: [],
            sorted: [],
            found: [l, r],
            message: `Query sum[${l}..${r}] = ${sum} in O(log n)`,
            line: 5,
        })

        steps.push({
            array: tree.slice(1, 2 * n),
            comparing: [],
            swapping: [],
            sorted: tree.slice(1, 2 * n).map((_, i) => i),
            message: `Segment Tree: O(log n) query, O(log n) update`,
            line: 7,
        })
        return steps
    },
}

// Step generators for graph algorithms
const graphsGenerators = {
    'graph-bfs': (data) => {
        const steps = []
        const nodes = data.nodes || [0, 1, 2, 3, 4, 5]
        const edges = data.edges || [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]]
        const startNode = nodes[0]

        const queue = [startNode]
        const visited = [startNode]
        const traversalOrder = []

        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [...visited],
            queue: [...queue],
            current: startNode,
            message: `BFS Start: Start at node ${startNode}`,
            line: 1,
        })

        let qIndex = 0
        while (qIndex < queue.length) {
            const current = queue[qIndex++]
            traversalOrder.push(current)

            steps.push({
                graphNodes: nodes,
                graphEdges: edges,
                visited: [...visited],
                queue: queue.slice(qIndex),
                current: current,
                message: `Visit node ${current}`,
                line: 2,
            })

            // Get neighbors
            const neighbors = edges
                .filter(([from, to]) => from === current || to === current)
                .map(([from, to]) => from === current ? to : from)
                .sort((a, b) => a - b)

            for (const neighbor of neighbors) {
                if (!visited.includes(neighbor)) {
                    visited.push(neighbor)
                    queue.push(neighbor)
                    steps.push({
                        graphNodes: nodes,
                        graphEdges: edges,
                        visited: [...visited],
                        queue: queue.slice(qIndex),
                        current: neighbor,
                        message: `Node ${current} has unvisited neighbor ${neighbor}. Add to queue.`,
                        line: 3,
                    })
                }
            }
        }

        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [...visited],
            queue: [],
            current: null,
            message: `BFS Complete! Traversal: [${traversalOrder.join(' → ')}]`,
            line: 5,
        })
        return steps
    },
    'graph-dfs': (data) => {
        const steps = []
        const nodes = data.nodes || [0, 1, 2, 3, 4, 5]
        const edges = data.edges || [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]]
        const startNode = nodes[0]

        const visited = []
        const traversalOrder = []

        const dfs = (node) => {
            visited.push(node)
            traversalOrder.push(node)

            steps.push({
                graphNodes: nodes,
                graphEdges: edges,
                visited: [...visited],
                current: node,
                message: `Visit node ${node}`,
                line: 2,
            })

            const neighbors = edges
                .filter(([from, to]) => from === node || to === node)
                .map(([from, to]) => from === node ? to : from)
                .sort((a, b) => a - b)

            for (const neighbor of neighbors) {
                if (!visited.includes(neighbor)) {
                    steps.push({
                        graphNodes: nodes,
                        graphEdges: edges,
                        visited: [...visited],
                        current: neighbor,
                        message: `Explore neighbor ${neighbor} of ${node}`,
                        line: 3,
                    })
                    dfs(neighbor)
                }
            }
        }

        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [],
            current: startNode,
            message: `DFS Start: Start at node ${startNode}`,
            line: 1,
        })

        dfs(startNode)

        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [...visited],
            current: null,
            message: `DFS Complete! Traversal: [${traversalOrder.join(' → ')}]`,
            line: 5,
        })
        return steps
    },
    'dijkstra': (data) => {
        const steps = []
        const nodes = data.nodes || (Array.isArray(data) ? data.slice(0, 5) : [0, 1, 2, 3, 4])
        const edges = data.edges || []

        const dist = nodes.map(() => Infinity)
        dist[0] = 0
        const visited = []

        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            array: dist.map(d => d === Infinity ? 99 : d),
            visited: [],
            message: `Dijkstra from node 0. Initial distances: [${dist.map(d => d === Infinity ? '∞' : d).join(', ')}]`,
            line: 1
        })

        for (let i = 0; i < nodes.length; i++) {
            // Find min distance unvisited node
            let minDist = Infinity, u = -1
            for (let j = 0; j < nodes.length; j++) {
                if (!visited.includes(j) && dist[j] < minDist) {
                    minDist = dist[j]
                    u = j
                }
            }
            if (u === -1) break
            visited.push(u)

            const neighbors = edges.filter(e => e.includes(u)).map(e => e[0] === u ? e[1] : e[0])

            const effectiveNeighbors = edges.length > 0 ? neighbors : [(u + 1) % nodes.length]

            for (const v of effectiveNeighbors) {
                if (!visited.includes(v)) {
                    const weight = 1
                    if (dist[u] + weight < dist[v]) {
                        dist[v] = dist[u] + weight
                    }
                }
            }

            steps.push({
                graphNodes: nodes,
                graphEdges: edges,
                array: dist.map(d => d === Infinity ? 99 : d),
                visited: [...visited],
                current: u,
                message: `Process node ${u}. Update neighbors. Dist: [${dist.map(d => d === Infinity ? '∞' : d).join(', ')}]`,
                line: 4,
            })
        }

        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            array: dist.map(d => d === Infinity ? 99 : d),
            visited: [...visited],
            current: null,
            message: `Dijkstra Complete! Shortest distances from 0`,
            line: 7,
        })
        return steps
    },
    'topological-sort': (data) => {
        const steps = []
        const nodes = data.nodes || (Array.isArray(data) ? data.slice(0, 5) : [0, 1, 2, 3, 4])
        const result = []
        const visited = new Set()

        steps.push({
            graphNodes: nodes,
            visited: [],
            message: `Topological Sort: order tasks with dependencies`,
            line: 1,
        })

        // Simple DFS based topo sort
        const dfsTopo = (u) => {
            visited.add(u)
            steps.push({
                graphNodes: nodes,
                visited: Array.from(visited),
                current: u,
                message: `Visiting ${u}`,
                line: 2
            })

        }

        for (let i = nodes.length - 1; i >= 0; i--) {
            if (!visited.has(i)) {
                dfsTopo(i)
                result.unshift(i)
                steps.push({
                    graphNodes: nodes,
                    visited: Array.from(visited),
                    current: i,
                    message: `Node ${i} processed. Push to stack: ${i}`,
                    line: 4,
                })
            }
        }

        steps.push({
            graphNodes: nodes,
            visited: Array.from(visited),
            current: null,
            array: result, // Show stack
            message: `Topological Order: [${result.join(' → ')}]`,
            line: 7,
        })
        return steps
    }
}

// Step generators for tree algorithms
const treesGenerators = {
    'inorder-traversal': (data) => {
        const steps = []
        const nodes = Array.isArray(data) ? data : (data.array || [1, 2, 3, 4, 5, 6, 7])
        const traversal = []
        const visited = []

        steps.push({
            treeNodes: nodes,
            visitedNodes: [],
            currentNode: null,
            message: "Inorder Traversal: Left -> Root -> Right",
            line: 1
        })

        const traverse = (index) => {
            if (index >= nodes.length || nodes[index] === null) return

            // Left
            traverse(2 * index + 1)

            // Root
            traversal.push(nodes[index])
            visited.push(index)
            steps.push({
                treeNodes: nodes,
                visitedNodes: [...visited],
                currentNode: index,
                traversalOrder: [...traversal],
                message: `Visit Node ${nodes[index]}`,
                line: 2
            })

            // Right
            traverse(2 * index + 2)
        }

        traverse(0)
        return steps
    },
    'preorder-traversal': (data) => {
        const steps = []
        const nodes = Array.isArray(data) ? data : (data.array || [1, 2, 3, 4, 5, 6, 7])
        const traversal = []
        const visited = []

        const traverse = (index) => {
            if (index >= nodes.length || nodes[index] === null) return

            // Root
            traversal.push(nodes[index])
            visited.push(index)
            steps.push({
                treeNodes: nodes,
                visitedNodes: [...visited],
                currentNode: index,
                traversalOrder: [...traversal],
                message: `Visit Node ${nodes[index]}`,
                line: 2
            })

            // Left
            traverse(2 * index + 1)
            // Right
            traverse(2 * index + 2)
        }

        steps.push({
            treeNodes: nodes,
            visitedNodes: [],
            currentNode: null,
            message: "Preorder Traversal: Root -> Left -> Right",
            line: 1
        })
        traverse(0)
        return steps
    },
    'postorder-traversal': (data) => {
        const steps = []
        const nodes = Array.isArray(data) ? data : (data.array || [1, 2, 3, 4, 5, 6, 7])
        const traversal = []
        const visited = []

        const traverse = (index) => {
            if (index >= nodes.length || nodes[index] === null) return

            // Left
            traverse(2 * index + 1)
            // Right
            traverse(2 * index + 2)

            // Root
            traversal.push(nodes[index])
            visited.push(index)
            steps.push({
                treeNodes: nodes,
                visitedNodes: [...visited],
                currentNode: index,
                traversalOrder: [...traversal],
                message: `Visit Node ${nodes[index]}`,
                line: 2
            })
        }

        steps.push({
            treeNodes: nodes,
            visitedNodes: [],
            currentNode: null,
            message: "Postorder Traversal: Left -> Right -> Root",
            line: 1
        })
        traverse(0)
        return steps
    },
    'level-order-traversal': (data) => {
        const steps = []
        const nodes = Array.isArray(data) ? data : (data.array || [1, 2, 3, 4, 5, 6, 7])
        const result = []

        steps.push({
            treeNodes: nodes,
            visitedNodes: [],
            currentNode: null,
            message: `Level Order (BFS): Visit nodes level by level`,
            line: 1,
        })

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] === null) continue
            result.push(nodes[i])
            steps.push({
                treeNodes: nodes,
                visitedNodes: Array.from({ length: i + 1 }, (_, k) => k).filter(k => nodes[k] !== null),
                currentNode: i,
                traversalOrder: [...result],
                message: `Visit node ${nodes[i]}`,
                line: 3,
            })
        }
        return steps
    },
    'bst-impl': (data) => {
        const steps = []
        const elements = Array.isArray(data) ? data.slice(0, 10) : (data.array || [10, 5, 15, 3, 7, 12, 18]).slice(0, 10)
        const tree = []
        const treeArray = new Array(31).fill(null)

        steps.push({
            treeNodes: [...treeArray],
            visitedNodes: [],
            message: `Building BST from [${elements.join(', ')}]`,
            line: 1
        })

        for (const val of elements) {
            let curr = 0
            while (curr < 31) {
                if (treeArray[curr] === null) {
                    treeArray[curr] = val
                    steps.push({
                        treeNodes: [...treeArray],
                        visitedNodes: [curr],
                        currentNode: curr,
                        message: `Inserted ${val} at index ${curr}`,
                        line: 3
                    })
                    break
                }
                if (val < treeArray[curr]) curr = 2 * curr + 1
                else curr = 2 * curr + 2

                steps.push({
                    treeNodes: [...treeArray],
                    visitedNodes: [],
                    currentNode: curr,
                    message: `Checking index ${curr} for ${val}`,
                    line: 2
                })
            }
        }
        return steps
    },
    'tree-height': (data) => {
        const steps = []
        const nodes = Array.isArray(data) ? data : (data.array || [1, 2, 3, 4, 5, 6, 7])
        const n = nodes.length
        const height = Math.floor(Math.log2(n)) + 1

        steps.push({
            treeNodes: nodes,
            message: `Tree Height Calculation. Nodes: ${n}`,
            line: 1
        })

        steps.push({
            treeNodes: nodes,
            message: `Height = floor(log2(${n})) + 1 = ${height}`,
            line: 2
        })
        return steps
    },
    'avl-tree': (data) => {
        const steps = []
        const elements = Array.isArray(data) ? data.slice(0, 10) : (data.array || [10, 20, 30, 40, 50, 25]).slice(0, 15)

        // Helper class for AVL Node
        class Node {
            constructor(val) {
                this.val = val;
                this.left = null;
                this.right = null;
                this.height = 1;
            }
        }

        let root = null;

        // Helper to convert tree to array for visualization
        const getTreeArray = (node) => {
            const arr = new Array(31).fill(null);
            if (!node) return arr;
            const q = [{ node, idx: 0 }];
            while (q.length) {
                const { node: curr, idx } = q.shift();
                if (idx < 31) {
                    arr[idx] = curr.val;
                    if (curr.left) q.push({ node: curr.left, idx: 2 * idx + 1 });
                    if (curr.right) q.push({ node: curr.right, idx: 2 * idx + 2 });
                }
            }
            return arr;
        }

        const getHeight = (n) => n ? n.height : 0;
        const getBalance = (n) => n ? getHeight(n.left) - getHeight(n.right) : 0;

        const rightRotate = (y) => {
            const x = y.left;
            const T2 = x.right;
            x.right = y;
            y.left = T2;
            y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
            x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
            return x;
        }

        const leftRotate = (x) => {
            const y = x.right;
            const T2 = y.left;
            y.left = x;
            x.right = T2;
            x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
            y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
            return y;
        }

        const insert = (node, val) => {
            if (!node) return new Node(val);
            if (val < node.val) node.left = insert(node.left, val);
            else if (val > node.val) node.right = insert(node.right, val);
            else return node;

            node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
            const balance = getBalance(node);

            // Left Left
            if (balance > 1 && val < node.left.val) {
                steps.push({
                    treeNodes: getTreeArray(root),
                    message: `Imbalance at ${node.val} (Bal: ${balance}). Performing Right Rotate.`,
                    line: 4
                });
                return rightRotate(node);
            }
            // Right Right
            if (balance < -1 && val > node.right.val) {
                steps.push({
                    treeNodes: getTreeArray(root),
                    message: `Imbalance at ${node.val} (Bal: ${balance}). Performing Left Rotate.`,
                    line: 4
                });
                return leftRotate(node);
            }
            // Left Right
            if (balance > 1 && val > node.left.val) {
                steps.push({
                    treeNodes: getTreeArray(root),
                    message: `Imbalance at ${node.val} (Bal: ${balance}). Left Rotate ${node.left.val}, then Right Rotate.`,
                    line: 4
                });
                node.left = leftRotate(node.left);
                return rightRotate(node);
            }
            // Right Left
            if (balance < -1 && val < node.right.val) {
                steps.push({
                    treeNodes: getTreeArray(root),
                    message: `Imbalance at ${node.val} (Bal: ${balance}). Right Rotate ${node.right.val}, then Left Rotate.`,
                    line: 4
                });
                node.right = rightRotate(node.right);
                return leftRotate(node);
            }

            return node;
        }

        steps.push({
            treeNodes: new Array(31).fill(null),
            message: `AVL Tree Insertion: [${elements.join(', ')}]`,
            line: 1
        });

        for (const val of elements) {
            root = insert(root, val);
            steps.push({
                treeNodes: getTreeArray(root),
                message: `Inserted ${val}. Tree balanced.`,
                line: 2
            });
        }

        return steps;
    }
}


// Step generators for hashing algorithms
const hashingGenerators = {
    'linear-probing': (arr) => {
        const steps = []
        const size = 7
        const table = new Array(size).fill(null)
        const elements = arr.slice(0, 6)

        steps.push({
            array: table.map(v => v || 0),
            buckets: Array(size).fill([]),
            message: `Linear Probing Hash Table. Size: ${size}`,
            line: 1,
        })

        for (const val of elements) {
            let hash = Math.abs(val % size)
            let probes = 0

            steps.push({
                array: table.map(v => v || 0),
                buckets: table.map(v => v !== null ? [v] : []),
                currentHash: hash,
                message: `Attempting to insert ${val} at index ${hash}`,
                key: val,
                operation: 'search'
            })

            while (table[hash] !== null && probes < size) {
                probes++
                hash = (hash + 1) % size

                steps.push({
                    array: table.map(v => v || 0),
                    buckets: table.map(v => v !== null ? [v] : []),
                    currentHash: hash,
                    message: `Collision! Probing next index: ${hash}`,
                    key: val,
                    operation: 'search'
                })
            }

            if (table[hash] === null) {
                table[hash] = val
                steps.push({
                    array: table.map(v => v || 0),
                    buckets: table.map(v => v !== null ? [v] : []),
                    currentHash: hash,
                    found: [hash],
                    message: `Inserted ${val} at index ${hash}`,
                    key: val,
                    operation: 'insert',
                    line: 4,
                })
            }
        }

        steps.push({
            array: table.map(v => v || 0),
            buckets: table.map(v => v !== null ? [v] : []),
            message: `Linear Probing insertion complete.`,
            line: 6
        })
        return steps
    },

    'hash-table': (arr) => {
        const steps = []
        const nums = arr.slice(0, 10)
        const buckets = Array(7).fill(null).map(() => [])

        steps.push({
            array: [],
            buckets: JSON.parse(JSON.stringify(buckets)),
            message: `Building Hash Table (Chaining)`,
        })

        for (let i = 0; i < nums.length; i++) {
            const val = nums[i]
            const hash = Math.abs(val % 7)

            buckets[hash].push(val)
            steps.push({
                array: nums.slice(0, i + 1),
                buckets: JSON.parse(JSON.stringify(buckets)),
                currentHash: hash,
                message: `Insert key ${val} → Hash: ${val} % 7 = ${hash}`,
                key: val,
                operation: 'insert'
            })
        }
        return steps
    }
}

// Combine all generators
const allGenerators = {
    ...sortingGenerators,
    ...searchingGenerators,
    ...arraysGenerators,
    ...dpGenerators,
    ...backtrackingGenerators,
    ...stacksGenerators,
    ...queuesGenerators,
    ...linkedListsGenerators,
    ...treesGenerators,
    ...graphsGenerators,
    ...hashingGenerators,
    ...stringsGenerators,
    ...greedyGenerators,
    ...bitManipulationGenerators,
    ...advancedGenerators,
}

const generateRandomArray = (size = 10, max = 100) => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1)
}

const generateRandomGraph = (nodeCount = 6) => {
    // Cap node count for visualization clarity
    const count = Math.min(Math.max(nodeCount, 3), 10)
    const nodes = Array.from({ length: count }, (_, i) => i)
    const edges = []

    // Create random edges
    for (let i = 0; i < count; i++) {
        // Connect to 1-2 other nodes
        const numEdges = Math.floor(Math.random() * 2) + 1
        for (let k = 0; k < numEdges; k++) {
            const potentialTarget = Math.floor(Math.random() * count)
            if (potentialTarget !== i) {
                // Avoid duplicates (undirected)
                const exists = edges.some(([u, v]) =>
                    (u === i && v === potentialTarget) || (u === potentialTarget && v === i)
                )
                if (!exists) {
                    if (i < potentialTarget) edges.push([i, potentialTarget])
                    else edges.push([potentialTarget, i])
                }
            }
        }
    }
    // Ensure all nodes have at least one edge? Optional.
    return { nodes, edges }
}

const ColorLegend = () => (
    <div className="w-full mt-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider text-center">Visualization Legend</h3>
        <div className="flex flex-wrap gap-4 justify-center p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-b from-google-blue to-blue-600"></div>
                <span className="text-xs text-gray-300">Default / Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-b from-google-yellow to-yellow-600"></div>
                <span className="text-xs text-gray-300">Comparing / Current</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-b from-google-green to-green-600"></div>
                <span className="text-xs text-gray-300">Sorted / Found / Swapped</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-b from-google-red to-red-600"></div>
                <span className="text-xs text-gray-300">Deleting / Pivot / Mismatch</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-500"></div>
                <span className="text-xs text-gray-300">Pointer / Recursion / Aux</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-cyan-500"></div>
                <span className="text-xs text-gray-300">Window / Next / Enqueue</span>
            </div>
        </div>
    </div>
)

const ExamMode = ({ algorithm }) => {
    const practice = algorithm?.practice || algorithm?.code?.practice;
    if (!practice) return null;
    const { theory, coding, interview } = practice;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 border-t border-white/10 pt-8"
        >
            <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl bg-white/10 p-2 rounded-lg">🎓</span>
                <div>
                    <h2 className="text-2xl font-bold text-white">Exam & Interview Mode</h2>
                    <p className="text-gray-400 text-sm">Test your understanding with these curated questions.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-colors">
                    <h3 className="text-lg font-semibold text-google-blue mb-4 flex items-center gap-2">
                        <span>📚</span> Theory Questions
                    </h3>
                    <ul className="space-y-4">
                        {theory?.map((q, i) => (
                            <li key={i} className="flex gap-3 text-gray-300">
                                <span className="font-bold text-white/30 font-mono">0{i + 1}</span>
                                <span className="leading-relaxed">{q}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-colors">
                        <h3 className="text-lg font-semibold text-google-green mb-3 flex items-center gap-2">
                            <span>💻</span> Coding Challenge
                        </h3>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                            <p className="text-gray-300 italic font-mono text-sm leading-relaxed">"{coding}"</p>
                        </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-colors">
                        <h3 className="text-lg font-semibold text-google-yellow mb-3 flex items-center gap-2">
                            <span>💼</span> Interview Question
                        </h3>
                        <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                            <p className="text-gray-300 italic font-mono text-sm leading-relaxed">"{interview}"</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default function AlgorithmViewer() {
    const { category = 'sorting', algorithmId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { steps, currentStep, isPlaying, playbackSpeed } = useSelector(
        (state) => state.execution
    )

    // State for fetched algorithms
    const [algorithms, setAlgorithms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedAlgorithm, setSelectedAlgorithm] = useState(null)
    const [arraySize, setArraySize] = useState(10)
    const [selectedLanguage, setSelectedLanguage] = useState('javascript')

    useEffect(() => {
        const fetchAlgorithms = async () => {
            setLoading(true)
            setError(null)
            try {
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
                const response = await fetch(`${apiBase}/api/algorithms/${category}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch algorithms')
                }
                const data = await response.json()
                setAlgorithms(data)

                // Select the first algorithm or the one from URL
                if (data.length > 0) {
                    const algoToSelect = algorithmId
                        ? data.find(a => a.id === algorithmId) || data[0]
                        : data[0]
                    setSelectedAlgorithm(algoToSelect)
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchAlgorithms()
    }, [category, algorithmId])

    const currentStepData = steps[currentStep] || {}

    const generateNewArray = useCallback(() => {
        if (!selectedAlgorithm) return

        let newArray
        // Determine category from URL param (preferred) or algorithm object
        const algoCategory = category || selectedAlgorithm.category || 'sorting'

        if (algoCategory.includes('graph')) {
            newArray = generateRandomGraph(arraySize)
        } else if (algoCategory.includes('tree')) {
            const treeSize = Math.min(arraySize, 15)
            newArray = generateRandomArray(treeSize, 99)
        } else if (algoCategory.includes('hashing')) {
            newArray = generateRandomArray(arraySize, 999)
        } else {
            newArray = generateRandomArray(arraySize)
        }

        dispatch(setInputData(newArray))

        // Check if we have a step generator for this algorithm
        const generator = allGenerators[selectedAlgorithm.id]
        if (generator) {
            const newSteps = generator(newArray)
            dispatch(setSteps(newSteps))
        } else {
            dispatch(setSteps([{
                array: newArray,
                comparing: [],
                swapping: [],
                sorted: [],
                message: 'Visualization coming soon for this algorithm!',
                line: 0,
            }]))
        }
    }, [arraySize, selectedAlgorithm, dispatch, category])

    useEffect(() => {
        if (selectedAlgorithm) {
            generateNewArray()
        }
    }, [selectedAlgorithm])

    useEffect(() => {
        let interval
        if (isPlaying && currentStep < steps.length - 1) {
            interval = setInterval(() => {
                dispatch(nextStep())
            }, 1000 / playbackSpeed)
        } else if (currentStep >= steps.length - 1) {
            dispatch(pause())
        }
        return () => clearInterval(interval)
    }, [isPlaying, currentStep, steps.length, playbackSpeed, dispatch])

    const handleReset = () => {
        dispatch(setCurrentStep(0))
        dispatch(pause())
    }

    const handleAlgorithmSelect = (algo) => {
        setSelectedAlgorithm(algo)
        navigate(`/algorithms/${category}/${algo.id}`)
    }

    const maxBarHeight = 250
    const maxValue = Math.max(...(currentStepData.array || []), 1)

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-google-blue" />
                <span className="ml-3 text-lg">Loading algorithms...</span>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-red-400 text-lg mb-4">Error: {error}</p>
                <p className="text-gray-400">Make sure the server is running on port 3000</p>
                <Button
                    variant="blue"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </Button>
            </div>
        )
    }

    // No algorithms found
    if (algorithms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-gray-400 text-lg">No algorithms found for category: {category}</p>
            </div>
        )
    }

    const isSortingCategory = category === 'sorting'
    const hasVisualization = selectedAlgorithm && allGenerators[selectedAlgorithm.id]

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2 capitalize">
                    <BarChart3 className="inline mr-3 text-google-blue" />
                    {category.replace('-', ' ')} Algorithms
                </h1>
                {selectedAlgorithm && (
                    <>
                        <p className="text-gray-400">{selectedAlgorithm.description}</p>
                        <div className="flex gap-4 mt-3">
                            <span className="text-sm px-3 py-1 rounded-full bg-google-blue/20 text-google-blue">
                                Time: {selectedAlgorithm.complexity.time}
                            </span>
                            <span className="text-sm px-3 py-1 rounded-full bg-google-green/20 text-google-green">
                                Space: {selectedAlgorithm.complexity.space}
                            </span>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Algorithm Selector */}
            <motion.div
                className="flex flex-wrap gap-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {algorithms.map((algo) => (
                    <Button
                        key={algo.id}
                        variant={selectedAlgorithm?.id === algo.id ? 'blue' : 'glass'}
                        size="sm"
                        onClick={() => handleAlgorithmSelect(algo)}
                    >
                        {algo.name}
                    </Button>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Visualization Area */}
                <div className="lg:col-span-2">
                    <GlassPanel>
                        {hasVisualization ? (
                            <>
                                {/* Controls Bar */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <label className="text-sm text-gray-400">Size:</label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="20"
                                            value={arraySize}
                                            onChange={(e) => setArraySize(Number(e.target.value))}
                                            className="w-24"
                                        />
                                        <span className="text-sm">{arraySize}</span>
                                    </div>
                                    <Button
                                        variant="glass"
                                        size="sm"
                                        icon={Shuffle}
                                        onClick={generateNewArray}
                                    >
                                        New Array
                                    </Button>
                                </div>

                                {/* Dynamic Visualization based on category */}
                                <div className="flex items-center justify-center min-h-[256px] mb-6">
                                    <VisualizationRenderer
                                        type={getVisualizationType(category)}
                                        step={currentStepData}
                                        maxValue={maxValue}
                                    />
                                </div>

                                {/* Step Message */}
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center p-4 rounded-lg bg-white/5 border border-white/10 mb-6"
                                >
                                    <p className="text-white">{currentStepData.message || 'Ready to start'}</p>
                                </motion.div>

                                {/* Playback Controls */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    {/* Progress */}
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <span className="text-sm text-gray-400 whitespace-nowrap">
                                            Step {currentStep + 1} / {steps.length}
                                        </span>
                                        <div className="flex-1 md:w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-google-blue to-google-green"
                                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Control Buttons */}
                                    <div className="flex items-center gap-2">
                                        <IconButton icon={RotateCcw} onClick={handleReset} />
                                        <IconButton
                                            icon={SkipBack}
                                            onClick={() => dispatch(prevStep())}
                                        />
                                        <IconButton
                                            icon={isPlaying ? Pause : Play}
                                            variant="blue"
                                            size="lg"
                                            onClick={() => dispatch(togglePlay())}
                                        />
                                        <IconButton
                                            icon={SkipForward}
                                            onClick={() => dispatch(nextStep())}
                                        />
                                    </div>

                                    {/* Speed Control */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Speed:</span>
                                        <select
                                            value={playbackSpeed}
                                            onChange={(e) => dispatch(setPlaybackSpeed(Number(e.target.value)))}
                                            className="glass-input px-3 py-2 text-sm"
                                        >
                                            <option value={0.5}>0.5x</option>
                                            <option value={1}>1x</option>
                                            <option value={2}>2x</option>
                                            <option value={4}>4x</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64">
                                <BarChart3 className="w-16 h-16 text-gray-500 mb-4" />
                                <p className="text-gray-400 text-lg mb-2">
                                    Visualization coming soon!
                                </p>
                                <p className="text-gray-500 text-sm text-center">
                                    Step-by-step visualization for {selectedAlgorithm?.name} is under development.
                                    <br />View the code implementation on the right.
                                </p>
                            </div>
                        )}
                    </GlassPanel>
                </div>

                {/* Code Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <GlassPanel className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Code2 size={20} className="text-google-blue" />
                                Code
                            </h3>
                            <select
                                className="glass-input px-2 py-1 text-sm"
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                        </div>

                        <div className="font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                            {selectedAlgorithm?.code?.[selectedLanguage]?.split('\n').map((line, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        px-3 py-0.5 -mx-2 rounded transition-colors whitespace-pre
                                        ${hasVisualization && currentStepData.line === idx
                                            ? 'bg-google-blue/20 border-l-2 border-google-blue'
                                            : ''
                                        }
                                    `}
                                >
                                    <span className="text-gray-500 mr-3 select-none">{String(idx + 1).padStart(2)}</span>
                                    <span className="text-gray-300">{line}</span>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </motion.div>
            </div>

            {/* Legend & Exam Mode */}
            {/* Legend & Exam Mode */}
            {hasVisualization && <ColorLegend />}
            <ExamMode algorithm={selectedAlgorithm} />
        </div>
    )
}
