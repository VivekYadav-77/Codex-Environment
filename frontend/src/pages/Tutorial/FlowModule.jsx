import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    GitBranch,
    Play,
    Pause,
    SkipForward,
    SkipBack,
    RotateCcw,
    Layers,
    ArrowRight
} from 'lucide-react'
import { Button, IconButton } from '../../components/ui/Button'
import { GlassPanel } from '../../components/ui/Glass'
import { Card } from '../../components/ui/Card'

// Factorial example for recursion visualization
const factorialSteps = [
    { call: 'factorial(5)', stack: ['factorial(5)'], result: null, line: 1 },
    { call: 'factorial(4)', stack: ['factorial(5)', 'factorial(4)'], result: null, line: 2 },
    { call: 'factorial(3)', stack: ['factorial(5)', 'factorial(4)', 'factorial(3)'], result: null, line: 2 },
    { call: 'factorial(2)', stack: ['factorial(5)', 'factorial(4)', 'factorial(3)', 'factorial(2)'], result: null, line: 2 },
    { call: 'factorial(1)', stack: ['factorial(5)', 'factorial(4)', 'factorial(3)', 'factorial(2)', 'factorial(1)'], result: null, line: 2 },
    { call: 'factorial(0)', stack: ['factorial(5)', 'factorial(4)', 'factorial(3)', 'factorial(2)', 'factorial(1)', 'factorial(0)'], result: 1, line: 3 },
    { call: 'return 1', stack: ['factorial(5)', 'factorial(4)', 'factorial(3)', 'factorial(2)', 'factorial(1)'], result: 1, line: 4 },
    { call: 'return 1×1=1', stack: ['factorial(5)', 'factorial(4)', 'factorial(3)', 'factorial(2)'], result: 1, line: 4 },
    { call: 'return 2×1=2', stack: ['factorial(5)', 'factorial(4)', 'factorial(3)'], result: 2, line: 4 },
    { call: 'return 3×2=6', stack: ['factorial(5)', 'factorial(4)'], result: 6, line: 4 },
    { call: 'return 4×6=24', stack: ['factorial(5)'], result: 24, line: 4 },
    { call: 'return 5×24=120', stack: [], result: 120, line: 4 },
]

const iterativeSteps = [
    { i: '-', result: 1, line: 1 },
    { i: 1, result: 1, line: 2 },
    { i: 2, result: 2, line: 2 },
    { i: 3, result: 6, line: 2 },
    { i: 4, result: 24, line: 2 },
    { i: 5, result: 120, line: 2 },
]

const codeRecursive = `function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}`

const codeIterative = `function factorial(n) {
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}`

