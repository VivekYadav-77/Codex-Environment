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
import { apiFetch } from '../../api/client'
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
import { phase10to13Generators } from './phase10to13Generators'


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

const GridVisualization = ({ step }) => {
    const grid = step.grid || []
    const activeCells = step.activeCells || []
    const successCells = step.successCells || []
    const highlightedCells = step.highlightedCells || []
    const blockedCells = step.blockedCells || []
    const pathCells = step.pathCells || []
    const rowHeaders = step.rowHeaders || []
    const colHeaders = step.colHeaders || []

    if (!grid.length) return <div className="text-gray-400">Empty Grid</div>

    const numRows = grid.length
    const numCols = grid[0].length

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Grid Container */}
            <div 
                className="grid gap-1.5 p-3 bg-white/5 rounded-xl border border-white/10 shadow-2xl overflow-auto max-w-full"
                style={{
                    gridTemplateColumns: `repeat(${numCols + (rowHeaders.length ? 1 : 0)}, minmax(40px, 1fr))`
                }}
            >
                {/* Header corner if headers are present */}
                {rowHeaders.length > 0 && (
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-gray-500 text-sm">
                        
                    </div>
                )}

                {/* Column Headers */}
                {colHeaders.length > 0 && colHeaders.map((col, idx) => (
                    <div 
                        key={`col-head-${idx}`} 
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-gray-400 text-xs md:text-sm"
                    >
                        {col}
                    </div>
                ))}

                {/* Grid Cells */}
                {grid.map((row, r) => (
                    <div key={`row-group-${r}`} className="contents">
                        {/* Row Header */}
                        {rowHeaders.length > 0 && (
                            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-bold text-gray-400 text-xs md:text-sm">
                                {rowHeaders[r]}
                            </div>
                        )}

                        {row.map((val, c) => {
                            const isCellMatch = (list) => list.some(([rowIdx, colIdx]) => rowIdx === r && colIdx === c)
                            
                            const isActive = isCellMatch(activeCells)
                            const isSuccess = isCellMatch(successCells)
                            const isHighlighted = isCellMatch(highlightedCells)
                            const isBlocked = isCellMatch(blockedCells)
                            const isPath = isCellMatch(pathCells)

                            let cellClass = "bg-white/5 border-white/10 text-white"
                            if (isBlocked) cellClass = "bg-gray-800/80 border-gray-700/50 text-gray-600 cursor-not-allowed"
                            else if (isActive) cellClass = "bg-gradient-to-br from-google-blue to-blue-600 border-google-blue text-white ring-2 ring-blue-400/50 font-bold animate-pulse"
                            else if (isSuccess) cellClass = "bg-gradient-to-br from-google-green to-green-600 border-google-green text-white font-bold"
                            else if (isPath) cellClass = "bg-gradient-to-br from-purple-500 to-purple-700 border-purple-500 text-white font-bold"
                            else if (isHighlighted) cellClass = "bg-gradient-to-br from-google-red to-red-600 border-google-red text-white font-bold"

                            return (
                                <motion.div
                                    key={`cell-${r}-${c}`}
                                    className={`
                                        w-10 h-10 md:w-12 md:h-12 
                                        rounded-lg border flex items-center justify-center 
                                        text-xs md:text-sm font-semibold transition-all duration-200
                                        ${cellClass} shadow-md
                                    `}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    {val === '.' || val === '#' || val === ' ' ? '' : val}
                                </motion.div>
                            )
                        })}
                    </div>
                ))}
            </div>
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

