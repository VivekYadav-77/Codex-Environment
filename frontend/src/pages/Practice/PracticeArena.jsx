import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import Editor from '@monaco-editor/react'
import {
    PenTool,
    Lightbulb,
    Send,
    CheckCircle,
    RefreshCw,
    Loader2,
    Play,
    Terminal
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { GlassPanel } from '../../components/ui/Glass'
import {
    setCurrentQuestion,
    setCode,
    setLanguage,
    requestHint,
    addHint,
    submitForReview,
    setReviewResult,
    setEditorReady,
} from '../../store/slices/practiceSlice'

// Simple Markdown Renderer Component
const SimpleMarkdown = ({ content }) => {
    if (!content) return null

    const renderLine = (line, index) => {
        // H2 headers (## )
        if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold text-white mt-4 mb-2">{renderInline(line.slice(3))}</h2>
        }
        // H3 headers (### )
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-semibold text-google-blue mt-3 mb-2">{renderInline(line.slice(4))}</h3>
        }
        // Horizontal rule
        if (line.trim() === '---') {
            return <hr key={index} className="border-white/20 my-3" />
        }
        // Bullet points
        if (line.startsWith('- ')) {
            return (
                <div key={index} className="flex items-start gap-2 ml-2 my-1">
                    <span className="text-google-blue mt-1">•</span>
                    <span className="text-gray-300">{renderInline(line.slice(2))}</span>
                </div>
            )
        }
        // Empty lines
        if (line.trim() === '') {
            return <div key={index} className="h-2" />
        }
        // Regular text
        return <p key={index} className="text-gray-300 my-1">{renderInline(line)}</p>
    }

    const renderInline = (text) => {
        // Bold (**text**)
        const parts = text.split(/(\*\*[^*]+\*\*)/g)
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
            }
            // Inline code (`code`)
            if (part.includes('`')) {
                const codeParts = part.split(/(`[^`]+`)/g)
                return codeParts.map((cp, j) => {
                    if (cp.startsWith('`') && cp.endsWith('`')) {
                        return <code key={j} className="bg-white/10 px-1 rounded text-google-yellow font-mono text-sm">{cp.slice(1, -1)}</code>
                    }
                    return cp
                })
            }
            return part
        })
    }

    const lines = content.split('\n')
    return <div className="space-y-0">{lines.map(renderLine)}</div>
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'

// Fetch questions from API
const fetchQuestions = async (topic) => {
    try {
        const response = await fetch(`${API_BASE}/questions/${topic}`)
        if (!response.ok) throw new Error('Failed to fetch questions')
        return await response.json()
    } catch (error) {
        console.error('Error fetching questions:', error)
        return []
    }
}

// Request AI hint via API
const requestAIHint = async (code, question, previousHints) => {
    try {
        const response = await fetch(`${API_BASE}/ai/hint`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, question, previousHints })
        })
        if (!response.ok) throw new Error('Failed to get hint')
        const data = await response.json()
        return data.hint
    } catch (error) {
        console.error('Error getting hint:', error)
        return "💡 Try breaking down the problem into smaller steps."
    }
}

// Request AI code review via API
const requestAIReview = async (code, question, language) => {
    try {
        console.log('Sending review request...', { code: code?.substring(0, 50), question: question?.title, language })
        const response = await fetch(`${API_BASE}/ai/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, question, language })
        })
        console.log('Response status:', response.status)
        if (!response.ok) {
            const errorText = await response.text()
            console.error('Response error:', errorText)
            throw new Error('Failed to get review')
        }
        const result = await response.json()
        console.log('Review result:', result)
        return result
    } catch (error) {
        console.error('Error getting review:', error)
        return {
            reviewText: "⚠️ Could not get review. Please make sure the server is running and try again."
        }
    }
}

