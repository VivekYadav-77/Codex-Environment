import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import Editor from '@monaco-editor/react'
import {
    CheckCircle,
    AlertCircle,
    Loader2,
    Lightbulb,
    Lock,
    PenTool,
    Play,
    RefreshCw,
    Send,
    Terminal,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { GlassPanel } from '../../components/ui/Glass'
import { apiFetch } from '../../api/client'

const SimpleMarkdown = ({ content }) => {
    if (!content) return null

    const renderInline = (text) => text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        }
        return part
    })

    return (
        <div className="space-y-2">
            {content.split('\n').map((line, index) => {
                if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold text-white mt-4">{renderInline(line.slice(3))}</h2>
                if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold text-google-blue mt-3">{renderInline(line.slice(4))}</h3>
                if (line.startsWith('- ')) return <p key={index} className="text-gray-300">• {renderInline(line.slice(2))}</p>
                if (!line.trim()) return <div key={index} className="h-1" />
                return <p key={index} className="text-gray-300">{renderInline(line)}</p>
            })}
        </div>
    )
}

const statusConfig = {
    accepted: { label: 'Accepted', color: 'text-google-green', border: 'border-google-green/30 bg-google-green/5' },
    wrong_answer: { label: 'Wrong Answer', color: 'text-google-red', border: 'border-google-red/30 bg-google-red/5' },
    runtime_error: { label: 'Runtime Error', color: 'text-google-red', border: 'border-google-red/30 bg-google-red/5' },
    time_limit_exceeded: { label: 'Time Limit Exceeded', color: 'text-google-yellow', border: 'border-google-yellow/30 bg-google-yellow/5' },
    compile_error: { label: 'Judge Error', color: 'text-google-yellow', border: 'border-google-yellow/30 bg-google-yellow/5' },
}

const TestResult = ({ result }) => (
    <div className={`rounded-lg border p-3 ${result.passed ? 'border-google-green/20 bg-google-green/5' : 'border-google-red/20 bg-google-red/5'}`}>
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                {result.passed ? <CheckCircle size={16} className="text-google-green" /> : <AlertCircle size={16} className="text-google-red" />}
                <span className="font-semibold text-sm">{result.name}</span>
            </div>
            <span className="text-xs text-gray-400">{result.visible ? 'Visible' : result.category || 'Hidden'}</span>
        </div>
        {result.visible ? (
            <div className="mt-3 grid gap-2 text-xs font-mono text-gray-300">
                <pre className="overflow-x-auto bg-black/30 rounded p-2">Input: {JSON.stringify(result.input)}</pre>
                <pre className="overflow-x-auto bg-black/30 rounded p-2">Expected: {JSON.stringify(result.expected)}</pre>
                <pre className="overflow-x-auto bg-black/30 rounded p-2">Actual: {JSON.stringify(result.actual)}</pre>
                {result.error && <pre className="overflow-x-auto bg-black/30 rounded p-2 text-google-red">Error: {result.error}</pre>}
            </div>
        ) : !result.passed && (
            <p className="text-xs text-gray-400 mt-2">{result.error || 'Hidden test failed'}</p>
        )}
    </div>
)

