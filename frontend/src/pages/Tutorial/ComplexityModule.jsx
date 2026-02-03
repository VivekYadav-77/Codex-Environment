import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { Calculator, Info, TrendingUp } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { GlassPanel } from '../../components/ui/Glass'

const complexities = [
    { name: 'O(1)', color: '#34A853', fn: () => 1 },
    { name: 'O(log n)', color: '#4285F4', fn: (n) => Math.log2(n) },
    { name: 'O(n)', color: '#FBBC05', fn: (n) => n },
    { name: 'O(n log n)', color: '#FF9800', fn: (n) => n * Math.log2(n) },
    { name: 'O(n²)', color: '#EA4335', fn: (n) => n * n },
    { name: 'O(2ⁿ)', color: '#9C27B0', fn: (n) => Math.pow(2, Math.min(n, 20)) },
]

const complexityInfo = {
    'O(1)': {
        title: 'Constant Time',
        description: 'Operations take the same time regardless of input size.',
        examples: ['Array access by index', 'Hash table lookup', 'Push/pop from stack'],
    },
    'O(log n)': {
        title: 'Logarithmic Time',
        description: 'Problem size halves with each step. Very efficient!',
        examples: ['Binary search', 'Binary tree operations', 'Finding in sorted array'],
    },
    'O(n)': {
        title: 'Linear Time',
        description: 'Time grows proportionally with input size.',
        examples: ['Linear search', 'Array traversal', 'Finding max/min'],
    },
    'O(n log n)': {
        title: 'Linearithmic Time',
        description: 'Slightly worse than linear, common in efficient sorting.',
        examples: ['Merge sort', 'Quick sort (average)', 'Heap sort'],
    },
    'O(n²)': {
        title: 'Quadratic Time',
        description: 'Time grows with square of input. Gets slow fast!',
        examples: ['Bubble sort', 'Insertion sort', 'Nested loops'],
    },
    'O(2ⁿ)': {
        title: 'Exponential Time',
        description: 'Doubles with each element. Only for tiny inputs!',
        examples: ['Recursive Fibonacci', 'Power set', 'Brute force subsets'],
    },
}

export default function ComplexityModule() {
    const [inputN, setInputN] = useState(10)
    const [selectedComplexity, setSelectedComplexity] = useState('O(n)')

    const chartData = useMemo(() => {
        const data = []
        const maxN = Math.min(inputN, 50)

        for (let n = 1; n <= maxN; n++) {
            const point = { n }
            complexities.forEach(({ name, fn }) => {
                point[name] = Math.min(fn(n), 10000) // Cap for visualization
            })
            data.push(point)
        }
        return data
    }, [inputN])

    const selectedInfo = complexityInfo[selectedComplexity]

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    <TrendingUp className="inline mr-3 text-google-blue" />
                    Big O Complexity
                </h1>
                <p className="text-gray-400 text-lg">
                    Understand how algorithms scale with input size
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassPanel className="h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Growth Comparison</h2>
                            <div className="flex items-center gap-3">
                                <label className="text-gray-400">n =</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={inputN}
                                    onChange={(e) => setInputN(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                    className="glass-input w-20 text-center"
                                />
                            </div>
                        </div>

                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="n"
                                        stroke="#888"
                                        label={{ value: 'Input Size (n)', position: 'bottom', fill: '#888' }}
                                    />
                                    <YAxis
                                        stroke="#888"
                                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                        label={{ value: 'Operations', angle: -90, position: 'left', fill: '#888' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0,0,0,0.9)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px'
                                        }}
                                        labelFormatter={(n) => `n = ${n}`}
                                    />
                                    <Legend />
                                    {complexities.map(({ name, color }) => (
                                        <Line
                                            key={name}
                                            type="monotone"
                                            dataKey={name}
                                            stroke={color}
                                            strokeWidth={selectedComplexity === name ? 3 : 1.5}
                                            dot={false}
                                            opacity={selectedComplexity === name ? 1 : 0.5}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                            {complexities.slice(0, 3).map(({ name, fn }) => (
                                <div key={name} className="text-center">
                                    <p className="text-sm text-gray-400">{name}</p>
                                    <p className="text-2xl font-bold text-white">
                                        {fn(inputN).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">operations</p>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </motion.div>

                {/* Sidebar */}
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Complexity Selector */}
                    <GlassPanel>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Calculator size={20} className="text-google-blue" />
                            Select Complexity
                        </h3>
                        <div className="space-y-2">
                            {complexities.map(({ name, color }) => (
                                <motion.button
                                    key={name}
                                    className={`
                    w-full px-4 py-3 rounded-lg text-left flex items-center gap-3
                    transition-colors
                    ${selectedComplexity === name
                                            ? 'bg-white/10 border border-white/20'
                                            : 'hover:bg-white/5'
                                        }
                  `}
                                    onClick={() => setSelectedComplexity(name)}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="font-mono font-medium">{name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </GlassPanel>

                    {/* Info Card */}
                    <Card accent="blue" icon={Info} title={selectedInfo.title}>
                        <p className="text-gray-400 mb-4">{selectedInfo.description}</p>
                        <div>
                            <p className="text-sm font-semibold text-gray-300 mb-2">Examples:</p>
                            <ul className="space-y-1">
                                {selectedInfo.examples.map((ex) => (
                                    <li key={ex} className="text-sm text-gray-400 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-google-blue" />
                                        {ex}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Comparison Table */}
            <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <GlassPanel>
                    <h3 className="text-xl font-semibold mb-4">At a Glance: n = {inputN}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Complexity</th>
                                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Operations</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complexities.map(({ name, color, fn }) => {
                                    const ops = fn(inputN)
                                    let rating = 'Excellent'
                                    let ratingColor = 'text-google-green'
                                    if (ops > 100) { rating = 'Good'; ratingColor = 'text-google-blue' }
                                    if (ops > 1000) { rating = 'Fair'; ratingColor = 'text-google-yellow' }
                                    if (ops > 10000) { rating = 'Slow'; ratingColor = 'text-orange-500' }
                                    if (ops > 100000) { rating = 'Very Slow'; ratingColor = 'text-google-red' }

                                    return (
                                        <tr key={name} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <span className="font-mono">{name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono">
                                                {ops.toLocaleString()}
                                            </td>
                                            <td className={`py-3 px-4 font-medium ${ratingColor}`}>
                                                {rating}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </GlassPanel>
            </motion.div>
        </div>
    )
}