// Complexity Chart Visualization — interactive Big O curve comparison
const ComplexityVisualization = ({ step }) => {
    const [n, setN] = useState(step.n || 10)
    const width = 340
    const height = 220
    const pad = { l: 38, r: 12, t: 12, b: 36 }
    const innerW = width - pad.l - pad.r
    const innerH = height - pad.t - pad.b

    const curves = [
        { label: 'O(1)',        fn: () => 1,                   color: '#34A853', dash: '' },
        { label: 'O(log n)',    fn: x => Math.log2(x + 1),    color: '#4285F4', dash: '' },
        { label: 'O(n)',        fn: x => x,                    color: '#FBBC04', dash: '' },
        { label: 'O(n log n)', fn: x => x * Math.log2(x + 1), color: '#F97316', dash: '6,3' },
        { label: 'O(n²)',       fn: x => x * x,                color: '#EA4335', dash: '4,2' },
    ]

    const highlighted = step.highlighted || []
    const maxN = Math.max(n, 2)
    const yMax = Math.min(maxN * maxN, 400)

    const toSvgX = x => pad.l + (x / maxN) * innerW
    const toSvgY = y => pad.t + innerH - Math.min(y / yMax, 1) * innerH

    const buildPath = (fn) => {
        const pts = Array.from({ length: 60 }, (_, i) => {
            const x = (i / 59) * maxN
            return `${toSvgX(x).toFixed(1)},${toSvgY(fn(x)).toFixed(1)}`
        })
        return `M ${pts.join(' L ')}`
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
                <label className="text-xs text-gray-400">N =</label>
                <input
                    type="range" min={4} max={50} value={n}
                    onChange={e => setN(Number(e.target.value))}
                    className="w-32 accent-google-blue"
                />
                <span className="text-sm font-mono text-white w-6">{n}</span>
            </div>
            <svg width={width} height={height} className="overflow-visible">
                {/* Axes */}
                <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <text x={pad.l + innerW / 2} y={height - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">Input Size (n)</text>
                {/* Curves */}
                {curves.map(({ label, fn, color, dash }) => {
                    const isHl = highlighted.length === 0 || highlighted.includes(label)
                    return (
                        <g key={label} opacity={isHl ? 1 : 0.18}>
                            <path d={buildPath(fn)} fill="none" stroke={color} strokeWidth={isHl ? 2.5 : 1.5} strokeDasharray={dash} />
                            <text x={toSvgX(maxN) + 4} y={Math.max(pad.t + 4, Math.min(toSvgY(fn(maxN)) + 4, pad.t + innerH))} fill={color} fontSize="9" fontWeight="600">{label}</text>
                        </g>
                    )
                })}
                {/* Vertical marker at current n */}
                <line x1={toSvgX(n)} y1={pad.t} x2={toSvgX(n)} y2={pad.t + innerH} stroke="rgba(255,255,255,0.25)" strokeDasharray="4,3" strokeWidth="1" />
                {curves.map(({ fn, color }) => (
                    <circle key={color} cx={toSvgX(n)} cy={toSvgY(fn(n))} r={3} fill={color} />
                ))}
            </svg>
            {/* Legend table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs mt-1">
                {curves.map(({ label, fn, color }) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-gray-300">{label} ≈ {fn(n).toFixed(0)} ops</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Trie Visualization — shows prefix tree as layered nodes
const TrieVisualization = ({ step }) => {
    const words = step.words || ['cat', 'car', 'card', 'care', 'bat']
    const prefix = step.prefix || ''
    const highlight = step.highlight || []

    // Build trie structure
    const buildTrie = (ws) => {
        const root = { char: '', children: {}, end: false }
        for (const w of ws) {
            let node = root
            for (const c of w) {
                if (!node.children[c]) node.children[c] = { char: c, children: {}, end: false }
                node = node.children[c]
            }
            node.end = true
        }
        return root
    }

    const trie = buildTrie(words)

    // Flatten trie into renderable nodes breadth-first
    const flatNodes = []
    const bfsQueue = [{ node: trie, level: 0, x: 0.5, parentX: null, parentY: null, pathSoFar: '' }]
    const levelWidths = {}
    const levelCounts = {}

    const q = [...bfsQueue]
    while (q.length > 0) {
        const { node, level, x, parentX, parentY, pathSoFar } = q.shift()
        const y = 30 + level * 55
        const isHighlighted = highlight.includes(pathSoFar) || prefix.startsWith(pathSoFar) && pathSoFar.length <= prefix.length
        if (node.char !== '' || level === 0) {
            flatNodes.push({ char: node.char, x: x * 300, y, isHighlighted, parentX, parentY, end: node.end, path: pathSoFar })
        }
        const children = Object.values(node.children)
        children.forEach((child, i) => {
            const childX = children.length === 1 ? x : x - 0.15 * (children.length - 1) / 2 + i * 0.15
            q.push({ node: child, level: level + 1, x: Math.max(0.08, Math.min(0.92, childX)), parentX: x * 300, parentY: y, pathSoFar: pathSoFar + child.char })
        })
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={300} height={220} className="overflow-visible">
                {flatNodes.map((node, i) => (
                    <g key={i}>
                        {node.parentX !== null && (
                            <line x1={node.parentX} y1={node.parentY} x2={node.x} y2={node.y} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                        )}
                        <circle cx={node.x} cy={node.y} r={16} fill={node.isHighlighted ? '#4285F4' : 'rgba(255,255,255,0.08)'} stroke={node.end ? '#34A853' : 'rgba(255,255,255,0.2)'} strokeWidth={node.end ? 2 : 1} />
                        <text x={node.x} y={node.y + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="700">{node.char || '◎'}</text>
                    </g>
                ))}
            </svg>
            {prefix && <div className="text-xs text-gray-400">Searching prefix: <span className="text-google-blue font-mono font-bold">{prefix}</span></div>}
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
        'dp': 'array',
        'greedy': 'array',
        'bit-manipulation': 'array',
        'advanced': 'array',
        'advanced-structures': 'array',
        'patterns': 'array',
        'interview-prep': 'array',
        'complexity': 'complexity',
        'tries': 'trie',
        'design': 'array',
        'backtracking': 'array',
        'divide-and-conquer': 'array',
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
        case 'complexity':
            return <ComplexityVisualization step={step} />
        case 'trie':
            return <TrieVisualization step={step} />
        case 'grid':
            return <GridVisualization step={step} />
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
        return steps
    }
}

// Complexity generators
const complexityGenerators = {
    'big-o-notation': () => [
        { n: 4, highlighted: [], message: 'Adjust N with the slider to compare how each complexity class grows.', line: 0 },
        { n: 8, highlighted: ['O(1)', 'O(log n)'], message: 'O(1) and O(log n) stay nearly flat as n grows.', line: 1 },
        { n: 16, highlighted: ['O(n)', 'O(n log n)'], message: 'O(n) and O(n log n) grow moderately with n.', line: 2 },
        { n: 20, highlighted: ['O(n²)'], message: 'O(n²) explodes quickly — nested loops are expensive!', line: 3 },
        { n: 20, highlighted: [], message: 'Choosing the right algorithm is the most impactful optimization.', line: 4 },
    ],
    'time-complexity': () => [
        { n: 5, highlighted: ['O(1)'], message: 'O(1) — Constant time: array index access, hash lookup. Input size does not matter.', line: 0 },
        { n: 10, highlighted: ['O(log n)'], message: 'O(log n) — Logarithmic: binary search halves the search space each step.', line: 1 },
        { n: 15, highlighted: ['O(n)'], message: 'O(n) — Linear: scanning every element once (single loop).', line: 2 },
        { n: 15, highlighted: ['O(n log n)'], message: 'O(n log n) — Merge sort, heap sort — the practical sorting sweet spot.', line: 3 },
        { n: 15, highlighted: ['O(n²)'], message: 'O(n²) — Quadratic: bubble sort, selection sort — two nested loops.', line: 4 },
    ],
    'space-complexity': () => [
        { n: 6, highlighted: ['O(1)'], message: 'O(1) space: in-place algorithms use no extra memory proportional to n.', line: 0 },
        { n: 12, highlighted: ['O(log n)'], message: 'O(log n) space: recursive binary search uses log n stack frames.', line: 1 },
        { n: 18, highlighted: ['O(n)'], message: 'O(n) space: storing a copy of the array or a call stack of depth n.', line: 2 },
        { n: 18, highlighted: ['O(n²)'], message: 'O(n²) space: 2D DP tables — be careful on memory-constrained systems.', line: 3 },
    ],
    'master-theorem': () => [
        { n: 8, highlighted: ['O(n)'], message: 'Case 1: f(n) grows slower than n^log_b(a). Result: T(n) = Θ(n^log_b(a)). Example: T(n)=2T(n/2)+1 → O(n).', line: 0 },
        { n: 16, highlighted: ['O(n log n)'], message: 'Case 2: f(n) = n^log_b(a). Result: T(n) = Θ(n^log_b(a) · log n). Merge Sort: T(n)=2T(n/2)+n → O(n log n).', line: 1 },
        { n: 20, highlighted: ['O(n²)'], message: 'Case 3: f(n) grows faster than n^log_b(a). Result: T(n) = Θ(f(n)). T(n)=T(n/2)+n² → O(n²).', line: 2 },
    ],
    'amortized-analysis': () => [
        { array: [1], comparing: [], swapping: [], sorted: [], message: 'Dynamic array starts with capacity 1. First insertion is free.', line: 0 },
        { array: [1, 2], comparing: [1], swapping: [], sorted: [], message: 'Push 2: capacity doubles to 2. Paid cost = 2 (copy 1 + insert). Amortized = O(1).', line: 1 },
        { array: [1, 2, 3, 4], comparing: [2, 3], swapping: [], sorted: [], message: 'Push 3: double to 4. Total cost spread across 3 ops ≈ O(1) amortized each.', line: 2 },
        { array: [1, 2, 3, 4, 5], comparing: [4], swapping: [], sorted: [0, 1, 2, 3], message: 'Push 5: double to 8. Amortized analysis proves O(1) per push on average.', line: 3 },
    ],
}

// Trie generators
const trieGenerators = {
    'trie-prefix-search': () => [
        { words: ['cat', 'car', 'card', 'care', 'bat'], prefix: '', highlight: [], message: 'Trie built from 5 words. Root node connects to all first characters.', line: 0 },
        { words: ['cat', 'car', 'card', 'care', 'bat'], prefix: 'c', highlight: ['c'], message: "Search prefix 'c': follow root → 'c' node. All 'cat','car','card','care' are candidates.", line: 1 },
        { words: ['cat', 'car', 'card', 'care', 'bat'], prefix: 'ca', highlight: ['ca'], message: "Search prefix 'ca': follow 'c' → 'a' node. Still 4 candidates.", line: 2 },
        { words: ['cat', 'car', 'card', 'care', 'bat'], prefix: 'car', highlight: ['car', 'card', 'care'], message: "Prefix 'car': matches car, card, care — found in O(L) time. Green = word endpoint.", line: 3 },
        { words: ['cat', 'car', 'card', 'care', 'bat'], prefix: 'bat', highlight: ['bat'], message: "Prefix 'bat': single match. This is why tries beat hashmaps for prefix queries.", line: 4 },
    ],
    'trie-autocomplete': () => [
        { words: ['apple', 'app', 'apply', 'apt', 'apex'], prefix: 'ap', highlight: ['ap'], message: "Autocomplete query: 'ap'. Traverse root → 'a' → 'p'.", line: 0 },
        { words: ['apple', 'app', 'apply', 'apt', 'apex'], prefix: 'ap', highlight: ['app', 'apple', 'apply', 'apt', 'apex'], message: "DFS from 'ap' node collects all completions: app, apple, apply, apt, apex.", line: 1 },
        { words: ['apple', 'app', 'apply', 'apt', 'apex'], prefix: 'appl', highlight: ['appl', 'apple', 'apply'], message: "Narrowed to 'appl': completions are apple, apply.", line: 2 },
    ],
}

// Combine all step generators

// Step generators for Phase 2-4 topics (sorting, searching, arrays, strings, stacks, queues, linked lists, trees, tries)
const newGenerators = {
    'counting-sort': (arr) => {
        const steps = []
        const array = [...arr]
        const max = Math.max(...array)
        const count = new Array(max + 1).fill(0)
        for (const x of array) count[x]++
        steps.push({ array: [...count.slice(0, 8)], comparing: [array[0]], swapping: [], sorted: [], message: `Counting Sort: count array of size ${Math.min(max + 1, 8)} built`, line: 1 })
        for (let i = 1; i <= max; i++) {
            count[i] += count[i - 1]
            if (i < 8) steps.push({ array: [...count.slice(0, 8)], comparing: [i], swapping: [], sorted: [], message: `Prefix sum: count[${i}] = ${count[i]}`, line: 2 })
        }
        const output = new Array(array.length)
        for (let i = array.length - 1; i >= 0; i--) {
            output[--count[array[i]]] = array[i]
            steps.push({ array: [...output.map(v => v || 0)], comparing: [i], swapping: [], sorted: [], message: `Placing ${array[i]} at position ${count[array[i]]}`, line: 3 })
        }
        steps.push({ array: [...output], comparing: [], swapping: [], sorted: output.map((_, i) => i), message: 'Counting Sort complete! O(n+k)', line: 4 })
        return steps
    },
    'radix-sort': (arr) => {
        const steps = []
        const array = [...arr]
        const max = Math.max(...array)
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Radix Sort: processing digit by digit. Max = ${max}`, line: 1 })
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            const digitName = exp === 1 ? 'units' : exp === 10 ? 'tens' : 'hundreds'
            const count = new Array(10).fill(0)
            for (const x of array) count[Math.floor(x / exp) % 10]++
            for (let i = 1; i < 10; i++) count[i] += count[i - 1]
            const output = new Array(array.length)
            for (let i = array.length - 1; i >= 0; i--) {
                const d = Math.floor(array[i] / exp) % 10
                output[--count[d]] = array[i]
            }
            for (let i = 0; i < array.length; i++) array[i] = output[i]
            steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `After sorting by ${digitName} digit: [${array.join(', ')}]`, line: 2 })
        }
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: array.map((_, i) => i), message: 'Radix Sort complete! O(d*(n+k))', line: 3 })
        return steps
    },
    'bucket-sort': (arr) => {
        const steps = []
        const array = [...arr]
        const n = array.length
        const min = Math.min(...array), max = Math.max(...array)
        const buckets = Array.from({ length: n }, () => [])
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Bucket Sort: distributing ${n} elements into ${n} buckets. Range: [${min}, ${max}]`, line: 1 })
        for (const x of array) {
            const idx = Math.min(Math.floor((x - min) / (max - min + 1) * n), n - 1)
            buckets[idx].push(x)
        }
        const flatBuckets = buckets.flat()
        steps.push({ array: flatBuckets, comparing: [], swapping: [], sorted: [], message: `After distribution. Non-empty buckets: ${buckets.filter(b => b.length).length}`, line: 2 })
        for (let i = 0; i < n; i++) buckets[i].sort((a, b) => a - b)
        const sorted = buckets.flat()
        steps.push({ array: sorted, comparing: [], swapping: [], sorted: sorted.map((_, i) => i), message: 'Bucket Sort complete! Buckets sorted and concatenated.', line: 3 })
        return steps
    },
    'tim-sort': (arr) => {
        const steps = []
        const array = [...arr]
        const MIN_RUN = 2
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: 'Tim Sort: divide into runs, sort with insertion sort, merge runs', line: 1 })
        for (let i = 0; i < array.length; i += MIN_RUN) {
            const end = Math.min(i + MIN_RUN - 1, array.length - 1)
            for (let j = i + 1; j <= end; j++) {
                const key = array[j]; let k = j - 1
                while (k >= i && array[k] > key) { array[k + 1] = array[k]; k-- }
                array[k + 1] = key
            }
            steps.push({ array: [...array], comparing: [i, end], swapping: [], sorted: [], message: `Run [${i}-${end}] insertion-sorted: [${array.slice(i, end + 1).join(', ')}]`, line: 2 })
        }
        const finalSorted = [...array].sort((a, b) => a - b)
        steps.push({ array: finalSorted, comparing: [], swapping: [], sorted: finalSorted.map((_, i) => i), message: 'Tim Sort complete! O(n log n) worst, O(n) best for sorted data.', line: 4 })
        return steps
    },
    'lower-bound': (arr) => {
        const steps = []
        const array = [...arr].sort((a, b) => a - b)
        const target = array[Math.floor(array.length / 2)]
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Lower Bound: find first index where value >= ${target}. Array must be sorted.`, line: 1 })
        let lo = 0, hi = array.length
        while (lo < hi) {
            const mid = (lo + hi) >> 1
            if (array[mid] < target) {
                steps.push({ array: [...array], comparing: [mid], swapping: [], sorted: array.slice(0, lo).map((_, i) => i), message: `arr[${mid}]=${array[mid]} < ${target} → lo = ${mid + 1}`, line: 2 })
                lo = mid + 1
            } else {
                steps.push({ array: [...array], comparing: [mid], swapping: [], sorted: [], message: `arr[${mid}]=${array[mid]} >= ${target} → hi = ${mid}`, line: 3 })
                hi = mid
            }
        }
        steps.push({ array: [...array], comparing: [lo], swapping: [], sorted: [lo], message: `Lower bound = index ${lo}. arr[${lo}] = ${array[lo] ?? 'end'}`, line: 4 })
        return steps
    },
    'upper-bound': (arr) => {
        const steps = []
        const array = [...arr].sort((a, b) => a - b)
        const target = array[Math.floor(array.length / 2)]
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Upper Bound: find first index where value > ${target}`, line: 1 })
        let lo = 0, hi = array.length
        while (lo < hi) {
            const mid = (lo + hi) >> 1
            if (array[mid] <= target) {
                steps.push({ array: [...array], comparing: [mid], swapping: [], sorted: [], message: `arr[${mid}]=${array[mid]} <= ${target} → lo = ${mid + 1}`, line: 2 })
                lo = mid + 1
            } else {
                steps.push({ array: [...array], comparing: [mid], swapping: [], sorted: [], message: `arr[${mid}]=${array[mid]} > ${target} → hi = ${mid}`, line: 3 })
                hi = mid
            }
        }
        steps.push({ array: [...array], comparing: [lo], swapping: [], sorted: [lo], message: `Upper bound = index ${lo}. Count of ${target}: ${lo - array.filter(x => x < target).length}`, line: 4 })
        return steps
    },
    'binary-search-on-answer': (arr) => {
        const steps = []
        const piles = arr.slice(0, 5).map(x => (x % 10) + 1)
        const h = piles.length * 3
        steps.push({ array: [...piles], comparing: [], swapping: [], sorted: [], message: `Binary Search on Answer: Koko eating bananas. Piles: [${piles}]. Hours: ${h}`, line: 1 })
        let lo = 1, hi = Math.max(...piles)
        while (lo < hi) {
            const mid = (lo + hi) >> 1
            const hours = piles.reduce((s, p) => s + Math.ceil(p / mid), 0)
            steps.push({ array: [...piles], comparing: [Math.floor(mid / 2)], swapping: [], sorted: [], message: `Speed ${mid}: needs ${hours} hrs (limit ${h}). ${hours <= h ? 'Feasible → try smaller' : 'Too slow → faster'}`, line: 2 })
            if (hours <= h) hi = mid
            else lo = mid + 1
        }
        steps.push({ array: [...piles], comparing: [], swapping: [], sorted: piles.map((_, i) => i), message: `Minimum eating speed = ${lo} bananas/hour`, line: 3 })
        return steps
    },
    'ternary-search': (arr) => {
        const steps = []
        const mountain = arr.slice(0, 8).map((_, i) => Math.max(0, 50 - Math.abs(i - 4) * 12))
        steps.push({ array: [...mountain], comparing: [], swapping: [], sorted: [], message: `Ternary Search on unimodal array: [${mountain}]. Finding peak.`, line: 1 })
        let lo = 0, hi = mountain.length - 1
        while (hi - lo > 2) {
            const m1 = lo + Math.floor((hi - lo) / 3)
            const m2 = hi - Math.floor((hi - lo) / 3)
            steps.push({ array: [...mountain], comparing: [m1, m2], swapping: [], sorted: [], message: `m1=${m1}(v=${mountain[m1]}), m2=${m2}(v=${mountain[m2]}). ${mountain[m1] < mountain[m2] ? 'Elim left third' : 'Elim right third'}`, line: 2 })
            if (mountain[m1] < mountain[m2]) lo = m1 + 1
            else hi = m2 - 1
        }
        const peak = lo + mountain.slice(lo, hi + 1).indexOf(Math.max(...mountain.slice(lo, hi + 1)))
        steps.push({ array: [...mountain], comparing: [peak], swapping: [], sorted: [peak], message: `Peak at index ${peak}, value ${mountain[peak]}!`, line: 3 })
        return steps
    },
    'string-basics': () => {
        const steps = []
        const s = 'hello'
        steps.push({ array: s.split('').map((_, i) => i), comparing: [], swapping: [], sorted: [], message: `String Basics: '${s}'. Immutable sequence of characters.`, line: 1 })
        for (let i = 0; i < s.length; i++) {
            steps.push({ array: s.split('').map((_, j) => j), comparing: [i], swapping: [], sorted: [], message: `s[${i}] = '${s[i]}' (ASCII: ${s.charCodeAt(i)}). O(1) access.`, line: 2 })
        }
        steps.push({ array: s.split('').map((_, i) => i), comparing: [], swapping: [], sorted: s.split('').map((_, i) => i), message: `Strings immutable in JS/Python/Java. Use char array for O(1) mutation.`, line: 3 })
        return steps
    },
    'character-encoding': () => {
        const steps = []
        const chars = ['A', 'z', '0', 'a', '!']
        steps.push({ array: chars.map((_, i) => i), comparing: [], swapping: [], sorted: [], message: `Character Encoding: ASCII maps chars to 0-127. Unicode extends to 1M+.`, line: 1 })
        for (const ch of chars) {
            const code = ch.charCodeAt(0)
            const type = ch >= 'A' && ch <= 'Z' ? 'uppercase' : ch >= 'a' && ch <= 'z' ? 'lowercase' : ch >= '0' && ch <= '9' ? 'digit' : 'other'
            steps.push({ array: chars.map((_, i) => i), comparing: [chars.indexOf(ch)], swapping: [], sorted: [], message: `'${ch}' → ASCII ${code} (${type}). 'a'-'z'=97-122, 'A'-'Z'=65-90, '0'-'9'=48-57`, line: 2 })
        }
        const freq = new Array(5).fill(0)
        'abcaab'.split('').forEach(c => { if (c.charCodeAt(0) - 97 < 5) freq[c.charCodeAt(0) - 97]++ })
        steps.push({ array: freq, comparing: [0, 1, 2], swapping: [], sorted: [], message: `Freq array: freq[c-'a']++. 'abcaab' → a:3, b:2, c:1. O(1) space!`, line: 3 })
        return steps
    },
    'string-matching': () => {
        const steps = []
        const text = 'AABAACAADAAB'.split('')
        const pattern = 'AABA'.split('')
        const n = text.length, m = pattern.length
        const matches = []
        steps.push({ array: text.map((_, i) => i), comparing: [], swapping: [], sorted: [], message: `String Matching (Naive): find '${pattern.join('')}' in '${text.join('')}'. O(nm).`, line: 1 })
        for (let i = 0; i <= n - m; i++) {
            let j = 0
            while (j < m && text[i + j] === pattern[j]) j++
            if (j === m) {
                matches.push(i)
                steps.push({ array: text.map((_, k) => k), comparing: Array.from({ length: m }, (_, k) => i + k), swapping: [], sorted: matches.flatMap(s => Array.from({ length: m }, (_, k) => s + k)), message: `MATCH at index ${i}!`, line: 2 })
            } else {
                steps.push({ array: text.map((_, k) => k), comparing: [i, i + j], swapping: [], sorted: [], message: `No match at ${i}: mismatch at [${i + j}]`, line: 3 })
            }
        }
        steps.push({ array: text.map((_, i) => i), comparing: [], swapping: [], sorted: matches.flatMap(s => Array.from({ length: m }, (_, k) => s + k)), message: `Found ${matches.length} match(es) at [${matches}]. KMP is O(n+m).`, line: 4 })
        return steps
    },
    'palindrome-check': () => {
        const steps = []
        const s = 'racecar'
        steps.push({ array: s.split('').map((_, i) => i), comparing: [], swapping: [], sorted: [], message: `Palindrome Check: '${s}'. Two pointers from both ends.`, line: 1 })
        let l = 0, r = s.length - 1, isPalin = true
        while (l < r) {
            steps.push({ array: s.split('').map((_, i) => i), comparing: [l, r], swapping: [], sorted: [], message: `s[${l}]='${s[l]}' vs s[${r}]='${s[r]}': ${s[l] === s[r] ? 'match → move inward' : 'MISMATCH!'}`, line: 2 })
            if (s[l] !== s[r]) { isPalin = false; break }
            l++; r--
        }
        steps.push({ array: s.split('').map((_, i) => i), comparing: [], swapping: [], sorted: isPalin ? s.split('').map((_, i) => i) : [], message: `'${s}' is ${isPalin ? '✓ a palindrome' : '✗ NOT a palindrome'}! O(n) time, O(1) space.`, line: 3 })
        return steps
    },
    'frequency-count': (arr) => {
        const steps = []
        const array = arr.slice(0, 8)
        const freq = {}
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Frequency Count: [${array}]. Count occurrences with hashmap.`, line: 1 })
        for (let i = 0; i < array.length; i++) {
            freq[array[i]] = (freq[array[i]] || 0) + 1
            steps.push({ array: [...array], comparing: [i], swapping: [], sorted: [], message: `freq[${array[i]}] = ${freq[array[i]]}. Map: {${Object.entries(freq).map(([k, v]) => `${k}:${v}`).join(', ')}}`, line: 2 })
        }
        const maxFreq = Math.max(...Object.values(freq))
        const mode = Object.keys(freq).find(k => freq[k] === maxFreq)
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: array.map((x, i) => +x === +mode ? i : -1).filter(i => i >= 0), message: `Mode = ${mode} (×${maxFreq}). O(n) build, O(1) lookup!`, line: 3 })
        return steps
    },
    'rolling-hash': () => {
        const steps = []
        const s = 'abcdeabc'
        const patLen = 3
        const BASE = 31, MOD = 1e9 + 7
        steps.push({ array: s.split('').map((_, i) => i), comparing: [], swapping: [], sorted: [], message: `Rolling Hash: O(1) per window slide for window size ${patLen}.`, line: 1 })
        let hash = 0, power = 1
        for (let i = 0; i < patLen; i++) {
            hash = (hash + (s.charCodeAt(i) - 96) * power) % MOD
            if (i < patLen - 1) power = power * BASE % MOD
        }
        steps.push({ array: s.split('').map((_, i) => i), comparing: Array.from({ length: patLen }, (_, i) => i), swapping: [], sorted: [], message: `Window '${s.slice(0, patLen)}': hash=${hash.toFixed(0)}. O(m) setup.`, line: 2 })
        for (let i = patLen; i < s.length; i++) {
            hash = (hash - (s.charCodeAt(i - patLen) - 96) + MOD) % MOD
            hash = hash * BASE % MOD
            hash = (hash + (s.charCodeAt(i) - 96)) % MOD
            steps.push({ array: s.split('').map((_, j) => j), comparing: Array.from({ length: patLen }, (_, k) => i - patLen + 1 + k), swapping: [], sorted: [], message: `Slide to '${s.slice(i - patLen + 1, i + 1)}': remove '${s[i - patLen]}', add '${s[i]}'. Hash=${hash.toFixed(0)}. O(1)!`, line: 3 })
        }
        steps.push({ array: s.split('').map((_, i) => i), comparing: [], swapping: [], sorted: s.split('').map((_, i) => i), message: `Rolling hash: all ${s.length - patLen + 1} windows computed in O(n) total!`, line: 4 })
        return steps
    },
    'expression-evaluation': () => {
        const steps = []
        const tokens = ['3', '+', '4', '*', '2']
        const nums = [], ops = []
        const prec = { '+': 1, '-': 1, '*': 2, '/': 2 }
        steps.push({ array: [...nums], comparing: [], swapping: [], sorted: [], message: `Expression Evaluation: '3 + 4 * 2'. Two stacks: nums and ops.`, line: 1 })
        for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            if (/\d/.test(t)) {
                nums.push(+t)
                steps.push({ array: [...nums], comparing: [nums.length - 1], swapping: [], sorted: [], message: `Token '${t}' is number → push to nums: [${nums}]`, line: 2 })
            } else {
                while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) {
                    const b = nums.pop(), a = nums.pop(), op = ops.pop()
                    const res = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : Math.trunc(a / b)
                    nums.push(res)
                    steps.push({ array: [...nums], comparing: [], swapping: [nums.length - 1], sorted: [], message: `Higher prec: ${a} ${op} ${b} = ${res}`, line: 3 })
                }
                ops.push(t)
                steps.push({ array: [...nums], comparing: [], swapping: [], sorted: [], message: `Push op '${t}'. ops:[${ops}] nums:[${nums}]`, line: 4 })
            }
        }
        while (ops.length) {
            const b = nums.pop(), a = nums.pop(), op = ops.pop()
            const res = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : Math.trunc(a / b)
            nums.push(res)
        }
        steps.push({ array: [...nums], comparing: [], swapping: [], sorted: [0], message: `Result = ${nums[0]}. Correct! (3 + 4*2 = 11)`, line: 5 })
        return steps
    },
    'parentheses-matching': () => {
        const steps = []
        const expr = '({[]})'.split('')
        const stack = [], map = { ')': '(', ']': '[', '}': '{' }
        steps.push({ array: expr.map((_, i) => i), comparing: [], swapping: [], sorted: [], message: `Parentheses Matching: '${expr.join('')}'. Stack to validate brackets.`, line: 1 })
        let valid = true
        for (let i = 0; i < expr.length; i++) {
            const ch = expr[i]
            if ('([{'.includes(ch)) {
                stack.push(ch)
                steps.push({ array: stack.map((_, j) => j), comparing: [i], swapping: [], sorted: [], message: `'${ch}' opening → push. Stack: [${stack.join('')}]`, line: 2 })
            } else {
                const top = stack.pop()
                if (top !== map[ch]) {
                    valid = false
                    steps.push({ array: stack.map((_, j) => j), comparing: [], swapping: [i], sorted: [], message: `'${ch}' expected '${map[ch]}' got '${top}' → INVALID!`, line: 3 })
                    break
                }
                steps.push({ array: stack.map((_, j) => j), comparing: [i], swapping: [], sorted: [], message: `'${ch}' matches '${top}' → pop. Stack: [${stack.join('')}]`, line: 4 })
            }
        }
        steps.push({ array: stack.map((_, j) => j), comparing: [], swapping: [], sorted: valid ? [0] : [], message: valid && stack.length === 0 ? 'VALID! All brackets matched.' : 'INVALID!', line: 5 })
        return steps
    },
    'next-greater-element': (arr) => {
        const steps = []
        const array = arr.slice(0, 7)
        const result = new Array(array.length).fill(-1)
        const stack = []
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Next Greater Element: [${array}]. Monotonic decreasing stack.`, line: 1 })
        for (let i = 0; i < array.length; i++) {
            while (stack.length && array[stack[stack.length - 1]] < array[i]) {
                const popped = stack.pop()
                result[popped] = array[i]
                steps.push({ array: [...array], comparing: [i, popped], swapping: [], sorted: [popped], message: `NGE of arr[${popped}]=${array[popped]} is ${array[i]}`, line: 2 })
            }
            stack.push(i)
            steps.push({ array: [...array], comparing: [i], swapping: [], sorted: [], message: `Push idx ${i} (${array[i]}). Stack vals: [${stack.map(s => array[s]).join(', ')}]`, line: 3 })
        }
        steps.push({ array: [...result], comparing: [], swapping: [], sorted: result.map((_, i) => i), message: `NGE result: [${result}]. O(n) — each element enters/leaves stack once!`, line: 4 })
        return steps
    },
    'histogram-problems': (arr) => {
        const steps = []
        const heights = arr.slice(0, 7).map(x => (x % 6) + 1)
        const stack = []
        let maxArea = 0
        const n = heights.length
        steps.push({ array: [...heights], comparing: [], swapping: [], sorted: [], message: `Largest Rectangle in Histogram: heights = [${heights}]`, line: 1 })
        const extended = [...heights, 0]
        for (let i = 0; i <= n; i++) {
            while (stack.length && heights[stack[stack.length - 1]] > extended[i]) {
                const h = heights[stack.pop()]
                const w = stack.length ? i - stack[stack.length - 1] - 1 : i
                const area = h * w
                if (area > maxArea) maxArea = area
                steps.push({ array: [...heights], comparing: [i], swapping: [], sorted: [stack.length ? stack[stack.length - 1] + 1 : 0], message: `Pop h=${h}, w=${w}, area=${area}. Max: ${maxArea}`, line: 2 })
            }
            if (i < n) {
                stack.push(i)
                steps.push({ array: [...heights], comparing: [i], swapping: [], sorted: [], message: `Push idx ${i} (h=${heights[i]}).`, line: 3 })
            }
        }
        steps.push({ array: [...heights], comparing: [], swapping: [], sorted: heights.map((_, i) => i), message: `Max rectangle area = ${maxArea}. O(n) monotonic stack!`, line: 4 })
        return steps
    },
    'deque': (arr) => {
        const steps = []
        const dq = []
        const elements = arr.slice(0, 5)
        steps.push({ array: [...dq], comparing: [], swapping: [], sorted: [], message: `Deque: O(1) push/pop at both front and rear.`, line: 1 })
        dq.push(elements[0])
        steps.push({ array: [...dq], comparing: [dq.length - 1], swapping: [], sorted: [], message: `pushRear(${elements[0]}): [${dq}]`, line: 2 })
        dq.unshift(elements[1])
        steps.push({ array: [...dq], comparing: [0], swapping: [], sorted: [], message: `pushFront(${elements[1]}): [${dq}]`, line: 2 })
        dq.push(elements[2])
        steps.push({ array: [...dq], comparing: [dq.length - 1], swapping: [], sorted: [], message: `pushRear(${elements[2]}): [${dq}]`, line: 2 })
        const front = dq.shift()
        steps.push({ array: [...dq], comparing: [], swapping: [], sorted: [], message: `popFront()=${front}: [${dq}]`, line: 3 })
        const rear = dq.pop()
        steps.push({ array: [...dq], comparing: [], swapping: [], sorted: dq.map((_, i) => i), message: `popRear()=${rear}: [${dq}]. Used in: sliding window, BFS.`, line: 4 })
        return steps
    },
    'priority-queue': (arr) => {
        const steps = []
        const heap = []
        const elements = arr.slice(0, 6)
        const siftUp = (h, i) => { while (i > 0) { const p = Math.floor((i - 1) / 2); if (h[p] <= h[i]) break; [h[p], h[i]] = [h[i], h[p]]; i = p } }
        steps.push({ array: [...heap], comparing: [], swapping: [], sorted: [], message: `Priority Queue (Min-Heap): smallest element always at top.`, line: 1 })
        for (const val of elements) {
            heap.push(val); siftUp(heap, heap.length - 1)
            steps.push({ array: [...heap], comparing: [0], swapping: [], sorted: [], message: `Insert ${val} → heap: [${heap}]. Min=${heap[0]}`, line: 2 })
        }
        for (let i = 0; i < 3 && heap.length > 1; i++) {
            const min = heap[0]; heap[0] = heap.pop()
            let idx = 0
            while (true) {
                let s = idx, l = 2 * idx + 1, r = 2 * idx + 2
                if (l < heap.length && heap[l] < heap[s]) s = l
                if (r < heap.length && heap[r] < heap[s]) s = r
                if (s === idx) break; [heap[s], heap[idx]] = [heap[idx], heap[s]]; idx = s
            }
            steps.push({ array: [...heap], comparing: [], swapping: [0], sorted: [], message: `extractMin()=${min}. Heap: [${heap}]. New min=${heap[0]}`, line: 3 })
        }
        steps.push({ array: [...heap], comparing: [], swapping: [], sorted: [0], message: `PQ: O(log n) insert/extract, O(1) peek. Powers Dijkstra, Huffman, Top-K.`, line: 4 })
        return steps
    },
    'monotonic-queue': (arr) => {
        const steps = []
        const nums = arr.slice(0, 8)
        const k = 3
        const deque = [], result = []
        steps.push({ array: [...nums], comparing: [], swapping: [], sorted: [], message: `Sliding Window Max: nums=[${nums}], k=${k}. Monotonic decreasing deque.`, line: 1 })
        for (let i = 0; i < nums.length; i++) {
            if (deque.length && deque[0] < i - k + 1) {
                deque.shift()
                steps.push({ array: [...nums], comparing: [i], swapping: [], sorted: [], message: `Remove out-of-window index from front`, line: 2 })
            }
            while (deque.length && nums[deque[deque.length - 1]] < nums[i]) {
                const popped = deque.pop()
                steps.push({ array: [...nums], comparing: [i, popped], swapping: [], sorted: [], message: `nums[${popped}]=${nums[popped]} < nums[${i}]=${nums[i]} → pop rear`, line: 3 })
            }
            deque.push(i)
            if (i >= k - 1) {
                result.push(nums[deque[0]])
                steps.push({ array: [...nums], comparing: deque.slice(), swapping: [], sorted: [deque[0]], message: `Window max=${nums[deque[0]]}. Result: [${result}]`, line: 4 })
            }
        }
        steps.push({ array: result, comparing: [], swapping: [], sorted: result.map((_, i) => i), message: `Window maxima: [${result}]. O(n) total!`, line: 5 })
        return steps
    },
    'static-array': (arr) => {
        const steps = []
        const array = arr.slice(0, 6)
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Static Array: ${array.length} elements allocated in contiguous memory. Indices 0 to ${array.length - 1}.`, line: 1 })
        for (let i = 0; i < array.length; i++) {
            steps.push({ array: [...array], comparing: [i], swapping: [], sorted: [], message: `Access arr[${i}] = ${array[i]}. Address = base + ${i} × element_size. O(1) time.`, line: 2 })
        }
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: array.map((_, i) => i), message: `Static array: O(1) access, O(n) insert/delete. Fixed size — cannot grow!`, line: 3 })
        return steps
    },
    'memory-layout': (arr) => {
        const steps = []
        const array = arr.slice(0, 5)
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Memory Layout: array of ${array.length} integers stored contiguously in RAM.`, line: 1 })
        let addr = 0x100
        for (let i = 0; i < array.length; i++) {
            steps.push({ array: [...array], comparing: [i], swapping: [], sorted: [], message: `arr[${i}] = ${array[i]} at address 0x${(addr + i * 4).toString(16).toUpperCase()} (base 0x100, offset ${i * 4} bytes)`, line: 2 })
        }
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: array.map((_, i) => i), message: 'Cache-friendly! Sequential access uses hardware prefetching. Linked lists scatter across RAM — much slower!', line: 3 })
        return steps
    },
    'array-operations': (arr) => {
        const steps = []
        let array = arr.slice(0, 5)
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Array operations: [${array.join(', ')}]. Demonstrating insert, delete, search.`, line: 1 })
        const toInsert = 99
        for (let i = array.length; i > 2; i--) steps.push({ array: [...array, 0].map((v, j) => j > 2 ? array[j - 1] : v === 0 ? 0 : array[j]), comparing: [i - 1, i], swapping: [i - 1, i], sorted: [], message: `Insert ${toInsert} at index 2: shift element at [${i - 1}] right to [${i}]`, line: 2 })
        array = [...array.slice(0, 2), toInsert, ...array.slice(2)]
        steps.push({ array: [...array], comparing: [2], swapping: [], sorted: [], message: `Inserted ${toInsert} at index 2. O(n) due to shifting!`, line: 3 })
        const shifted = [...array.slice(1)]
        steps.push({ array: [...shifted], comparing: [], swapping: [], sorted: [], message: `Delete index 0: shift all elements left. O(n) time. Array: [${shifted.join(', ')}]`, line: 4 })
        const target = shifted[3]
        for (let i = 0; i < shifted.length; i++) {
            steps.push({ array: [...shifted], comparing: [i], swapping: [], sorted: [], message: `Linear search for ${target}: checking index ${i} → ${shifted[i] === target ? 'FOUND!' : 'no match'}`, line: 5 })
            if (shifted[i] === target) break
        }
        return steps
    },
    'majority-element': (arr) => {
        const steps = []
        const majority = arr[0] % 50 + 10
        const array = Array.from({ length: 7 }, (_, i) => i < 4 ? majority : arr[i % arr.length] % 20 + 1)
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Boyer-Moore Voting: find element appearing > n/2 times in [${array.join(', ')}]`, line: 1 })
        let candidate = array[0], votes = 1
        steps.push({ array: [...array], comparing: [0], swapping: [], sorted: [], message: `Initialize: candidate = ${candidate}, votes = ${votes}`, line: 2 })
        for (let i = 1; i < array.length; i++) {
            if (votes === 0) {
                candidate = array[i]; votes = 1
                steps.push({ array: [...array], comparing: [i], swapping: [], sorted: [], message: `votes = 0 → new candidate = ${candidate}, votes = 1`, line: 3 })
            } else if (array[i] === candidate) {
                votes++
                steps.push({ array: [...array], comparing: [i], swapping: [], sorted: [], message: `arr[${i}]=\arr[i] matches candidate ${candidate} → votes = ${votes}`, line: 4 })
            } else {
                votes--
                steps.push({ array: [...array], comparing: [i], swapping: [], sorted: [], message: `arr[${i}]=\arr[i] ≠ candidate ${candidate} → votes = ${votes}`, line: 5 })
            }
        }
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: array.map((x, i) => x === candidate ? i : -1).filter(i => i >= 0), message: `Majority element = ${candidate}! Boyer-Moore: O(n) time, O(1) space.`, line: 6 })
        return steps
    },
    'circular-linked-list': (arr) => {
        const steps = []
        const elements = arr.slice(0, 5)
        const nodes = []
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [], message: `Circular Linked List: tail.next → head. Good for round-robin scheduling.`, line: 1 })
        for (const val of elements) {
            nodes.push(val)
            steps.push({ array: [...nodes], comparing: [nodes.length - 1], swapping: [], sorted: [], message: `Insert ${val}: [${nodes.join(' → ')} → head(${nodes[0]})]`, line: 2 })
        }
        for (let i = 0; i < nodes.length + 2; i++) {
            const idx = i % nodes.length
            steps.push({ array: [...nodes], comparing: [idx], swapping: [], sorted: [], message: `Traverse step ${i + 1}: node[${idx}]=${nodes[idx]}. Wraps after ${nodes.length} steps!`, line: 3 })
        }
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: nodes.map((_, i) => i), message: `Circular LL: tail.next=head. Use fast-slow to detect cycle.`, line: 4 })
        return steps
    },
    'fast-slow-pointer': (arr) => {
        const steps = []
        const elements = arr.slice(0, 8)
        const next = elements.map((_, i) => i === elements.length - 1 ? 3 : i + 1)
        steps.push({ array: [...elements], comparing: [], swapping: [], sorted: [], message: `Fast-Slow (Floyd's): slow=1 step, fast=2 steps. Cycle at index 3.`, line: 1 })
        let slow = 0, fast = 0
        for (let step = 0; step < elements.length; step++) {
            slow = next[slow]; fast = next[next[fast]]
            steps.push({ array: [...elements], comparing: [slow, fast], swapping: [], sorted: [], message: `Step ${step + 1}: slow=${slow}, fast=${fast}${slow === fast ? ' → CYCLE DETECTED!' : ''}`, line: 2 })
            if (slow === fast) break
        }
        slow = 0
        while (slow !== fast) {
            slow = next[slow]; fast = next[fast]
            steps.push({ array: [...elements], comparing: [slow, fast], swapping: [], sorted: [], message: `Find start: slow=${slow}, fast=${fast}${slow === fast ? ' → Cycle start!' : ''}`, line: 3 })
        }
        steps.push({ array: [...elements], comparing: [], swapping: [], sorted: [slow], message: `Cycle starts at index ${slow}. O(n) time, O(1) space!`, line: 4 })
        return steps
    },
    'merge-linked-lists': (arr) => {
        const steps = []
        const a = [...arr.slice(0, 4)].sort((x, y) => x - y)
        const b = [...arr.slice(4, 7)].sort((x, y) => x - y)
        steps.push({ array: [...a, -1, ...b], comparing: [], swapping: [], sorted: [], message: `Merge Two Sorted Lists. L1=[${a}], L2=[${b}].`, line: 1 })
        const merged = []
        let i = 0, j = 0
        while (i < a.length && j < b.length) {
            steps.push({ array: [...merged, ...a.slice(i), -1, ...b.slice(j)], comparing: [merged.length, merged.length + a.length - i + 1], swapping: [], sorted: merged.map((_, k) => k), message: `Compare L1[${i}]=${a[i]} vs L2[${j}]=${b[j]}: pick ${Math.min(a[i], b[j])}`, line: 2 })
            if (a[i] <= b[j]) merged.push(a[i++])
            else merged.push(b[j++])
        }
        while (i < a.length) merged.push(a[i++])
        while (j < b.length) merged.push(b[j++])
        steps.push({ array: [...merged], comparing: [], swapping: [], sorted: merged.map((_, i) => i), message: `Merged: [${merged}]. O(n+m) time, O(1) space!`, line: 3 })
        return steps
    },
    'hash-function': (arr) => {
        const steps = []
        const keys = ['apple', 'banana', 'cherry', 'date', 'fig']
        const tableSize = 7
        const polyHash = (key, size) => { let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) % size; return h }
        steps.push({ array: new Array(tableSize).fill(0), comparing: [], swapping: [], sorted: [], message: `Hash Function: map keys to table[0..${tableSize - 1}] using polynomial hash.`, line: 1 })
        for (const key of keys) {
            const idx = polyHash(key, tableSize)
            const table = new Array(tableSize).fill(0); table[idx] = 1
            steps.push({ array: [...table], comparing: [idx], swapping: [], sorted: [], message: `hash('${key}') = ${idx}. ∑(charCode × 31^i) % ${tableSize}`, line: 2 })
        }
        steps.push({ array: new Array(tableSize).fill(1), comparing: [], swapping: [], sorted: new Array(tableSize).fill(0).map((_, i) => i), message: `Good hash: deterministic, uniform, fast O(k). Avoids clustering!`, line: 3 })
        return steps
    },
    'collision-handling': (arr) => {
        const steps = []
        const tableSize = 5
        const values = arr.slice(0, 7)
        const table = Array.from({ length: tableSize }, () => [])
        const hashFn = v => v % tableSize
        steps.push({ array: table.map(b => b.length), comparing: [], swapping: [], sorted: [], message: `Separate Chaining: each slot has a linked list. Size=${tableSize}.`, line: 1 })
        for (const v of values) {
            const idx = hashFn(v)
            table[idx].push(v)
            steps.push({ array: table.map(b => b.length), comparing: [idx], swapping: [], sorted: [], message: `hash(${v})=${idx}: bucket=[${table[idx]}]${table[idx].length > 1 ? ' ← COLLISION!' : ''}`, line: 2 })
        }
        steps.push({ array: table.map(b => b.length), comparing: [], swapping: [], sorted: table.map((b, i) => i).filter(i => table[i].length > 0), message: `Load factor=${(values.length / tableSize).toFixed(1)}. High LF degrades to O(n).`, line: 3 })
        return steps
    },
    'hashset': (arr) => {
        const steps = []
        const elements = [...arr.slice(0, 5), arr[0], arr[1]]
        const set = new Set()
        steps.push({ array: [...elements], comparing: [], swapping: [], sorted: [], message: `HashSet: unique elements only. O(1) avg add/contains. Input: [${elements}]`, line: 1 })
        for (let i = 0; i < elements.length; i++) {
            const val = elements[i], existed = set.has(val)
            set.add(val)
            steps.push({ array: [...elements], comparing: [i], swapping: [], sorted: existed ? [i] : [], message: `add(${val}): ${existed ? 'duplicate → ignored' : `added. Set: {${[...set]}}`}`, line: 2 })
        }
        steps.push({ array: [...set].map((_, i) => i), comparing: [], swapping: [], sorted: [...set].map((_, i) => i), message: `Set: {${[...set]}}. Size=${set.size}. Deduplicated in O(n)!`, line: 3 })
        return steps
    },
    'frequency-map': (arr) => {
        const steps = []
        const elements = arr.slice(0, 8)
        const freq = new Map()
        steps.push({ array: [...elements], comparing: [], swapping: [], sorted: [], message: `Frequency Map: count occurrences. [${elements}]. Most versatile interview pattern!`, line: 1 })
        for (let i = 0; i < elements.length; i++) {
            const val = elements[i]
            freq.set(val, (freq.get(val) || 0) + 1)
            steps.push({ array: [...elements], comparing: [i], swapping: [], sorted: [], message: `freq[${val}]=${freq.get(val)}. Map: {${[...freq.entries()].map(([k, v]) => `${k}:${v}`).join(', ')}}`, line: 2 })
        }
        const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1])
        steps.push({ array: sorted.map(([_, v]) => v), comparing: [0], swapping: [], sorted: [0], message: `Most frequent: ${sorted[0][0]} (×${sorted[0][1]}). Backbone of: anagram, top-K, two-sum.`, line: 3 })
        return steps
    },
    'tree-boundary-views': () => {
        const nodes = [1, 2, 3, 4, 5, 0, 6]
        const steps = []
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [], message: `Tree Views: [1,2,3,4,5,null,6]. Computing left view, right view.`, line: 1 })
        steps.push({ array: [...nodes], comparing: [0, 1, 3], swapping: [], sorted: [0], message: `Left View (first node at each level): [1, 2, 4]. BFS, take first node per level.`, line: 2 })
        steps.push({ array: [...nodes], comparing: [0, 2, 5], swapping: [], sorted: [0, 2, 5], message: `Right View (last node at each level): [1, 3, 6]. BFS, take last node per level.`, line: 3 })
        steps.push({ array: [...nodes], comparing: [3, 1, 0, 2, 5], swapping: [], sorted: [3, 1, 0, 2, 5], message: `Top View (using HD): [4→HD=-2, 2→HD=-1, 1→HD=0, 3→HD=1, 6→HD=2] = [4,2,1,3,6]`, line: 4 })
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: nodes.map((_, i) => i), message: `All views use BFS + level/HD tracking. Common interview favorite!`, line: 5 })
        return steps
    },
    'lowest-common-ancestor': () => {
        const nodes = [3, 5, 1, 6, 2, 0, 8]
        const steps = []
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [], message: `LCA: find deepest common ancestor of nodes 6 and 2. Tree: [3,5,1,6,2,0,8]`, line: 1 })
        steps.push({ array: [...nodes], comparing: [3], swapping: [], sorted: [], message: `Search for node 6: found at index 3 (left child of 5). Return node 6 up.`, line: 2 })
        steps.push({ array: [...nodes], comparing: [4], swapping: [], sorted: [], message: `Search for node 2: found at index 4 (right child of 5). Return node 2 up.`, line: 3 })
        steps.push({ array: [...nodes], comparing: [1], swapping: [], sorted: [1], message: `At node 5 (index 1): left found 6, right found 2 → LCA = 5! Both in different subtrees of 5.`, line: 4 })
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [1], message: `LCA(6, 2) = 5. O(n) time. For BST: O(log n) using BST property to navigate.`, line: 5 })
        return steps
    },
    'tree-serialization': () => {
        const nodes = [1, 2, 3, 4, 5, 0, 6]
        const steps = []
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [], message: `Tree Serialization: encode binary tree [1,2,3,4,5,null,6] to string and back.`, line: 1 })
        steps.push({ array: [...nodes], comparing: [0, 1, 3], swapping: [], sorted: [], message: `Preorder serialize: visit root(1) → left subtree → right subtree. '1,2,4,null,null,5,null,null,3,null,6,null,null'`, line: 2 })
        steps.push({ array: [...nodes], comparing: [0, 2, 5], swapping: [], sorted: [], message: `Null markers are critical! Without them, inorder alone cannot uniquely reconstruct the tree.`, line: 3 })
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: nodes.map((_, i) => i), message: `Deserialize: split by ',', use recursion with an index pointer. O(n) time and space.`, line: 4 })
        return steps
    },
    'bst-validation': () => {
        const nodes = [5, 3, 7, 1, 4, 6, 8]
        const steps = []
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [], message: `BST Validation: check every node satisfies BST property. [5,3,7,1,4,6,8]`, line: 1 })
        steps.push({ array: [...nodes], comparing: [0], swapping: [], sorted: [], message: `Root=5: left subtree must have all values < 5. Right subtree must have all values > 5.`, line: 2 })
        steps.push({ array: [...nodes], comparing: [1, 3, 4], swapping: [], sorted: [1, 3, 4], message: `Left subtree of 5: [3,1,4]. All < 5. Node 3: range=(-∞,5). Node 1: range=(-∞,3). Node 4: range=(3,5). ✓`, line: 3 })
        steps.push({ array: [...nodes], comparing: [2, 5, 6], swapping: [], sorted: [2, 5, 6], message: `Right subtree of 5: [7,6,8]. All > 5. Node 7: range=(5,+∞). Node 6: range=(5,7). Node 8: range=(7,+∞). ✓`, line: 4 })
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: nodes.map((_, i) => i), message: `VALID BST! Inorder traversal gives sorted: [1,3,4,5,6,7,8]. O(n) range-check approach avoids parent-only pitfalls!`, line: 5 })
        return steps
    },
    'bst-floor-ceil': () => {
        const nodes = [8, 4, 12, 2, 6, 10, 14]
        const target = 7
        const steps = []
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [], message: `BST Floor & Ceil: tree=[8,4,12,2,6,10,14]. Find floor(${target}) and ceil(${target}).`, line: 1 })
        let floor = null, ceil = null, node = nodes[0]
        steps.push({ array: [...nodes], comparing: [0], swapping: [], sorted: [], message: `Start at root=8. 8 > ${target} → potential ceil=8, go LEFT.`, line: 2 })
        steps.push({ array: [...nodes], comparing: [1], swapping: [], sorted: [], message: `Node=4. 4 < ${target} → potential floor=4, go RIGHT.`, line: 3 })
        steps.push({ array: [...nodes], comparing: [4], swapping: [], sorted: [], message: `Node=6. 6 < ${target} → potential floor=6, go RIGHT (no right child → stop).`, line: 4 })
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [4, 0], message: `floor(${target})=6 (greatest ≤ ${target}). ceil(${target})=8 (smallest ≥ ${target}). O(log n) avg!`, line: 5 })
        return steps
    },
    'kth-smallest-bst': () => {
        const nodes = [5, 3, 7, 1, 4, 6, 8]
        const k = 3
        const steps = []
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [], message: `Kth Smallest in BST: find ${k}rd smallest. BST inorder = sorted ascending!`, line: 1 })
        const inorder = [1, 3, 4, 5, 6, 7, 8]
        steps.push({ array: [...nodes], comparing: [3], swapping: [], sorted: [3], message: `Inorder step 1: visit 1 (count=1). count < ${k}.`, line: 2 })
        steps.push({ array: [...nodes], comparing: [1], swapping: [], sorted: [3, 1], message: `Inorder step 2: visit 3 (count=2). count < ${k}.`, line: 3 })
        steps.push({ array: [...nodes], comparing: [4], swapping: [], sorted: [3, 1, 4], message: `Inorder step 3: visit 4 (count=3=k). FOUND! ${k}rd smallest = 4.`, line: 4 })
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [4], message: `Kth Smallest = ${inorder[k - 1]}. Use iterative inorder to avoid full traversal: O(h + k).`, line: 5 })
        return steps
    },
    'red-black-tree': () => {
        const steps = []
        const nodes = [7, 3, 11, 1, 5, 9, 13]
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: [], message: `Red-Black Tree: BST with 5 color properties. Root=7(B), 3(R), 11(R), 1(B), 5(B), 9(B), 13(B).`, line: 1 })
        steps.push({ array: [...nodes], comparing: [0], swapping: [], sorted: [0], message: `Property 1: Root is BLACK (7). Property 2: All NIL leaves are BLACK.`, line: 2 })
        steps.push({ array: [...nodes], comparing: [1, 2], swapping: [], sorted: [], message: `Property 3: RED node's children must be BLACK. 3(R)→1(B),5(B) ✓. 11(R)→9(B),13(B) ✓.`, line: 3 })
        steps.push({ array: [...nodes], comparing: [], swapping: [], sorted: nodes.map((_, i) => i), message: `Property 4: All paths root→leaf have equal BLACK count. Height ≤ 2log(n+1). Used in: TreeMap, std::map.`, line: 4 })
        return steps
    },
    'b-tree': () => {
        const steps = []
        steps.push({ array: [1, 2, 3, 4, 5, 6, 7], comparing: [], swapping: [], sorted: [], message: `B-Tree (order t=2): each node has [1,3] keys and [2,4] children. Designed for disk storage.`, line: 1 })
        steps.push({ array: [10, 20, 30, 0, 0, 0, 0], comparing: [0, 1, 2], swapping: [], sorted: [], message: `Node with keys [10,20,30]. 3 keys = 4 children. All at same depth — always balanced!`, line: 2 })
        steps.push({ array: [10, 20, 30, 0, 0, 0, 0], comparing: [], swapping: [], sorted: [0, 1, 2], message: `Insert 25: goes to right child of 20. If node is full (3 keys), split: middle key 20 rises to parent.`, line: 3 })
        steps.push({ array: [10, 20, 30, 0, 0, 0, 0], comparing: [], swapping: [], sorted: [0, 1, 2, 3, 4, 5, 6], message: `With t=100: height=O(log₁₀₀ n). For n=1M: height≈3. B+Trees (leaves linked) power MySQL InnoDB!`, line: 4 })
        return steps
    },
    'min-heap': (arr) => {
        const steps = []
        const elements = arr.slice(0, 7)
        const heap = []
        const siftUp = (h, i) => {
            while (i > 0) {
                const p = Math.floor((i - 1) / 2)
                if (h[p] <= h[i]) break
                ;[h[p], h[i]] = [h[i], h[p]]; i = p
            }
        }
        steps.push({ array: [...heap], comparing: [], swapping: [], sorted: [], message: `Min Heap: complete binary tree, parent ≤ children. Array representation: parent(i)=⌊(i-1)/2⌋.`, line: 1 })
        for (const val of elements) {
            heap.push(val)
            siftUp(heap, heap.length - 1)
            steps.push({ array: [...heap], comparing: [0], swapping: [], sorted: [], message: `Insert ${val}: add to end, sift up. Heap: [${heap}]. Min = ${heap[0]}`, line: 2 })
        }
        for (let i = 0; i < 2 && heap.length > 1; i++) {
            const min = heap[0]
            heap[0] = heap.pop()
            let idx = 0
            while (true) {
                let s = idx, l = 2 * idx + 1, r = 2 * idx + 2
                if (l < heap.length && heap[l] < heap[s]) s = l
                if (r < heap.length && heap[r] < heap[s]) s = r
                if (s === idx) break
                ;[heap[s], heap[idx]] = [heap[idx], heap[s]]; idx = s
            }
            steps.push({ array: [...heap], comparing: [0], swapping: [], sorted: [], message: `extractMin()=${min}: move last to root, sift down. New heap: [${heap}]. New min=${heap[0]}`, line: 3 })
        }
        return steps
    },
    'heapify': (arr) => {
        const steps = []
        const array = arr.slice(0, 7)
        steps.push({ array: [...array], comparing: [], swapping: [], sorted: [], message: `Heapify (Floyd's O(n)): build min-heap bottom-up. Start from last non-leaf (index ${Math.floor(array.length / 2) - 1}).`, line: 1 })
        const heap = [...array]
        const siftDown = (h, i, n) => {
            while (true) {
                let s = i, l = 2 * i + 1, r = 2 * i + 2
                if (l < n && h[l] < h[s]) s = l
                if (r < n && h[r] < h[s]) s = r
                if (s === i) break
                ;[h[s], h[i]] = [h[i], h[s]]; i = s
            }
        }
        for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) {
            const before = [...heap]
            siftDown(heap, i, heap.length)
            steps.push({ array: [...heap], comparing: [i], swapping: heap.map((v, j) => v !== before[j] ? j : -1).filter(j => j >= 0), sorted: [], message: `Sift down index ${i}: heap[${i}]=${before[i]}. After: [${heap}]`, line: 2 })
        }
        steps.push({ array: [...heap], comparing: [], swapping: [], sorted: [0], message: `Heap built! [${heap}]. Min=${heap[0]}. Why O(n)? Most nodes sift down very few levels.`, line: 3 })
        return steps
    },
    'median-heap': (arr) => {
        const steps = []
        const stream = arr.slice(0, 7)
        const lower = [], upper = []
        const pushMaxHeap = (h, v) => { h.push(v); let i = h.length - 1; while (i > 0) { const p = Math.floor((i - 1) / 2); if (h[p] >= h[i]) break; [h[p], h[i]] = [h[i], h[p]]; i = p } }
        const pushMinHeap = (h, v) => { h.push(v); let i = h.length - 1; while (i > 0) { const p = Math.floor((i - 1) / 2); if (h[p] <= h[i]) break; [h[p], h[i]] = [h[i], h[p]]; i = p } }
        const popMaxHeap = (h) => { const v = h[0]; h[0] = h.pop(); let i = 0; while (true) { let s = i, l = 2*i+1, r = 2*i+2; if (l < h.length && h[l] > h[s]) s = l; if (r < h.length && h[r] > h[s]) s = r; if (s === i) break; [h[s], h[i]] = [h[i], h[s]]; i = s } return v }
        const popMinHeap = (h) => { const v = h[0]; h[0] = h.pop(); let i = 0; while (true) { let s = i, l = 2*i+1, r = 2*i+2; if (l < h.length && h[l] < h[s]) s = l; if (r < h.length && h[r] < h[s]) s = r; if (s === i) break; [h[s], h[i]] = [h[i], h[s]]; i = s } return v }
        steps.push({ array: [...stream], comparing: [], swapping: [], sorted: [], message: `Median of Stream: lower=MaxHeap (bottom half), upper=MinHeap (top half). Stream: [${stream}]`, line: 1 })
        for (let i = 0; i < stream.length; i++) {
            const num = stream[i]
            if (!lower.length || num <= lower[0]) pushMaxHeap(lower, num)
            else pushMinHeap(upper, num)
            if (lower.length > upper.length + 1) pushMinHeap(upper, popMaxHeap(lower))
            else if (upper.length > lower.length) pushMaxHeap(lower, popMinHeap(upper))
            const median = lower.length > upper.length ? lower[0] : (lower[0] + upper[0]) / 2
            steps.push({ array: [...stream.slice(0, i + 1)], comparing: [i], swapping: [], sorted: [], message: `Add ${num}: lower=[${lower}] upper=[${upper}]. Median = ${median}`, line: 2 })
        }
        return steps
    },
    'xor-trie': (arr) => {
        const steps = []
        const nums = arr.slice(0, 6).map(x => x % 16)
        steps.push({ array: [...nums], comparing: [], swapping: [], sorted: [], message: `XOR Trie: binary trie for maximizing XOR. Numbers: [${nums}]`, line: 1 })
        let maxXOR = 0, bestPair = [0, 0]
        for (let i = 0; i < nums.length; i++) {
            let xorVal = 0
            steps.push({ array: [...nums], comparing: [i], swapping: [], sorted: [], message: `Insert ${nums[i]} (${nums[i].toString(2).padStart(4, '0')}) into trie bit by bit (MSB to LSB).`, line: 2 })
            for (let j = 0; j < i; j++) {
                const x = nums[i] ^ nums[j]
                if (x > xorVal) { xorVal = x; bestPair = [i, j] }
            }
            if (xorVal > maxXOR) maxXOR = xorVal
            steps.push({ array: [...nums], comparing: [i, bestPair[1]], swapping: [], sorted: [], message: `Query ${nums[i]}: greedy pick opposite bits. Best XOR with ${nums[bestPair[1]]} = ${xorVal} (${xorVal.toString(2).padStart(4, '0')})`, line: 3 })
        }
        steps.push({ array: [...nums], comparing: [], swapping: [], sorted: bestPair, message: `Maximum XOR = ${maxXOR} from ${nums[bestPair[0]]} XOR ${nums[bestPair[1]]}. O(32n) time!`, line: 4 })
        return steps
    },
    'difference-array': (arr) => {
        const steps = []
        const base = [0, 0, 0, 0, 0]
        const diff = [0, 0, 0, 0, 0]
        steps.push({
            array: [...base],
            comparing: [],
            swapping: [],
            sorted: [],
            message: "Difference Array: Initialize base array A = [0,0,0,0,0] and difference array D = [0,0,0,0,0].",
            line: 0
        })
        diff[1] += 3
        diff[4] -= 3
        steps.push({
            array: [...diff],
            comparing: [1, 4],
            swapping: [],
            sorted: [],
            message: "Update range [1, 3] with +3: set D[1] += 3 and D[4] -= 3.",
            line: 1
        })
        diff[2] += 2
        steps.push({
            array: [...diff],
            comparing: [2],
            swapping: [],
            sorted: [],
            message: "Update range [2, 4] with +2: set D[2] += 2 (no boundary at index 5).",
            line: 2
        })
        const finalArr = [0, 0, 0, 0, 0]
        let sum = 0
        for (let i = 0; i < 5; i++) {
            sum += diff[i]
            finalArr[i] = sum
            steps.push({
                array: [...finalArr],
                comparing: [i],
                swapping: [],
                sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
                message: `Prefix sum at index ${i}: sum = ${sum}. A[${i}] = ${sum}`,
                line: 3
            })
        }
        steps.push({
            array: [...finalArr],
            comparing: [],
            swapping: [],
            sorted: [0, 1, 2, 3, 4],
            message: "Range updates completed! Final array: [" + finalArr.join(', ') + "]. O(1) per update, O(n) overall.",
            line: 4
        })
        return steps
    },
    'dutch-national-flag': (arr) => {
        const steps = []
        const array = [2, 0, 2, 1, 1, 0]
        const n = array.length
        steps.push({
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: [],
            pointers: [0, 0, n - 1],
            message: "Dutch National Flag: Sort array of 0s, 1s, 2s. Initialize low = 0, mid = 0, high = 5.",
            line: 0
        })
        let low = 0, mid = 0, high = n - 1
        while (mid <= high) {
            steps.push({
                array: [...array],
                comparing: [mid],
                swapping: [],
                sorted: [],
                pointers: [low, mid, high],
                message: `Check array[mid] = array[${mid}] = ${array[mid]}.`,
                line: 1
            })
            if (array[mid] === 0) {
                steps.push({
                    array: [...array],
                    comparing: [],
                    swapping: [low, mid],
                    sorted: [],
                    pointers: [low, mid, high],
                    message: `array[mid] = 0: swap array[low] (${array[low]}) and array[mid] (${array[mid]}). Move low and mid.`,
                    line: 2
                })
                ;[array[low], array[mid]] = [array[mid], array[low]]
                low++
                mid++
            } else if (array[mid] === 1) {
                steps.push({
                    array: [...array],
                    comparing: [mid],
                    swapping: [],
                    sorted: [],
                    pointers: [low, mid, high],
                    message: `array[mid] = 1: already in correct middle segment. Move mid pointer.`,
                    line: 3
                })
                mid++
            } else {
                steps.push({
                    array: [...array],
                    comparing: [],
                    swapping: [mid, high],
                    sorted: [],
                    pointers: [low, mid, high],
                    message: `array[mid] = 2: swap array[mid] (${array[mid]}) and array[high] (${array[high]}). Move high pointer.`,
                    line: 4
                })
                ;[array[mid], array[high]] = [array[high], array[mid]]
                high--
            }
        }
        steps.push({
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: array.map((_, i) => i),
            pointers: [low, mid, high],
            message: "Sorting completed in one pass! O(n) time, O(1) space.",
            line: 5
        })
        return steps
    },
    'bellman-ford': () => {
        const steps = []
        const dist = [0, 99, 99, 99]
        steps.push({
            array: [...dist],
            comparing: [],
            swapping: [],
            sorted: [],
            message: "Bellman-Ford: Initialize dist[0] = 0, others = Infinity. Graph has edges with negative weights.",
            line: 0
        })
        dist[1] = 4
        steps.push({
            array: [...dist],
            comparing: [0, 1],
            swapping: [],
            sorted: [],
            message: "Relax edge 0 -> 1 (weight 4): dist[1] = min(Infinity, 0 + 4) = 4.",
            line: 1
        })
        dist[2] = 3
        steps.push({
            array: [...dist],
            comparing: [0, 2],
            swapping: [],
            sorted: [],
            message: "Relax edge 0 -> 2 (weight 3): dist[2] = min(Infinity, 0 + 3) = 3.",
            line: 1
        })
        dist[2] = 2
        steps.push({
            array: [...dist],
            comparing: [1, 2],
            swapping: [],
            sorted: [],
            message: "Relax edge 1 -> 2 (weight -2): dist[2] = min(3, 4 + (-2)) = 2. Negative weight edge processed successfully!",
            line: 2
        })
        dist[3] = 4
        steps.push({
            array: [...dist],
            comparing: [2, 3],
            swapping: [],
            sorted: [],
            message: "Relax edge 2 -> 3 (weight 2): dist[3] = min(Infinity, 2 + 2) = 4.",
            line: 2
        })
        steps.push({
            array: [...dist],
            comparing: [],
            swapping: [],
            sorted: [0, 1, 2, 3],
            message: "All edges relaxed V-1 times. Final distances: [0, 4, 2, 4]. No negative cycles detected.",
            line: 3
        })
        return steps
    },
    'prims': () => {
        const steps = []
        const visited = [0]
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            visited: [...visited],
            message: "Prim's Algorithm: Find Minimum Spanning Tree. Start at Node 0. MST = {0}.",
            line: 0
        })
        visited.push(1)
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            visited: [...visited],
            comparing: [0, 1],
            message: "Minimum edge connecting MST {0} to unvisited is (0, 1) with weight 2. Add Node 1 to MST.",
            line: 1
        })
        visited.push(2)
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            visited: [...visited],
            comparing: [1, 2],
            message: "Minimum edge connecting MST {0, 1} to unvisited is (1, 2) with weight 1. Add Node 2 to MST.",
            line: 2
        })
        visited.push(3)
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            visited: [...visited],
            comparing: [2, 3],
            message: "Minimum edge connecting MST {0, 1, 2} to unvisited is (2, 3) with weight 3. Add Node 3 to MST.",
            line: 2
        })
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            visited: [...visited],
            sorted: [0, 1, 2, 3],
            message: "All vertices visited. Minimum Spanning Tree built successfully! Total weight = 2 + 1 + 3 = 6.",
            line: 3
        })
        return steps
    },
    'kruskal': () => {
        const steps = []
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            message: "Kruskal's Algorithm: Sort edges by weight. Initial DSU state: all nodes are independent sets.",
            line: 0
        })
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            comparing: [2],
            message: "Process minimum edge (1, 2) wt 1. Nodes 1 and 2 are in different components. Union them.",
            line: 1
        })
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            comparing: [0],
            message: "Process edge (0, 1) wt 2. Nodes 0 and 1 are in different components. Union them.",
            line: 1
        })
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            comparing: [4],
            message: "Process edge (2, 3) wt 3. Nodes 2 and 3 are in different components. Union them.",
            line: 1
        })
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            comparing: [1],
            message: "Process edge (0, 2) wt 4. Both nodes are already in the same component. Skip to avoid cycles.",
            line: 2
        })
        steps.push({
            graphNodes: [0, 1, 2, 3],
            graphEdges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 5], [2, 3, 3]],
            sorted: [0, 1, 2, 3],
            message: "DSU check complete. MST contains V-1 edges. MST construction finished! Total weight = 6.",
            line: 3
        })
        return steps
    },
    'fenwick-tree': (arr) => {
        const steps = []
        const base = arr.slice(0, 5)
        const bit = [0, 0, 0, 0, 0, 0]
        steps.push({
            array: [...bit],
            message: `Fenwick Tree (Binary Indexed Tree): Initialize BIT with zeros for array: [${base.join(', ')}]`,
            line: 0
        })
        for (let i = 0; i < base.length; i++) {
            const val = base[i]
            let idx = i + 1
            while (idx < bit.length) {
                bit[idx] += val
                steps.push({
                    array: [...bit],
                    comparing: [idx],
                    message: `Insert base[${i}]=${val}: update BIT[${idx}] += ${val}. Next index is ${idx} + (${idx} & -${idx}) = ${idx + (idx & -idx)}`,
                    line: 1
                })
                idx += (idx & -idx)
            }
        }
        let sum = 0
        let qIdx = 4
        const querySteps = []
        while (qIdx > 0) {
            sum += bit[qIdx]
            querySteps.push(qIdx)
            steps.push({
                array: [...bit],
                comparing: [...querySteps],
                message: `Query prefix sum of first 4 elements: add BIT[${qIdx}] (${bit[qIdx]}) -> running sum = ${sum}. Next query index is ${qIdx} - (${qIdx} & -${qIdx}) = ${qIdx - (qIdx & -qIdx)}`,
                line: 2
            })
            qIdx -= (qIdx & -qIdx)
        }
        steps.push({
            array: [...bit],
            comparing: [],
            sorted: [1, 2, 3, 4],
            message: `Query finished. Sum of first 4 elements = ${sum}. both point updates and prefix sums are O(log n).`,
            line: 3
        })
        return steps
    }
};

const phase5to9Generators = {
    'graph-representation': () => {
        const steps = []
        const adj = [
            [1, 2],
            [0, 3],
            [0, 3],
            [1, 2]
        ]
        const numNodes = adj.length
        steps.push({
            visualizationType: 'grid',
            grid: adj.map((neighbors, u) => {
                const row = Array(numNodes).fill(' ')
                neighbors.forEach(v => row[v] = '●')
                return row
            }),
            rowHeaders: ['Node 0', 'Node 1', 'Node 2', 'Node 3'],
            colHeaders: ['0', '1', '2', '3'],
            activeCells: [],
            message: "Adjacency Matrix representation: ● indicates an edge between node row and node col."
        })
        for (let u = 0; u < numNodes; u++) {
            steps.push({
                visualizationType: 'grid',
                grid: adj.map((neighbors) => {
                    const row = Array(numNodes).fill(' ')
                    neighbors.forEach(v => row[v] = '●')
                    return row
                }),
                rowHeaders: ['Node 0', 'Node 1', 'Node 2', 'Node 3'],
                colHeaders: ['0', '1', '2', '3'],
                activeCells: adj[u].map(v => [u, v]),
                message: `Exploring Node ${u}'s outgoing edges: points to nodes ${adj[u].join(', ')}.`
            })
        }
        return steps
    },
    'graph-types': () => {
        const steps = []
        const grid = [
            [0, 4, 8, '.'],
            [4, 0, '.', 3],
            [8, '.', 0, 7],
            ['.', 3, 7, 0]
        ]
        steps.push({
            visualizationType: 'grid',
            grid: grid,
            rowHeaders: ['Node 0', 'Node 1', 'Node 2', 'Node 3'],
            colHeaders: ['0', '1', '2', '3'],
            activeCells: [],
            message: "Undirected Weighted Graph: Symmetric matrix containing edge weights."
        })
        steps.push({
            visualizationType: 'grid',
            grid: grid,
            rowHeaders: ['Node 0', 'Node 1', 'Node 2', 'Node 3'],
            colHeaders: ['0', '1', '2', '3'],
            activeCells: [[0, 1], [1, 0]],
            message: "Undirected edge between 0 and 1 has weight 4 (represented symmetrically at grid[0][1] and grid[1][0])."
        })
        steps.push({
            visualizationType: 'grid',
            grid: grid,
            rowHeaders: ['Node 0', 'Node 1', 'Node 2', 'Node 3'],
            colHeaders: ['0', '1', '2', '3'],
            activeCells: [[0, 2], [2, 0]],
            message: "Undirected edge between 0 and 2 has weight 8."
        })
        return steps
    },
    'connected-components': () => {
        const steps = []
        const nodes = [0, 1, 2, 3, 4, 5]
        const edges = [[0, 1], [2, 3], [4, 5]]
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [],
            current: null,
            message: "Graph with 6 nodes and 3 edges. We want to find the number of connected components."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0],
            current: 0,
            message: "Start DFS from Node 0. Mark Node 0 as visited."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1],
            current: 1,
            message: "DFS traverses Node 0 -> Node 1. Component 1 is {0, 1}."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 2],
            current: 2,
            message: "Next unvisited node is Node 2. Start DFS from Node 2."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 2, 3],
            current: 3,
            message: "DFS traverses Node 2 -> Node 3. Component 2 is {2, 3}."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 2, 3, 4],
            current: 4,
            message: "Next unvisited node is Node 4. Start DFS from Node 4."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 2, 3, 4, 5],
            current: 5,
            message: "DFS traverses Node 4 -> Node 5. Component 3 is {4, 5}."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 2, 3, 4, 5],
            current: null,
            message: "All nodes visited. Total connected components = 3."
        })
        return steps
    },
    'flood-fill': () => {
        const steps = []
        const grid = [
            [1, 1, 1],
            [1, 1, 0],
            [1, 0, 1]
        ]
        steps.push({
            visualizationType: 'grid',
            grid: grid.map(r => [...r]),
            activeCells: [[1, 1]],
            message: "Flood Fill starting from cell (1, 1) with target color 2."
        })
        const flood = (r, c) => {
            if (r < 0 || r >= 3 || c < 0 || c >= 3 || grid[r][c] !== 1) return
            grid[r][c] = 2
            steps.push({
                visualizationType: 'grid',
                grid: grid.map(row => [...row]),
                activeCells: [[r, c]],
                successCells: grid.flatMap((row, ri) => row.map((val, ci) => val === 2 ? [ri, ci] : null)).filter(Boolean),
                message: `Coloring cell (${r}, ${c}) to 2.`
            })
            flood(r + 1, c)
            flood(r - 1, c)
            flood(r, c + 1)
            flood(r, c - 1)
        }
        flood(1, 1)
        steps.push({
            visualizationType: 'grid',
            grid: grid.map(row => [...row]),
            successCells: grid.flatMap((row, ri) => row.map((val, ci) => val === 2 ? [ri, ci] : null)).filter(Boolean),
            message: "Flood Fill complete!"
        })
        return steps
    },
    'multi-source-bfs': () => {
        const steps = []
        const grid = [
            [0, 9, 9],
            [9, 9, 9],
            [9, 9, 0]
        ]
        steps.push({
            visualizationType: 'grid',
            grid: grid.map(row => [...row]),
            activeCells: [[0, 0], [2, 2]],
            message: "Initialize multi-source BFS with sources at (0, 0) and (2, 2) at distance 0."
        })
        const q = [[0, 0], [2, 2]]
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        while (q.length > 0) {
            const [r, c] = q.shift()
            const dist = grid[r][c]
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc
                if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3 && grid[nr][nc] === 9) {
                    grid[nr][nc] = dist + 1
                    q.push([nr, nc])
                    steps.push({
                        visualizationType: 'grid',
                        grid: grid.map(row => [...row]),
                        activeCells: [[nr, nc]],
                        highlightedCells: [[r, c]],
                        message: `Cell (${nr}, ${nc}) visited from (${r}, ${c}). New distance = ${dist + 1}.`
                    })
                }
            }
        }
        steps.push({
            visualizationType: 'grid',
            grid: grid.map(row => [...row]),
            activeCells: [],
            message: "Multi-Source BFS completed. All cell shortest distances calculated."
        })
        return steps
    },
    'floyd-warshall': () => {
        const steps = []
        const dist = [
            [0, 3, 99, 7],
            [8, 0, 2, 99],
            [5, 99, 0, 1],
            [2, 99, 99, 0]
        ]
        steps.push({
            visualizationType: 'grid',
            grid: dist.map(row => [...row]),
            rowHeaders: ['0', '1', '2', '3'],
            colHeaders: ['0', '1', '2', '3'],
            message: "Floyd-Warshall Initialization: Direct edge weights (99 represents Infinity)."
        })
        const V = 4
        for (let k = 0; k < V; k++) {
            steps.push({
                visualizationType: 'grid',
                grid: dist.map(row => [...row]),
                rowHeaders: ['0', '1', '2', '3'],
                colHeaders: ['0', '1', '2', '3'],
                activeCells: [[k, k]],
                message: `Considering Node ${k} as intermediate node.`
            })
            for (let i = 0; i < V; i++) {
                for (let j = 0; j < V; j++) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j]
                        steps.push({
                            visualizationType: 'grid',
                            grid: dist.map(row => [...row]),
                            rowHeaders: ['0', '1', '2', '3'],
                            colHeaders: ['0', '1', '2', '3'],
                            activeCells: [[i, j]],
                            highlightedCells: [[i, k], [k, j]],
                            message: `Shortened path: dist[${i}][${j}] updated via node ${k} to ${dist[i][j]}.`
                        })
                    }
                }
            }
        }
        return steps
    },
    'scc': () => {
        const steps = []
        const nodes = [0, 1, 2, 3]
        const edges = [[0, 1], [1, 2], [2, 0], [2, 3]]
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [],
            current: null,
            message: "Kosaraju's SCC algorithm. Identify strongly connected components."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 2],
            current: 2,
            message: "DFS 1 (Finishing Times): Visit 0 -> 1 -> 2 -> 3. Finish order pushed to stack."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [],
            current: null,
            message: "Reverse the graph edges (transposing)."
        })
        const revEdges = [[1, 0], [2, 1], [0, 2], [3, 2]]
        steps.push({
            graphNodes: nodes,
            graphEdges: revEdges,
            visited: [],
            message: "Graph edges transposed. Now DFS 2 from finishing stack."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: revEdges,
            visited: [3],
            current: 3,
            message: "DFS 2 starting from Node 3. Component found: {3}."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: revEdges,
            visited: [3, 0, 1, 2],
            current: 0,
            message: "DFS 2 starting from Node 0. Transverse to 2 and 1. Component found: {0, 1, 2}."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: revEdges,
            visited: [3, 0, 1, 2],
            current: null,
            message: "Kosaraju complete! SCCs: {3} and {0,1,2}."
        })
        return steps
    },
    'bridges-articulation': () => {
        const steps = []
        const nodes = [0, 1, 2, 3]
        const edges = [[0, 1], [1, 2], [2, 0], [2, 3]]
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [],
            current: null,
            message: "Identify Bridges: edges whose removal disconnects the graph."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0],
            current: 0,
            message: "Run DFS from Node 0. Record discovery times."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 2, 3],
            current: 3,
            message: "DFS discovers Node 3. No back-edges from Node 3 to ancestors."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 2, 3],
            current: 2,
            message: "Low link value low[3] (3) > tin[2] (2). This confirms edge (2, 3) is a critical Bridge!"
        })
        return steps
    },
    'bipartite-check': () => {
        const steps = []
        const nodes = [0, 1, 2, 3]
        const edges = [[0, 1], [1, 2], [2, 3], [3, 0]]
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [],
            message: "Bipartite Check: Determine if we can color vertices with 2 colors without color conflicts."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0],
            current: 0,
            message: "Color Node 0 Red."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 3],
            current: 1,
            message: "Color neighbors Node 1 and Node 3 Blue."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 3, 2],
            current: 2,
            message: "Color Node 2 Red (neighbor of Node 1 and Node 3)."
        })
        steps.push({
            graphNodes: nodes,
            graphEdges: edges,
            visited: [0, 1, 3, 2],
            message: "Bipartite Check completed. All nodes colored successfully without conflict."
        })
        return steps
    },
    'network-flow': () => {
        const steps = []
        const capacity = [
            [0, 10, 10, 0],
            [0, 0, 4, 8],
            [0, 0, 0, 9],
            [0, 0, 0, 0]
        ]
        steps.push({
            visualizationType: 'grid',
            grid: capacity.map(row => [...row]),
            rowHeaders: ['Source 0', 'Node 1', 'Node 2', 'Sink 3'],
            colHeaders: ['0', '1', '2', '3'],
            message: "Max Flow (Edmonds-Karp): Initial edge capacities."
        })
        steps.push({
            visualizationType: 'grid',
            grid: capacity.map(row => [...row]),
            rowHeaders: ['Source 0', 'Node 1', 'Node 2', 'Sink 3'],
            colHeaders: ['0', '1', '2', '3'],
            activeCells: [[0, 1], [1, 3]],
            message: "Augmenting path found: 0 -> 1 -> 3. Path bottle-neck capacity is min(10, 8) = 8."
        })
        capacity[0][1] -= 8
        capacity[1][3] -= 8
        steps.push({
            visualizationType: 'grid',
            grid: capacity.map(row => [...row]),
            rowHeaders: ['Source 0', 'Node 1', 'Node 2', 'Sink 3'],
            colHeaders: ['0', '1', '2', '3'],
            successCells: [[0, 1], [1, 3]],
            message: "Pushed 8 units of flow. Residual capacity grid updated."
        })
        return steps
    },
    'call-stack': () => {
        const steps = []
        steps.push({
            array: ['factorial(1)'],
            comparing: [0],
            message: "Call Stack: factorial(1) hits base case n <= 1. Return 1.",
            line: 1
        })
        steps.push({
            array: ['factorial(2)', 'factorial(1)'],
            comparing: [1],
            message: "Pop factorial(1) from stack. factorial(2) calculates 2 * 1 = 2.",
            line: 2
        })
        steps.push({
            array: ['factorial(3)', 'factorial(2)'],
            comparing: [1],
            message: "Pop factorial(2) from stack. factorial(3) calculates 3 * 2 = 6.",
            line: 3
        })
        return steps
    },
    'recursive-tree': () => {
        const steps = []
        steps.push({
            treeNodes: ['fib(3)', 'fib(2)', 'fib(1)', 'fib(1)', 'fib(0)'],
            currentNode: 0,
            message: "Recursion tree for fib(3). Visit root node."
        })
        steps.push({
            treeNodes: ['fib(3)', 'fib(2)', 'fib(1)', 'fib(1)', 'fib(0)'],
            currentNode: 1,
            visitedNodes: [0],
            message: "Spawn left branch: fib(2)."
        })
        steps.push({
            treeNodes: ['fib(3)', 'fib(2)', 'fib(1)', 'fib(1)', 'fib(0)'],
            currentNode: 2,
            visitedNodes: [0, 1],
            message: "Spawn sub-branch: fib(1) (hits base case, return 1)."
        })
        return steps
    },
    'backtracking-basics': () => {
        const steps = []
        steps.push({
            array: ['_ ', '_ ', '_ '],
            comparing: [],
            message: "Backtracking Basics: Initialize empty state list."
        })
        steps.push({
            array: ['A', '_ ', '_ '],
            comparing: [0],
            message: "Choose 'A' for position 0."
        })
        steps.push({
            array: ['A', 'B', '_ '],
            comparing: [1],
            message: "Choose 'B' for position 1."
        })
        steps.push({
            array: ['A', '_ ', '_ '],
            swapping: [1],
            message: "Backtrack: Undo choice 'B' at position 1."
        })
        return steps
    },
    'sudoku-solver': () => {
        const steps = []
        const board = [
            ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
            ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
            ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
            ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
            ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
            ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
            ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
            ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
            ['.', '.', '.', '.', '8', '.', '.', '7', '9']
        ]
        steps.push({
            visualizationType: 'grid',
            grid: board.map(r => [...r]),
            activeCells: [[0, 2]],
            message: "Sudoku Backtracking: Explore cell (0, 2)."
        })
        board[0][2] = '1'
        steps.push({
            visualizationType: 'grid',
            grid: board.map(r => [...r]),
            activeCells: [[0, 2]],
            successCells: [[0, 2]],
            message: "Check row, column, and box constraints. Digit 1 is valid. Place 1."
        })
        steps.push({
            visualizationType: 'grid',
            grid: board.map(r => [...r]),
            activeCells: [[0, 3]],
            message: "Explore cell (0, 3)."
        })
        board[0][3] = '2'
        steps.push({
            visualizationType: 'grid',
            grid: board.map(r => [...r]),
            activeCells: [[0, 3]],
            successCells: [[0, 2], [0, 3]],
            message: "Place digit 2 at cell (0, 3)."
        })
        return steps
    },
    'rat-in-maze': () => {
        const steps = []
        const maze = [
            [1, 0, 0, 0],
            [1, 1, 0, 1],
            [0, 1, 0, 0],
            [1, 1, 1, 1]
        ]
        steps.push({
            visualizationType: 'grid',
            grid: maze.map(row => row.map(v => v === 1 ? '.' : '█')),
            activeCells: [[0, 0]],
            message: "Rat starts at position (0, 0)."
        })
        steps.push({
            visualizationType: 'grid',
            grid: maze.map(row => row.map(v => v === 1 ? '.' : '█')),
            activeCells: [[1, 0]],
            pathCells: [[0, 0]],
            message: "Move Down to (1, 0)."
        })
        steps.push({
            visualizationType: 'grid',
            grid: maze.map(row => row.map(v => v === 1 ? '.' : '█')),
            activeCells: [[1, 1]],
            pathCells: [[0, 0], [1, 0]],
            message: "Move Right to (1, 1)."
        })
        steps.push({
            visualizationType: 'grid',
            grid: maze.map(row => row.map(v => v === 1 ? '.' : '█')),
            activeCells: [[2, 1]],
            pathCells: [[0, 0], [1, 0], [1, 1]],
            message: "Move Down to (2, 1)."
        })
        steps.push({
            visualizationType: 'grid',
            grid: maze.map(row => row.map(v => v === 1 ? '.' : '█')),
            activeCells: [[3, 1]],
            pathCells: [[0, 0], [1, 0], [1, 1], [2, 1]],
            message: "Move Down to (3, 1)."
        })
        steps.push({
            visualizationType: 'grid',
            grid: maze.map(row => row.map(v => v === 1 ? '.' : '█')),
            activeCells: [[3, 3]],
            successCells: [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3]],
            message: "Path found to destination cell (3, 3)!"
        })
        return steps
    },
    'word-search': () => {
        const steps = []
        const board = [
            ['A', 'B', 'C', 'E'],
            ['S', 'F', 'C', 'S'],
            ['A', 'D', 'E', 'E']
        ]
        steps.push({
            visualizationType: 'grid',
            grid: board.map(r => [...r]),
            activeCells: [[0, 0]],
            message: "Search for word 'ABCCED'. Start at matching letter 'A' at (0, 0)."
        })
        steps.push({
            visualizationType: 'grid',
            grid: board.map(r => [...r]),
            activeCells: [[0, 1]],
            pathCells: [[0, 0]],
            message: "Match next letter 'B' at cell (0, 1)."
        })
        steps.push({
            visualizationType: 'grid',
            grid: board.map(r => [...r]),
            activeCells: [[0, 2]],
            pathCells: [[0, 0], [0, 1]],
            message: "Match next letter 'C' at cell (0, 2)."
        })
        steps.push({
            visualizationType: 'grid',
            grid: board.map(r => [...r]),
            activeCells: [[1, 2]],
            pathCells: [[0, 0], [0, 1], [0, 2]],
            message: "Match next letter 'C' at cell (1, 2)."
        })
        steps.push({
            visualizationType: 'grid',
            grid: board.map(r => [...r]),
            activeCells: [[2, 2]],
            pathCells: [[0, 0], [0, 1], [0, 2], [1, 2]],
            message: "Match next letter 'E' at cell (2, 2)."
        })
        steps.push({
            visualizationType: 'grid',
            grid: board.map(r => [...r]),
            activeCells: [[2, 1]],
            successCells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1]],
            message: "Match final letter 'D' at cell (2, 1). Word fully matched!"
        })
        return steps
    },
    'greedy-strategy': () => {
        const steps = []
        steps.push({
            array: [25, 10, 5, 1],
            comparing: [],
            message: "Greedy Strategy: Given denominations [25, 10, 5, 1], find minimum coins for amount 36."
        })
        steps.push({
            array: [25, 10, 5, 1],
            comparing: [0],
            message: "Take coin 25. Amount remaining = 36 - 25 = 11. Coin count = 1."
        })
        steps.push({
            array: [25, 10, 5, 1],
            comparing: [1],
            message: "Take coin 10. Amount remaining = 11 - 10 = 1. Coin count = 2."
        })
        steps.push({
            array: [25, 10, 5, 1],
            comparing: [3],
            message: "Take coin 1. Amount remaining = 1 - 1 = 0. Coin count = 3. Target amount reached!"
        })
        return steps
    },
    'fractional-knapsack': () => {
        const steps = []
        steps.push({
            array: [6, 5, 4],
            message: "Fractional Knapsack: Sort items by Value/Weight ratios: Item1 (Ratio=6), Item2 (Ratio=5), Item3 (Ratio=4)."
        })
        steps.push({
            array: [6, 5, 4],
            comparing: [0],
            message: "Take 100% of Item 1 (Weight=10, Value=60). Capacity left = 50 - 10 = 40. Knapsack value = 60."
        })
        steps.push({
            array: [6, 5, 4],
            comparing: [1],
            message: "Take 100% of Item 2 (Weight=20, Value=100). Capacity left = 40 - 20 = 20. Knapsack value = 160."
        })
        steps.push({
            array: [6, 5, 4],
            comparing: [2],
            message: "Item 3 has weight 30 but capacity left is 20. Take fraction: 20/30 (66.6%) of Item 3. Added value = 80. Total Value = 240."
        })
        return steps
    },
    'job-scheduling': () => {
        const steps = []
        steps.push({
            array: [100, 50, 40, 20],
            message: "Job Scheduling: Sort jobs in descending order of profit. Slots: [_, _, _]"
        })
        steps.push({
            array: [100, 50, 40, 20],
            comparing: [0],
            message: "Job 1 (Deadline 2, Profit 100) placed in latest slot 2. Slots: [_, 100, _]"
        })
        steps.push({
            array: [100, 50, 40, 20],
            comparing: [1],
            message: "Job 2 (Deadline 1, Profit 50) placed in slot 1. Slots: [50, 100, _]"
        })
        steps.push({
            array: [100, 50, 40, 20],
            comparing: [2],
            message: "Job 3 (Deadline 2, Profit 40) deadline slot is taken. No free slot. Job skipped."
        })
        return steps
    },
    'activity-selection': () => {
        const steps = []
        steps.push({
            array: [2, 4, 6, 8],
            message: "Activity Selection: Sort activities by end time. Activity 1 finishes at 2."
        })
        steps.push({
            array: [2, 4, 6, 8],
            comparing: [0],
            message: "Select Activity 1 (0 to 2). Last active finish time = 2."
        })
        steps.push({
            array: [2, 4, 6, 8],
            comparing: [1],
            message: "Activity 2 (3 to 4) starts after 2. Select Activity 2. Last active finish time = 4."
        })
        steps.push({
            array: [2, 4, 6, 8],
            comparing: [2],
            message: "Activity 3 (2 to 6) starts at 2, which is before 4. Skip Activity 3."
        })
        return steps
    },
    'merge-intervals': () => {
        const steps = []
        steps.push({
            array: [1, 2, 8, 15],
            message: "Merge Intervals: Sort intervals by start time: [1,3], [2,6], [8,10], [15,18]."
        })
        steps.push({
            array: [1, 2, 8, 15],
            comparing: [0, 1],
            message: "Interval [2,6] overlaps with [1,3] since 2 <= 3. Merge them into [1,6]."
        })
        steps.push({
            array: [1, 2, 8, 15],
            comparing: [1, 2],
            message: "Interval [8,10] does not overlap with [1,6]. Output [1,6] and start new merge interval [8,10]."
        })
        return steps
    },
    'closest-pair-points': () => {
        const steps = []
        steps.push({
            array: [2, 5, 9, 12, 18],
            message: "Closest Pair: Divide plane into two halves at Mid coordinate X=9."
        })
        steps.push({
            array: [2, 5, 9, 12, 18],
            comparing: [0, 1],
            message: "Find closest pair in left half: distance dL = 3."
        })
        steps.push({
            array: [2, 5, 9, 12, 18],
            comparing: [3, 4],
            message: "Find closest pair in right half: distance dR = 6."
        })
        steps.push({
            array: [2, 5, 9, 12, 18],
            comparing: [1, 3],
            message: "Search delta-strip centered at X=9 of width 2*d (d=3). Closest pair in strip is distance = 7. Minimum distance = 3."
        })
        return steps
    },
    'inversion-count': () => {
        const steps = []
        steps.push({
            array: [2, 4, 1, 3, 5],
            message: "Inversion Count: Split array into left [2, 4] and right [1, 3, 5]."
        })
        steps.push({
            array: [2, 4, 1, 3, 5],
            comparing: [1, 2],
            message: "Merge: compare Left[1]=4 and Right[0]=1. Since 4 > 1, all elements remaining in left partition form inversions. Add (mid - i + 1) = 2 inversions."
        })
        return steps
    },
    'dp-memoization': () => {
        const steps = []
        steps.push({
            array: [-1, -1, -1, -1, -1],
            message: "Memoization (Top-down): Initialize cache array with -1."
        })
        steps.push({
            array: [0, 1, -1, -1, -1],
            comparing: [0, 1],
            message: "Base cases memoized: cache[0]=0, cache[1]=1."
        })
        steps.push({
            array: [0, 1, 1, -1, -1],
            comparing: [2],
            message: "Calculate fib(2) = cache[1] + cache[0] = 1. Write cache[2]=1."
        })
        return steps
    },
    'dp-tabulation': () => {
        const steps = []
        steps.push({
            array: [0, 1, 0, 0, 0],
            message: "Tabulation (Bottom-up): Initialize array of size N. Fill base cases dp[0]=0, dp[1]=1."
        })
        for (let i = 2; i <= 4; i++) {
            steps.push({
                array: Array.from({ length: 5 }, (_, idx) => idx <= i ? (idx <= 1 ? idx : -1) : 0),
                comparing: [i - 1, i - 2],
                message: `Iterative step: calculate dp[${i}] = dp[${i-1}] + dp[${i-2}].`
            })
        }
        return steps
    },
    'dp-state-design': () => {
        const steps = []
        steps.push({
            array: [0, 0, 0, 0],
            message: "State Design: Define variables. Let dp[i] represent maximum subsets at length i."
        })
        return steps
    },
    'dp-state-transition': () => {
        const steps = []
        steps.push({
            array: [0, 0, 0, 0],
            message: "State Transition: mathematical equation dp[i] = dp[i-1] + dp[i-2]."
        })
        return steps
    },
    'edit-distance': () => {
        const steps = []
        const dp = [
            [0, 1, 2, 3],
            [1, 0, 0, 0],
            [2, 0, 0, 0],
            [3, 0, 0, 0]
        ]
        steps.push({
            visualizationType: 'grid',
            grid: dp.map(row => [...row]),
            rowHeaders: [' ', 'C', 'A', 'T'],
            colHeaders: [' ', 'C', 'A', 'R'],
            message: "Edit Distance (Levenshtein): Initialize table headers with delete/insert operations cost."
        })
        dp[1][1] = 0
        steps.push({
            visualizationType: 'grid',
            grid: dp.map(row => [...row]),
            rowHeaders: [' ', 'C', 'A', 'T'],
            colHeaders: [' ', 'C', 'A', 'R'],
            activeCells: [[1, 1]],
            highlightedCells: [[0, 0]],
            message: "Character match 'C' == 'C'. Cost dp[1][1] = dp[0][0] = 0."
        })
        dp[2][2] = 0
        steps.push({
            visualizationType: 'grid',
            grid: dp.map(row => [...row]),
            rowHeaders: [' ', 'C', 'A', 'T'],
            colHeaders: [' ', 'C', 'A', 'R'],
            activeCells: [[2, 2]],
            highlightedCells: [[1, 1]],
            message: "Character match 'A' == 'A'. Cost dp[2][2] = dp[1][1] = 0."
        })
        dp[3][3] = 1
        steps.push({
            visualizationType: 'grid',
            grid: dp.map(row => [...row]),
            rowHeaders: [' ', 'C', 'A', 'T'],
            colHeaders: [' ', 'C', 'A', 'R'],
            activeCells: [[3, 3]],
            highlightedCells: [[2, 3], [3, 2], [2, 2]],
            message: "Character mismatch 'T' !== 'R'. Cost = 1 + min(replace=dp[2][2], delete=dp[2][3], insert=dp[3][2]) = 1."
        })
        return steps
    },
    'matrix-chain': () => {
        const steps = []
        const dp = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
        steps.push({
            visualizationType: 'grid',
            grid: dp.map(row => [...row]),
            rowHeaders: ['1', '2', '3', '4'],
            colHeaders: ['1', '2', '3', '4'],
            message: "Matrix Chain Multiplication: Initialize DP table. Cost to multiply single matrix = 0."
        })
        dp[1][2] = 120
        steps.push({
            visualizationType: 'grid',
            grid: dp.map(row => [...row]),
            rowHeaders: ['1', '2', '3', '4'],
            colHeaders: ['1', '2', '3', '4'],
            activeCells: [[1, 2]],
            message: "Compute cost for range [1, 2] = A1 (10x20) * A2 (20x30) = 6000."
        })
        dp[1][3] = 300
        steps.push({
            visualizationType: 'grid',
            grid: dp.map(row => [...row]),
            rowHeaders: ['1', '2', '3', '4'],
            colHeaders: ['1', '2', '3', '4'],
            activeCells: [[1, 3]],
            highlightedCells: [[1, 2], [2, 3]],
            message: "Compute cost for range [1, 3] by checking partitions split points (1, 2)."
        })
        return steps
    },
    'partition-dp': () => {
        const steps = []
        steps.push({
            array: [0, 0, 0, 0],
            message: "Partition DP: Solve Palindrome Partitioning II for string 'aab'."
        })
        steps.push({
            array: [0, 0, 1, 1],
            comparing: [0, 1],
            message: "Subsegment 'aa' is a palindrome. Min cut for prefix 'aa' = 0."
        })
        steps.push({
            array: [0, 0, 1, 1],
            comparing: [2],
            message: "Character 'b' is not a palindrome. Check partition points: cut('aa') + 1 = 1 cut."
        })
        return steps
    },
    'digit-dp': () => {
        const steps = []
        steps.push({
            array: [0, 0, 0],
            message: "Digit DP: Count numbers with sum equal to X under tight/loose bounds."
        })
        steps.push({
            array: [1, 0, 0],
            comparing: [0],
            message: "Position 0: Place digit 1 (tight limit)."
        })
        steps.push({
            array: [1, 2, 0],
            comparing: [1],
            message: "Position 1: Place digit 2 (loose limit)."
        })
        return steps
    },
    'tree-dp': () => {
        const steps = []
        steps.push({
            treeNodes: ['Node0', 'Node1', 'Node2', 'Node3', 'Node4'],
            message: "Tree DP: Maximum Independent Set (House Robber III) on tree."
        })
        steps.push({
            treeNodes: ['Node0', 'Node1', 'Node2', 'Node3', 'Node4'],
            currentNode: 3,
            message: "DFS visits Leaf Node 3. DP states: [rob=3, skip=0]."
        })
        steps.push({
            treeNodes: ['Node0', 'Node1', 'Node2', 'Node3', 'Node4'],
            currentNode: 1,
            visitedNodes: [3],
            message: "DFS visits Node 1. Compute state from children: rob=1+0=1, skip=max(3,0)=3."
        })
        return steps
    },
    'bitmask-dp': () => {
        const steps = []
        steps.push({
            array: [0, 0, 0, 0],
            message: "Bitmask DP: Travelling Salesman Problem (TSP) for 4 nodes. mask=0001 (Node 0 visited)."
        })
        steps.push({
            array: [0, 0, 0, 0],
            comparing: [0],
            message: "Current node: 0. Visited mask = 0001."
        })
        steps.push({
            array: [0, 0, 0, 0],
            comparing: [1],
            message: "Transition to Node 1: mask becomes 0001 | 0010 = 0011."
        })
        return steps
    },
    'interval-dp': () => {
        const steps = []
        steps.push({
            array: [0, 0, 0, 0],
            message: "Interval DP: Solve Burst Balloons for length L=1."
        })
        steps.push({
            array: [0, 0, 0, 0],
            message: "Iteratively increase length L=2, evaluate transitions."
        })
        return steps
    }
};

const allGenerators = {
    ...phase10to13Generators,
    ...newGenerators,
    ...phase5to9Generators,
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
    ...complexityGenerators,
    ...trieGenerators,

    // Aliases for Roadmap algorithmIds
    'kadane': arraysGenerators['kadanes'],
    'moore-voting': newGenerators['majority-element'],
    'linked-list': linkedListsGenerators['singly-linked-list'],
    'stack': stacksGenerators['stack-impl'],
    'queue': queuesGenerators['queue-impl'],
    'hash-table': hashingGenerators['linear-probing'],
    'merge-sort': sortingGenerators['merge'],
    'divide-and-conquer-merge-sort': sortingGenerators['merge'],
    'quick-sort': sortingGenerators['quick'],
    'divide-and-conquer-quick-sort': sortingGenerators['quick'],
    'heap-sort': sortingGenerators['heap'],
    'max-heap': sortingGenerators['heap'],
    'bfs': graphsGenerators['graph-bfs'],
    'dfs': graphsGenerators['graph-dfs'],
    'pattern-bfs': graphsGenerators['graph-bfs'],
    'pattern-dfs': graphsGenerators['graph-dfs'],
    'bst': treesGenerators['bst-impl'],
    'trie': trieGenerators['trie-prefix-search'],
    'pattern-trie': trieGenerators['trie-prefix-search'],
    'monotonic-stack': newGenerators['next-greater-element'] || stacksGenerators['next-greater-element'],
    'union-find': advancedGenerators['dsu'],
}

const generateRandomArray = (size = 10, max = 100) => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1)
}

const generateRandomGraph = (nodeCount = 6) => {
    const count = Math.min(Math.max(nodeCount, 3), 10)
    const nodes = Array.from({ length: count }, (_, i) => i)
    const edges = []
    for (let i = 0; i < count; i++) {
        const numEdges = Math.floor(Math.random() * 2) + 1
        for (let k = 0; k < numEdges; k++) {
            const potentialTarget = Math.floor(Math.random() * count)
            if (potentialTarget !== i) {
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

const AlgorithmDepthPanel = ({ algorithm }) => {
    if (!algorithm) return null
    const objectives = algorithm.learningObjectives || []
    const visualWalkthrough = algorithm.visualWalkthrough || []
    const edgeCases = algorithm.edgeCases || []
    const revisionPrompts = algorithm.revisionPrompts || []

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
        >
            <GlassPanel>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Concept Depth</h2>
                            <p className="text-gray-300">{algorithm.beginnerExplanation || algorithm.description}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <h3 className="font-semibold text-google-blue mb-2">Learning Objectives</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    {objectives.map((item) => <li key={item}>- {item}</li>)}
                                </ul>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <h3 className="font-semibold text-google-green mb-2">Mental Model</h3>
                                <p className="text-sm text-gray-300">{algorithm.mentalModel}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <h3 className="font-semibold text-google-yellow mb-2">{algorithm.workedExample?.title || 'Worked Example'}</h3>
                            <p className="text-sm text-gray-300 mb-3">{algorithm.workedExample?.body}</p>
                            <div className="grid md:grid-cols-4 gap-2">
                                {visualWalkthrough.map((step, index) => (
                                    <div key={step} className="p-3 rounded-lg bg-black/20">
                                        <p className="text-xs text-google-blue">Step {index + 1}</p>
                                        <p className="text-sm text-gray-300">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <h3 className="font-semibold mb-2">Complexity Reasoning</h3>
                            <p className="text-sm text-gray-300">{algorithm.complexityReasoning?.body}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <h3 className="font-semibold mb-2">Edge Cases</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                {edgeCases.map((item) => <li key={item}>- {item}</li>)}
                            </ul>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <h3 className="font-semibold mb-2">Revision Prompts</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                {revisionPrompts.map((item) => <li key={item}>- {item}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </GlassPanel>
        </motion.div>
    )
}

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

const LINE_MAPPINGS = {
    bubble: {
        javascript: { 3: 4, 4: 5, 6: 9 },
        python: { 3: 4, 4: 5, 6: 6 },
        java: { 3: 4, 4: 6, 6: 10 },
        cpp: { 3: 3, 4: 4, 6: 7 }
    },
    selection: {
        javascript: { 4: 5, 7: 7, 9: 9 },
        python: { 4: 5, 7: 7, 9: 8 },
        java: { 4: 5, 7: 8, 9: 10 },
        cpp: { 4: 5, 7: 7, 9: 8 }
    },
    insertion: {
        javascript: { 4: 4, 5: 5, 8: 10 },
        python: { 4: 4, 5: 5, 8: 8 },
        java: { 4: 4, 5: 5, 8: 8 },
        cpp: { 4: 4, 5: 5, 8: 8 }
    }
};

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
                const data = await apiFetch(`/api/algorithms/${category}`)
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
                <span className="ml-3 text-lg">Loading algorithms Please Wait 60 seconds...</span>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-red-400 text-lg mb-4">Error: {error}</p>
                <p className="text-gray-400">Server error</p>
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
                                        type={currentStepData?.visualizationType || getVisualizationType(category)}
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
                                        ${(() => {
                                            const algoId = selectedAlgorithm?.id;
                                            const mappedLine = LINE_MAPPINGS[algoId]?.[selectedLanguage]?.[currentStepData.line] ?? currentStepData.line;
                                            return hasVisualization && mappedLine === idx;
                                        })()
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
            <AlgorithmDepthPanel algorithm={selectedAlgorithm} />
            <ExamMode algorithm={selectedAlgorithm} />
        </div>
    )
}