// Run code via API
const runCode = async (code, language) => {
    try {
        const response = await fetch(`${API_BASE}/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language })
        })
        if (!response.ok) throw new Error('Failed to run code')
        return await response.json()
    } catch (error) {
        console.error('Error running code:', error)
        return {
            success: false,
            output: '',
            error: "⚠️ Could not run code. Make sure the server is running."
        }
    }
}

export default function PracticeArena() {
    const { topic = 'hashing' } = useParams()
    const dispatch = useDispatch()
    const {
        currentQuestion,
        code,
        language,
        aiHints,
        isRequestingHint,
        reviewResult,
        isSubmitting,
        editorReady,
    } = useSelector((state) => state.practice)

    const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0)
    const [topicQuestions, setTopicQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [executionOutput, setExecutionOutput] = useState(null)
    const [isRunning, setIsRunning] = useState(false)

    // Fetch questions when topic changes
    useEffect(() => {
        const loadQuestions = async () => {
            setLoading(true)
            setError(null)
            const questions = await fetchQuestions(topic)
            if (questions.length === 0) {
                setError(`No questions found for topic: ${topic}`)
            }
            setTopicQuestions(questions)
            setSelectedQuestionIdx(0)
            setLoading(false)
        }
        loadQuestions()
    }, [topic])

    // Update current question when selection changes
    useEffect(() => {
        if (topicQuestions[selectedQuestionIdx]) {
            dispatch(setCurrentQuestion(topicQuestions[selectedQuestionIdx]))
            dispatch(setCode(topicQuestions[selectedQuestionIdx].starterCode?.[language] || '// Start coding here'))
        }
    }, [topicQuestions, selectedQuestionIdx, dispatch, language])

    const handleEditorChange = (value) => {
        dispatch(setCode(value || ''))
    }

    const handleGetHint = async () => {
        dispatch(requestHint())
        const hint = await requestAIHint(code, currentQuestion, aiHints)
        dispatch(addHint(hint))
    }

    const handleSubmit = async () => {
        dispatch(submitForReview())
        const result = await requestAIReview(code, currentQuestion, language)
        dispatch(setReviewResult(result))
    }

    const handleReset = () => {
        dispatch(setCode(currentQuestion?.starterCode?.[language] || '// Start coding here'))
        dispatch(setReviewResult(null))
        setExecutionOutput(null)
    }

    const handleRun = async () => {
        setIsRunning(true)
        setExecutionOutput(null)
        const result = await runCode(code, language)
        setExecutionOutput(result)
        setIsRunning(false)
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-google-blue" />
                <p className="text-gray-400">Loading questions for {topic}...</p>
            </div>
        )
    }

    // Error state
    if (error || !currentQuestion) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-gray-400">{error || 'No questions available'}</p>
                <p className="text-sm text-gray-500">Make sure the backend server is running on port 3000</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    <PenTool className="inline mr-3 text-google-red" />
                    Practice Arena
                </h1>
                <p className="text-gray-400">
                    Solve problems with AI-powered Socratic hints
                </p>
            </motion.div>

            {/* Question Selector */}
            <motion.div
                className="flex flex-wrap gap-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {topicQuestions.map((q, idx) => (
                    <Button
                        key={q.id}
                        variant={selectedQuestionIdx === idx ? 'blue' : 'glass'}
                        size="sm"
                        onClick={() => setSelectedQuestionIdx(idx)}
                    >
                        {q.title}
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${q.difficulty === 'Easy' ? 'bg-google-green/20 text-google-green' :
                            q.difficulty === 'Medium' ? 'bg-google-yellow/20 text-google-yellow' :
                                'bg-google-red/20 text-google-red'
                            }`}>
                            {q.difficulty}
                        </span>
                    </Button>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Panel - Question & Hints */}
                <div className="space-y-6">
                    {/* Question Description */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlassPanel>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">{currentQuestion.title}</h2>
                                <span className={`text-sm px-3 py-1 rounded-full ${currentQuestion.difficulty === 'Easy' ? 'bg-google-green/20 text-google-green' :
                                    currentQuestion.difficulty === 'Medium' ? 'bg-google-yellow/20 text-google-yellow' :
                                        'bg-google-red/20 text-google-red'
                                    }`}>
                                    {currentQuestion.difficulty}
                                </span>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <p className="text-gray-300 whitespace-pre-line mb-4">
                                    {currentQuestion.description}
                                </p>

                                {currentQuestion.examples.map((ex, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-lg p-4 mb-3">
                                        <p className="text-sm text-gray-400 mb-1">Example {idx + 1}:</p>
                                        <p className="font-mono text-sm">
                                            <span className="text-gray-400">Input: </span>
                                            <span className="text-white">{ex.input}</span>
                                        </p>
                                        <p className="font-mono text-sm">
                                            <span className="text-gray-400">Output: </span>
                                            <span className="text-google-green">{ex.output}</span>
                                        </p>
                                        {ex.explanation && (
                                            <p className="text-sm text-gray-400 mt-1">{ex.explanation}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </GlassPanel>
                    </motion.div>

                    {/* AI Hints */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <GlassPanel>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Lightbulb size={20} className="text-google-yellow" />
                                    AI Hints
                                </h3>
                                <Button
                                    variant="glass"
                                    size="sm"
                                    onClick={handleGetHint}
                                    loading={isRequestingHint}
                                    icon={Lightbulb}
                                >
                                    Get Hint
                                </Button>
                            </div>

                            {aiHints.length === 0 ? (
                                <p className="text-gray-400 text-sm">
                                    Stuck? Ask for a hint! The AI will guide you without giving away the answer.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {aiHints.map((hint) => (
                                        <motion.div
                                            key={hint.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-lg bg-google-yellow/10 border border-google-yellow/20"
                                        >
                                            <p className="text-sm text-gray-300">{hint.content}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </GlassPanel>
                    </motion.div>

                    {/* Review Result */}
                    {reviewResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <GlassPanel className="border border-google-blue/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle size={20} className="text-google-blue" />
                                    <h3 className="text-lg font-semibold">AI Code Review</h3>
                                </div>
                                <div className="max-w-none">
                                    <SimpleMarkdown content={reviewResult.reviewText || reviewResult.error || 'No feedback available'} />
                                </div>
                            </GlassPanel>
                        </motion.div>
                    )}
                </div>

                {/* Right Panel - Editor */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassPanel className="h-full flex flex-col">
                        {/* Editor Header */}
                        <div className="flex items-center justify-between mb-4">
                            <select
                                value={language}
                                onChange={(e) => dispatch(setLanguage(e.target.value))}
                                className="glass-input px-3 py-2 text-sm"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                            <Button
                                variant="glass"
                                size="sm"
                                icon={RefreshCw}
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                        </div>

                        {/* Monaco Editor */}
                        <div className="flex-1 rounded-lg overflow-hidden border border-white/10 min-h-[400px]">
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                onChange={handleEditorChange}
                                onMount={() => dispatch(setEditorReady(true))}
                                theme="vs-dark"
                                options={{
                                    fontSize: 14,
                                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    padding: { top: 16 },
                                    lineNumbers: 'on',
                                    automaticLayout: true,
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-3">
                            <Button
                                variant="green"
                                className="flex-1"
                                icon={Play}
                                onClick={handleRun}
                                loading={isRunning}
                            >
                                Run Code
                            </Button>
                            <Button
                                variant="blue"
                                className="flex-1"
                                icon={Send}
                                onClick={handleSubmit}
                                loading={isSubmitting}
                            >
                                AI Review
                            </Button>
                        </div>

                        {/* Execution Output */}
                        {executionOutput && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4"
                            >
                                <div className={`rounded-lg border ${executionOutput.success ? 'border-google-green/30 bg-google-green/5' : 'border-google-red/30 bg-google-red/5'} p-4`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Terminal size={16} className={executionOutput.success ? 'text-google-green' : 'text-google-red'} />
                                        <span className="text-sm font-semibold">
                                            {executionOutput.success ? 'Output' : 'Error'}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-auto">
                                            {executionOutput.executionTime}
                                        </span>
                                    </div>
                                    <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                                        {executionOutput.output || executionOutput.error || 'No output'}
                                    </pre>
                                </div>
                            </motion.div>
                        )}
                    </GlassPanel>
                </motion.div>
            </div>
        </div>
    )
}