export default function FlowModule() {
    const [mode, setMode] = useState('recursive') // recursive | iterative
    const [currentStep, setCurrentStep] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState(1000)

    const steps = mode === 'recursive' ? factorialSteps : iterativeSteps
    const code = mode === 'recursive' ? codeRecursive : codeIterative
    const currentStepData = steps[currentStep]

    useEffect(() => {
        let interval
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev >= steps.length - 1) {
                        setIsPlaying(false)
                        return prev
                    }
                    return prev + 1
                })
            }, speed)
        }
        return () => clearInterval(interval)
    }, [isPlaying, speed, steps.length])

    const reset = () => {
        setCurrentStep(0)
        setIsPlaying(false)
    }

    const stepForward = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const stepBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    <GitBranch className="inline mr-3 text-google-green" />
                    Recursion vs Iteration
                </h1>
                <p className="text-gray-400 text-lg">
                    Visualize how the call stack grows with recursion
                </p>
            </motion.div>

            {/* Mode Toggle */}
            <motion.div
                className="flex gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Button
                    variant={mode === 'recursive' ? 'blue' : 'glass'}
                    onClick={() => { setMode('recursive'); reset(); }}
                    icon={GitBranch}
                >
                    Recursive
                </Button>
                <Button
                    variant={mode === 'iterative' ? 'green' : 'glass'}
                    onClick={() => { setMode('iterative'); reset(); }}
                    icon={Layers}
                >
                    Iterative
                </Button>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Code Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassPanel className="h-full">
                        <h3 className="text-lg font-semibold mb-4">Code</h3>
                        <div className="font-mono text-sm">
                            {code.split('\n').map((line, idx) => (
                                <div
                                    key={idx}
                                    className={`
                    px-4 py-1 -mx-2 rounded transition-colors
                    ${currentStepData.line === idx
                                            ? 'bg-google-blue/20 border-l-2 border-google-blue'
                                            : ''
                                        }
                  `}
                                >
                                    <span className="text-gray-500 mr-4">{idx + 1}</span>
                                    <span className="text-gray-300">{line}</span>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </motion.div>

                {/* Visualization Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <GlassPanel className="h-full">
                        <h3 className="text-lg font-semibold mb-4">
                            {mode === 'recursive' ? 'Call Stack' : 'Variables'}
                        </h3>

                        {mode === 'recursive' ? (
                            // Call Stack Visualization
                            <div className="space-y-2 min-h-[200px]">
                                <AnimatePresence mode="popLayout">
                                    {currentStepData.stack.map((call, idx) => (
                                        <motion.div
                                            key={`${call}-${idx}`}
                                            initial={{ opacity: 0, x: -50, scale: 0.8 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: 50, scale: 0.8 }}
                                            className={`
                        px-4 py-3 rounded-lg font-mono text-sm
                        ${idx === currentStepData.stack.length - 1
                                                    ? 'bg-google-blue/30 border border-google-blue/50'
                                                    : 'bg-white/5 border border-white/10'
                                                }
                      `}
                                        >
                                            {call}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {currentStepData.stack.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <p className="text-gray-400 mb-2">Stack Empty</p>
                                        <p className="text-4xl font-bold text-google-green">
                                            Result: {currentStepData.result}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            // Iterative Variables
                            <div className="flex gap-8 justify-center py-8">
                                <div className="text-center">
                                    <p className="text-sm text-gray-400 mb-2">i</p>
                                    <motion.p
                                        key={currentStepData.i}
                                        initial={{ scale: 1.5, color: '#4285F4' }}
                                        animate={{ scale: 1, color: '#ffffff' }}
                                        className="text-4xl font-bold font-mono"
                                    >
                                        {currentStepData.i}
                                    </motion.p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-400 mb-2">result</p>
                                    <motion.p
                                        key={currentStepData.result}
                                        initial={{ scale: 1.5, color: '#34A853' }}
                                        animate={{ scale: 1, color: '#ffffff' }}
                                        className="text-4xl font-bold font-mono"
                                    >
                                        {currentStepData.result}
                                    </motion.p>
                                </div>
                            </div>
                        )}

                        {/* Current Action */}
                        {mode === 'recursive' && currentStepData.call && (
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10"
                            >
                                <p className="text-sm text-gray-400">Current Action:</p>
                                <p className="text-white font-mono">{currentStepData.call}</p>
                            </motion.div>
                        )}
                    </GlassPanel>
                </motion.div>
            </div>

            {/* Playback Controls */}
            <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <GlassPanel>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Progress */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <span className="text-sm text-gray-400">
                                Step {currentStep + 1} / {steps.length}
                            </span>
                            <div className="flex-1 md:w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-google-blue to-google-green"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                    transition={{ type: 'spring', stiffness: 100 }}
                                />
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                            <IconButton icon={RotateCcw} onClick={reset} />
                            <IconButton icon={SkipBack} onClick={stepBack} />
                            <IconButton
                                icon={isPlaying ? Pause : Play}
                                variant="blue"
                                onClick={() => setIsPlaying(!isPlaying)}
                            />
                            <IconButton icon={SkipForward} onClick={stepForward} />
                        </div>

                        {/* Speed */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Speed:</span>
                            <select
                                value={speed}
                                onChange={(e) => setSpeed(Number(e.target.value))}
                                className="glass-input px-3 py-2 text-sm"
                            >
                                <option value={2000}>0.5x</option>
                                <option value={1000}>1x</option>
                                <option value={500}>2x</option>
                                <option value={250}>4x</option>
                            </select>
                        </div>
                    </div>
                </GlassPanel>
            </motion.div>

            {/* Memory Comparison */}
            <motion.div
                className="grid md:grid-cols-2 gap-6 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card accent="blue" title="Recursive Approach">
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex items-center gap-2">
                            <ArrowRight size={14} className="text-google-blue" />
                            Uses O(n) stack space
                        </li>
                        <li className="flex items-center gap-2">
                            <ArrowRight size={14} className="text-google-blue" />
                            Risk of stack overflow for large n
                        </li>
                        <li className="flex items-center gap-2">
                            <ArrowRight size={14} className="text-google-blue" />
                            More elegant and readable
                        </li>
                    </ul>
                </Card>
                <Card accent="green" title="Iterative Approach">
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex items-center gap-2">
                            <ArrowRight size={14} className="text-google-green" />
                            Uses O(1) stack space
                        </li>
                        <li className="flex items-center gap-2">
                            <ArrowRight size={14} className="text-google-green" />
                            No stack overflow risk
                        </li>
                        <li className="flex items-center gap-2">
                            <ArrowRight size={14} className="text-google-green" />
                            Generally faster execution
                        </li>
                    </ul>
                </Card>
            </motion.div>
        </div>
    )
}