export default function PracticeArena() {
    const { topic = 'hashing' } = useParams()
    const [searchParams] = useSearchParams()
    const { user } = useSelector((state) => state.auth)

    const [questions, setQuestions] = useState([])
    const [selectedIdx, setSelectedIdx] = useState(0)
    const [language, setLanguage] = useState('javascript')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [running, setRunning] = useState(false)
    const [submissionResult, setSubmissionResult] = useState(null)
    const [hints, setHints] = useState([])
    const [hintLoading, setHintLoading] = useState(false)
    const [reviewLoading, setReviewLoading] = useState(false)
    const [review, setReview] = useState(null)
    const [summary, setSummary] = useState(null)
    const [currentPattern, setCurrentPattern] = useState(null)

    const currentQuestion = questions[selectedIdx]

    useEffect(() => {
        const loadQuestions = async () => {
            setLoading(true)
            setError('')
            try {
                const data = await apiFetch(`/api/questions?topic=${encodeURIComponent(topic)}`)
                setQuestions(data)
                const requestedQuestion = searchParams.get('question')
                const requestedIdx = requestedQuestion ? data.findIndex((q) => q.slug === requestedQuestion || q.id === requestedQuestion) : -1
                setSelectedIdx(requestedIdx >= 0 ? requestedIdx : 0)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadQuestions()
    }, [topic, searchParams])

    useEffect(() => {
        if (!currentQuestion) return
        setCode(currentQuestion.starterCode?.[language] || '// Start coding here')
        setSubmissionResult(null)
        setHints([])
        setReview(null)
        if (currentQuestion.primaryPattern) {
            apiFetch(`/api/patterns/${currentQuestion.primaryPattern}`)
                .then((data) => setCurrentPattern(data.pattern))
                .catch(() => setCurrentPattern(null))
        } else {
            setCurrentPattern(null)
        }
    }, [currentQuestion, language])

    useEffect(() => {
        const loadSummary = async () => {
            if (!user) {
                setSummary(null)
                return
            }

            try {
                setSummary(await apiFetch('/api/progress/me/summary'))
            } catch (err) {
                setSummary(null)
            }
        }

        loadSummary()
    }, [user, submissionResult])

    const handleRunTests = async () => {
        if (!currentQuestion?.hasJudge) {
            setSubmissionResult({
                status: 'compile_error',
                passedCount: 0,
                totalCount: 0,
                runtimeMs: 0,
                testResults: [],
                error: 'This problem is visible for learning but not judge-enabled yet.',
            })
            return
        }

        setRunning(true)
        setSubmissionResult(null)
        try {
            const result = await apiFetch('/api/submissions/run', {
                method: 'POST',
                body: { questionId: currentQuestion.slug || currentQuestion.id, language, code },
            })
            setSubmissionResult(result)
        } catch (err) {
            setSubmissionResult({
                status: 'runtime_error',
                passedCount: 0,
                totalCount: 0,
                runtimeMs: 0,
                testResults: [],
                error: err.message,
            })
        } finally {
            setRunning(false)
        }
    }

    const handleHint = async () => {
        if (!currentQuestion) return
        setHintLoading(true)
        try {
            const result = await apiFetch('/api/ai/hint', {
                method: 'POST',
                body: { code, question: currentQuestion, previousHints: hints },
            })
            setHints((items) => [...items, { id: Date.now(), content: result.hint }])
        } catch (err) {
            setHints((items) => [...items, { id: Date.now(), content: `Hint unavailable: ${err.message}` }])
        } finally {
            setHintLoading(false)
        }
    }

    const handleReview = async () => {
        if (!currentQuestion) return
        setReviewLoading(true)
        try {
            const result = await apiFetch('/api/ai/review', {
                method: 'POST',
                body: { code, question: { ...currentQuestion, pattern: currentPattern }, language, submissionResult },
            })
            setReview(result.reviewText)
        } catch (err) {
            setReview(`Review unavailable: ${err.message}`)
        } finally {
            setReviewLoading(false)
        }
    }

    const resetCode = () => {
        setCode(currentQuestion?.starterCode?.[language] || '')
        setSubmissionResult(null)
        setReview(null)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-google-blue" />
                <p className="text-gray-400">Loading questions...</p>
            </div>
        )
    }

    if (error || !currentQuestion) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-gray-400">{error || 'No questions available'}</p>
                <p className="text-sm text-gray-500">Start MongoDB, seed the database, and run the backend.</p>
            </div>
        )
    }

    const config = statusConfig[submissionResult?.status] || statusConfig.compile_error

    return (
        <div className="max-w-7xl mx-auto">
            <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    <PenTool className="inline mr-3 text-google-red" />
                    Practice Arena
                </h1>
                <p className="text-gray-400">Solve judged DSA problems with progress tracking and Socratic AI support.</p>
            </motion.div>

            {!user && (
                <GlassPanel className="mb-6 border border-google-yellow/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Lock className="text-google-yellow" />
                            <div>
                                <h2 className="font-semibold">Login required for judged submissions</h2>
                                <p className="text-sm text-gray-400">You can read problems, but tests and progress need an account.</p>
                            </div>
                        </div>
                        <Link to="/login"><Button size="sm">Login</Button></Link>
                    </div>
                </GlassPanel>
            )}

            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-4"><p className="text-sm text-gray-400">Solved</p><p className="text-2xl font-bold text-google-green">{summary.solved}</p></div>
                    <div className="glass-card p-4"><p className="text-sm text-gray-400">Attempted</p><p className="text-2xl font-bold text-google-yellow">{summary.attempted}</p></div>
                    <div className="glass-card p-4"><p className="text-sm text-gray-400">Total</p><p className="text-2xl font-bold">{summary.totalQuestions}</p></div>
                    <div className="glass-card p-4"><p className="text-sm text-gray-400">This Topic</p><p className="text-2xl font-bold text-google-blue">{summary.byTopic?.[topic]?.solved || 0}</p></div>
                </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
                {questions.map((q, idx) => (
                    <Button key={q.slug || q.id} variant={idx === selectedIdx ? 'blue' : 'glass'} size="sm" onClick={() => setSelectedIdx(idx)}>
                        {q.title}
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${q.difficulty === 'Easy' ? 'bg-google-green/20 text-google-green' : q.difficulty === 'Medium' ? 'bg-google-yellow/20 text-google-yellow' : 'bg-google-red/20 text-google-red'}`}>
                            {q.difficulty}
                        </span>
                    </Button>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <GlassPanel>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <h2 className="text-xl font-bold">{currentQuestion.title}</h2>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm px-3 py-1 rounded-full ${currentQuestion.difficulty === 'Easy' ? 'bg-google-green/20 text-google-green' : currentQuestion.difficulty === 'Medium' ? 'bg-google-yellow/20 text-google-yellow' : 'bg-google-red/20 text-google-red'}`}>
                                    {currentQuestion.difficulty}
                                </span>
                                <span className={`text-sm px-3 py-1 rounded-full ${currentQuestion.hasJudge ? 'bg-google-blue/20 text-google-blue' : 'bg-white/10 text-gray-400'}`}>
                                    {currentQuestion.hasJudge ? 'Judge ready' : 'Learning only'}
                                </span>
                            </div>
                        </div>
                        {currentPattern && (
                            <Link to={`/roadmap/${currentPattern.slug}`} className="block mb-4">
                                <div className="p-3 rounded-lg bg-google-blue/10 border border-google-blue/20">
                                    <p className="text-sm text-google-blue font-semibold">Pattern: {currentPattern.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{currentPattern.whenToUse}</p>
                                </div>
                            </Link>
                        )}
                        <p className="text-gray-300 whitespace-pre-line mb-4">{currentQuestion.description}</p>
                        {currentQuestion.examples?.map((example, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-4 mb-3">
                                <p className="text-sm text-gray-400 mb-1">Example {index + 1}</p>
                                <p className="font-mono text-sm"><span className="text-gray-400">Input: </span>{example.input}</p>
                                <p className="font-mono text-sm"><span className="text-gray-400">Output: </span><span className="text-google-green">{example.output}</span></p>
                                {example.explanation && <p className="text-sm text-gray-400 mt-1">{example.explanation}</p>}
                            </div>
                        ))}
                    </GlassPanel>

                    <GlassPanel>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><Lightbulb size={20} className="text-google-yellow" />AI Hints</h3>
                            <Button variant="glass" size="sm" onClick={handleHint} loading={hintLoading} icon={Lightbulb}>Get Hint</Button>
                        </div>
                        {hints.length === 0 ? <p className="text-gray-400 text-sm">Ask for a nudge when you are stuck.</p> : (
                            <div className="space-y-3">
                                {hints.map((hint) => <div key={hint.id} className="p-3 rounded-lg bg-google-yellow/10 border border-google-yellow/20 text-sm text-gray-300">{hint.content}</div>)}
                            </div>
                        )}
                    </GlassPanel>

                    {review && (
                        <GlassPanel className="border border-google-blue/30">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><CheckCircle size={20} className="text-google-blue" />AI Code Review</h3>
                            <SimpleMarkdown content={review} />
                        </GlassPanel>
                    )}
                </div>

                <GlassPanel className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="glass-input px-3 py-2 text-sm">
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                        </select>
                        <Button variant="glass" size="sm" icon={RefreshCw} onClick={resetCode}>Reset</Button>
                    </div>

                    <div className="flex-1 rounded-lg overflow-hidden border border-white/10 min-h-[420px]">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
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

                    <div className="mt-4 flex gap-3">
                        <Button variant="green" className="flex-1" icon={Play} onClick={handleRunTests} loading={running} disabled={!user}>Run Tests</Button>
                        <Button variant="blue" className="flex-1" icon={Send} onClick={handleReview} loading={reviewLoading}>AI Review</Button>
                    </div>

                    {submissionResult && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 rounded-lg border p-4 ${config.border}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <Terminal size={16} className={config.color} />
                                <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                                <span className="text-xs text-gray-500 ml-auto">
                                    {submissionResult.passedCount}/{submissionResult.totalCount} passed • {submissionResult.runtimeMs}ms
                                </span>
                            </div>
                            {submissionResult.patternProgress && (
                                <div className="mb-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Pattern mastery impact</span>
                                        <span>{submissionResult.patternProgress.masteryScore}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-google-blue" style={{ width: `${submissionResult.patternProgress.masteryScore}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Status: {submissionResult.patternProgress.status}</p>
                                </div>
                            )}
                            {submissionResult.error && <p className="text-sm text-gray-300 mb-3">{submissionResult.error}</p>}
                            <div className="space-y-3">
                                {submissionResult.testResults?.map((result, index) => <TestResult key={`${result.name}-${index}`} result={result} />)}
                            </div>
                        </motion.div>
                    )}
                </GlassPanel>
            </div>
        </div>
    )
}
