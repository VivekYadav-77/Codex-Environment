import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import Editor from '@monaco-editor/react'
import {
    AlertCircle,
    Brain,
    CheckCircle,
    Clock,
    FileText,
    Lightbulb,
    Loader2,
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

const tabs = [
    { id: 'problem', label: 'Problem', icon: FileText },
    { id: 'approach', label: 'Approach', icon: PenTool },
    { id: 'tests', label: 'Tests', icon: Terminal },
    { id: 'review', label: 'Review', icon: CheckCircle },
    { id: 'mentor', label: 'Mentor', icon: Brain },
    { id: 'timeline', label: 'Timeline', icon: Clock },
]

const emptyApproach = {
    restatedProblem: '',
    constraints: '',
    bruteForce: '',
    optimized: '',
    patternGuess: '',
    edgeCases: '',
    confidenceBeforeSubmit: 3,
    timeComplexity: '',
    spaceComplexity: '',
}

const workflowSteps = ['Understand', 'Plan', 'Code', 'Test', 'Reflect']

const statusConfig = {
    accepted: { label: 'Accepted', color: 'text-google-green', border: 'border-google-green/30 bg-google-green/5' },
    wrong_answer: { label: 'Wrong Answer', color: 'text-google-red', border: 'border-google-red/30 bg-google-red/5' },
    runtime_error: { label: 'Runtime Error', color: 'text-google-red', border: 'border-google-red/30 bg-google-red/5' },
    time_limit_exceeded: { label: 'Time Limit Exceeded', color: 'text-google-yellow', border: 'border-google-yellow/30 bg-google-yellow/5' },
    compile_error: { label: 'Judge Error', color: 'text-google-yellow', border: 'border-google-yellow/30 bg-google-yellow/5' },
}

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
                if (line.startsWith('- ')) return <p key={index} className="text-gray-300">- {renderInline(line.slice(2))}</p>
                if (!line.trim()) return <div key={index} className="h-1" />
                return <p key={index} className="text-gray-300">{renderInline(line)}</p>
            })}
        </div>
    )
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

const ApproachField = ({ label, value, onChange, placeholder }) => (
    <label className="block">
        <span className="block text-sm font-semibold text-gray-300 mb-2">{label}</span>
        <textarea
            className="glass-input w-full min-h-[88px] resize-y"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
        />
    </label>
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
    const [hintLevel, setHintLevel] = useState(1)
    const [reviewLoading, setReviewLoading] = useState(false)
    const [review, setReview] = useState(null)
    const [summary, setSummary] = useState(null)
    const [currentPattern, setCurrentPattern] = useState(null)
    const [activeTab, setActiveTab] = useState('problem')
    const [approach, setApproach] = useState(emptyApproach)
    const [practiceMode, setPracticeMode] = useState(searchParams.get('mode') || (topic === 'mixed' ? 'mixed' : 'practice'))
    const [mentorMessage, setMentorMessage] = useState('')
    const [mentorSession, setMentorSession] = useState(null)
    const [mentorLoading, setMentorLoading] = useState(false)
    const [timeline, setTimeline] = useState([])
    const [officialSolution, setOfficialSolution] = useState(null)
    const [reflection, setReflection] = useState({
        patternUsed: '',
        whyItWorked: '',
        keyInvariant: '',
        dangerousEdgeCase: '',
        interviewExplanation: '',
        confidenceAfterSolve: 3,
    })
    const [reflectionSaved, setReflectionSaved] = useState(false)

    const currentQuestion = questions[selectedIdx]
    const approachKey = useMemo(() => {
        if (!currentQuestion) return ''
        return `codex_approach_${user?.id || 'guest'}_${currentQuestion.slug || currentQuestion.id}`
    }, [currentQuestion, user])

    useEffect(() => {
        const loadQuestions = async () => {
            setLoading(true)
            setError('')
            try {
                const isMixed = practiceMode === 'mixed' || topic === 'mixed'
                const data = await apiFetch(isMixed ? '/api/questions/mixed' : `/api/questions?topic=${encodeURIComponent(topic)}`)
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
    }, [topic, searchParams, practiceMode])

    useEffect(() => {
        if (!currentQuestion) return
        setCode(currentQuestion.starterCode?.[language] || '// Start coding here')
        setSubmissionResult(null)
        setHints([])
        setHintLevel(1)
        setReview(null)
        setReflectionSaved(false)
        setOfficialSolution(null)
        setActiveTab('problem')

        if (currentQuestion.primaryPattern && practiceMode !== 'mixed') {
            apiFetch(`/api/patterns/${currentQuestion.primaryPattern}`)
                .then((data) => setCurrentPattern(data.pattern))
                .catch(() => setCurrentPattern(null))
        } else {
            setCurrentPattern(null)
        }
        setTimeline([])
        setMentorSession(null)
    }, [currentQuestion, language])

    useEffect(() => {
        if (!currentQuestion?.slug || !user) return
        apiFetch(`/api/questions/${currentQuestion.slug}/timeline/me`).then(setTimeline).catch(() => setTimeline([]))
        apiFetch(`/api/ai/mentor/session/${currentQuestion.slug}`).then(setMentorSession).catch(() => setMentorSession(null))
    }, [currentQuestion, user, submissionResult, hints.length])

    useEffect(() => {
        if (!approachKey) return
        try {
            const saved = localStorage.getItem(approachKey)
            setApproach(saved ? { ...emptyApproach, ...JSON.parse(saved) } : emptyApproach)
        } catch (err) {
            setApproach(emptyApproach)
        }
    }, [approachKey])

    useEffect(() => {
        if (!approachKey) return
        localStorage.setItem(approachKey, JSON.stringify(approach))
    }, [approach, approachKey])

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
            setActiveTab('tests')
            return
        }

        const missingMixed = []
        if (practiceMode === 'mixed') {
            if (!approach.patternGuess.trim()) missingMixed.push('pattern guess')
            if (!approach.bruteForce.trim()) missingMixed.push('brute force idea')
            if (!approach.optimized.trim()) missingMixed.push('optimized idea')
            if (!approach.edgeCases.trim()) missingMixed.push('edge cases')
        }
        if (missingMixed.length) {
            setSubmissionResult({
                status: 'compile_error',
                passedCount: 0,
                totalCount: 0,
                runtimeMs: 0,
                testResults: [],
                error: `Mixed practice requires: ${missingMixed.join(', ')}.`,
            })
            setActiveTab('approach')
            return
        }

        setRunning(true)
        setSubmissionResult(null)
        try {
            const result = await apiFetch('/api/submissions/run', {
                method: 'POST',
                body: {
                    questionId: currentQuestion.slug || currentQuestion.id,
                    language,
                    code,
                    hintCountAtSubmit: hints.length,
                    approachSnapshot: approach,
                    patternGuess: approach.patternGuess,
                    mode: practiceMode,
                },
            })
            setSubmissionResult(result)
            if (result.revealedPattern?.slug) {
                apiFetch(`/api/patterns/${result.revealedPattern.slug}`)
                    .then((data) => setCurrentPattern(data.pattern))
                    .catch(() => setCurrentPattern(null))
            }
            if (result.status === 'accepted') {
                apiFetch(`/api/questions/${currentQuestion.slug || currentQuestion.id}/solution`)
                    .then(setOfficialSolution)
                    .catch(() => setOfficialSolution(null))
            }
            setActiveTab('tests')
        } catch (err) {
            setSubmissionResult({
                status: 'runtime_error',
                passedCount: 0,
                totalCount: 0,
                runtimeMs: 0,
                testResults: [],
                error: err.message,
            })
            setActiveTab('tests')
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
                body: { code, question: { ...currentQuestion, pattern: currentPattern, approach }, previousHints: hints, hintLevel, mode: practiceMode, approach, submissionResult },
            })
            setHints((items) => [...items, { id: Date.now(), content: result.hint, hintLevel: result.hintLevel }])
            if (result.nextHintAvailable) setHintLevel((level) => Math.min(6, level + 1))
        } catch (err) {
            setHints((items) => [...items, { id: Date.now(), content: `Hint unavailable: ${err.message}` }])
        } finally {
            setHintLoading(false)
        }
    }

    const handleMentor = async () => {
        if (!currentQuestion || !mentorMessage.trim()) return
        setMentorLoading(true)
        try {
            const result = await apiFetch('/api/ai/mentor/message', {
                method: 'POST',
                body: {
                    questionId: currentQuestion.slug || currentQuestion.id,
                    message: mentorMessage,
                    code,
                    approach,
                    mode: practiceMode,
                },
            })
            setMentorSession(result.session)
            setMentorMessage('')
        } catch (err) {
            setMentorSession((current) => ({
                ...(current || {}),
                messages: [...(current?.messages || []), { role: 'mentor', content: `Mentor unavailable: ${err.message}` }],
            }))
        } finally {
            setMentorLoading(false)
        }
    }

    const handleReview = async () => {
        if (!currentQuestion) return
        setReviewLoading(true)
        try {
            const result = await apiFetch('/api/ai/review', {
                method: 'POST',
                body: { code, question: { ...currentQuestion, pattern: currentPattern, approach }, language, submissionResult },
            })
            setReview(result.reviewText)
            setActiveTab('review')
        } catch (err) {
            setReview(`Review unavailable: ${err.message}`)
            setActiveTab('review')
        } finally {
            setReviewLoading(false)
        }
    }

    const resetCode = () => {
        setCode(currentQuestion?.starterCode?.[language] || '')
        setSubmissionResult(null)
        setReview(null)
    }

    const updateApproach = (field, value) => {
        setApproach((current) => ({ ...current, [field]: value }))
    }

    const saveReflection = async () => {
        if (!currentQuestion) return
        await apiFetch('/api/reflections', {
            method: 'POST',
            body: {
                ...reflection,
                questionId: currentQuestion.slug || currentQuestion.id,
                submissionId: submissionResult?.submissionId,
            },
        })
        setReflectionSaved(true)
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
                <p className="text-gray-400">Reason through the approach, code, test, then review your DSA solution.</p>
            </motion.div>

            <GlassPanel className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <p className="font-semibold">Practice mode</p>
                        <p className="text-sm text-gray-400">Mixed mode hides the pattern until after submission.</p>
                    </div>
                    <select value={practiceMode} onChange={(e) => setPracticeMode(e.target.value)} className="glass-input px-3 py-2 text-sm">
                        <option value="practice">Normal Practice</option>
                        <option value="revision">Revision</option>
                        <option value="mixed">Mixed Pattern</option>
                    </select>
                </div>
            </GlassPanel>

            <GlassPanel className="mb-6">
                <div className="grid grid-cols-5 gap-2">
                    {workflowSteps.map((step, index) => {
                        const active = (activeTab === 'problem' && index === 0) || (activeTab === 'approach' && index === 1) || (index === 2 && activeTab === 'problem') || (activeTab === 'tests' && index === 3) || (activeTab === 'review' && index === 4)
                        const complete = index === 0 || (index === 1 && Object.values(approach).some(Boolean)) || (index === 3 && submissionResult)
                        return (
                            <div key={step} className={`rounded-lg p-2 text-center text-xs border ${active ? 'border-google-blue bg-google-blue/10 text-white' : complete ? 'border-google-green/30 bg-google-green/5 text-google-green' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                                {step}
                            </div>
                        )
                    })}
                </div>
            </GlassPanel>

            {!user && (
                <GlassPanel className="mb-6 border border-google-yellow/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Lock className="text-google-yellow" />
                            <div>
                                <h2 className="font-semibold">Login required for judged submissions</h2>
                                <p className="text-sm text-gray-400">You can read problems and write an approach, but tests and progress need an account.</p>
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
                <GlassPanel className="min-h-[640px]">
                    <div className="flex flex-wrap gap-2 mb-5">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${activeTab === id ? 'bg-white/15 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Icon size={16} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'problem' && (
                        <div>
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
                            {practiceMode === 'mixed' && !currentPattern && (
                                <div className="p-3 rounded-lg bg-google-yellow/10 border border-google-yellow/20 mb-4">
                                    <p className="text-sm text-google-yellow font-semibold">Pattern hidden</p>
                                    <p className="text-xs text-gray-400 mt-1">Solve first, then the platform will reveal the pattern signal.</p>
                                </div>
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
                        </div>
                    )}

                    {activeTab === 'approach' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold mb-2">Plan Before Coding</h2>
                                <p className="text-sm text-gray-400">Write your thinking like an interview. These notes stay in this browser for this problem.</p>
                            </div>
                            <ApproachField label="Brute force idea" value={approach.bruteForce} onChange={(value) => updateApproach('bruteForce', value)} placeholder="What is the simplest correct approach?" />
                            <ApproachField label="Restate the problem" value={approach.restatedProblem} onChange={(value) => updateApproach('restatedProblem', value)} placeholder="Explain the input, output, and goal in your own words." />
                            <ApproachField label="Constraints and signals" value={approach.constraints} onChange={(value) => updateApproach('constraints', value)} placeholder="Input size, sorted/unsorted, duplicates, monotonic condition..." />
                            <ApproachField label="Optimized idea" value={approach.optimized} onChange={(value) => updateApproach('optimized', value)} placeholder="Which pattern or data structure improves it?" />
                            <ApproachField label="Pattern guess" value={approach.patternGuess} onChange={(value) => updateApproach('patternGuess', value)} placeholder="Example: hash-map-lookup" />
                            <ApproachField label="Edge cases to test" value={approach.edgeCases} onChange={(value) => updateApproach('edgeCases', value)} placeholder="Empty input, duplicates, single item, no answer..." />
                            <div className="grid md:grid-cols-2 gap-4">
                                <ApproachField label="Expected time complexity" value={approach.timeComplexity} onChange={(value) => updateApproach('timeComplexity', value)} placeholder="Example: O(n)" />
                                <ApproachField label="Expected space complexity" value={approach.spaceComplexity} onChange={(value) => updateApproach('spaceComplexity', value)} placeholder="Example: O(n)" />
                            </div>
                            <label className="block">
                                <span className="block text-sm font-semibold text-gray-300 mb-2">Confidence before submit: {approach.confidenceBeforeSubmit}/5</span>
                                <input className="w-full" type="range" min="1" max="5" value={approach.confidenceBeforeSubmit} onChange={(event) => updateApproach('confidenceBeforeSubmit', Number(event.target.value))} />
                            </label>
                        </div>
                    )}

                    {activeTab === 'tests' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Test Results</h2>
                            {!submissionResult ? (
                                <p className="text-gray-400">Run tests to see visible and hidden-case feedback.</p>
                            ) : (
                                <div className={`rounded-lg border p-4 ${config.border}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Terminal size={16} className={config.color} />
                                        <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                                        <span className="text-xs text-gray-500 ml-auto">
                                            {submissionResult.passedCount}/{submissionResult.totalCount} passed - {submissionResult.runtimeMs}ms
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
                                    {submissionResult.revealedPattern && (
                                        <div className="mb-3 p-3 rounded-lg bg-google-yellow/10 border border-google-yellow/20">
                                            <p className="text-sm font-semibold text-google-yellow">Revealed pattern: {submissionResult.revealedPattern.slug}</p>
                                            {submissionResult.revealedPattern.guess && (
                                                <p className={`text-xs mt-1 ${submissionResult.revealedPattern.correctGuess ? 'text-google-green' : 'text-google-yellow'}`}>
                                                    Your guess: {submissionResult.revealedPattern.guess} - {submissionResult.revealedPattern.correctGuess ? 'matched' : 'different'}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">{submissionResult.revealedPattern.reason}</p>
                                        </div>
                                    )}
                                    {submissionResult.error && <p className="text-sm text-gray-300 mb-3">{submissionResult.error}</p>}
                                    <div className="space-y-3">
                                        {submissionResult.testResults?.map((result, index) => <TestResult key={`${result.name}-${index}`} result={result} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'review' && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold">AI Review</h2>
                                    <p className="text-sm text-gray-400">Review includes your code, pattern context, approach notes, and latest test result.</p>
                                </div>
                                <Button variant="blue" size="sm" icon={Send} onClick={handleReview} loading={reviewLoading}>Review</Button>
                            </div>
                            {review ? <SimpleMarkdown content={review} /> : <p className="text-gray-400">Submit for review after drafting your approach or running tests.</p>}

                            <div className="pt-5 border-t border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2"><Lightbulb size={20} className="text-google-yellow" />AI Hints</h3>
                                    <Button variant="glass" size="sm" onClick={handleHint} loading={hintLoading} icon={Lightbulb}>Hint Level {hintLevel}</Button>
                                </div>
                                {hints.length === 0 ? <p className="text-gray-400 text-sm">Ask for a nudge when you are stuck.</p> : (
                                    <div className="space-y-3">
                                        {hints.map((hint) => <div key={hint.id} className="p-3 rounded-lg bg-google-yellow/10 border border-google-yellow/20 text-sm text-gray-300"><p className="text-xs text-google-yellow mb-1">Level {hint.hintLevel || 1}</p>{hint.content}</div>)}
                                    </div>
                                )}
                            </div>
                            {submissionResult?.status === 'accepted' && (
                                <div className="pt-5 border-t border-white/10 space-y-3">
                                    <h3 className="text-lg font-semibold">Post-Solve Reflection</h3>
                                    {[
                                        ['patternUsed', 'Pattern used'],
                                        ['whyItWorked', 'Why it worked'],
                                        ['keyInvariant', 'Key invariant'],
                                        ['dangerousEdgeCase', 'Dangerous edge case'],
                                        ['interviewExplanation', 'Interview explanation'],
                                    ].map(([field, label]) => (
                                        <textarea key={field} className="glass-input w-full min-h-[72px]" value={reflection[field]} onChange={(event) => setReflection((current) => ({ ...current, [field]: event.target.value }))} placeholder={label} />
                                    ))}
                                    <label className="block">
                                        <span className="block text-sm text-gray-400 mb-1">Confidence after solve: {reflection.confidenceAfterSolve}/5</span>
                                        <input className="w-full" type="range" min="1" max="5" value={reflection.confidenceAfterSolve} onChange={(event) => setReflection((current) => ({ ...current, confidenceAfterSolve: Number(event.target.value) }))} />
                                    </label>
                                    <Button variant="green" size="sm" onClick={saveReflection} disabled={reflectionSaved}>{reflectionSaved ? 'Reflection Saved' : 'Save Reflection'}</Button>
                                </div>
                            )}
                            {officialSolution && (
                                <div className="pt-5 border-t border-white/10 space-y-3">
                                    <h3 className="text-lg font-semibold">Official Explanation</h3>
                                    {officialSolution.empty ? (
                                        <p className="text-sm text-gray-400">Official solution content has not been added yet.</p>
                                    ) : (
                                        <div className="space-y-3 text-sm text-gray-300">
                                            {officialSolution.officialSolution?.optimizedApproach && <p>{officialSolution.officialSolution.optimizedApproach}</p>}
                                            {officialSolution.officialSolution?.complexityExplanation && <p className="text-gray-400">{officialSolution.officialSolution.complexityExplanation}</p>}
                                            {officialSolution.officialSolution?.interviewExplanation && <p className="text-google-blue">{officialSolution.officialSolution.interviewExplanation}</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'mentor' && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold">AI Mentor</h2>
                                <p className="text-sm text-gray-400">Strict Socratic guidance based on your code, attempts, approach notes, and mistakes.</p>
                            </div>
                            <div className="space-y-3 max-h-[420px] overflow-y-auto">
                                {mentorSession?.messages?.length ? mentorSession.messages.map((message, index) => (
                                    <div key={index} className={`p-3 rounded-lg ${message.role === 'learner' ? 'bg-google-blue/10 border border-google-blue/20' : 'bg-white/5 border border-white/10'}`}>
                                        <p className="text-xs text-gray-500 mb-1 capitalize">{message.role}</p>
                                        <p className="text-sm text-gray-300">{message.content}</p>
                                    </div>
                                )) : <p className="text-gray-400">Ask what to think about next. The mentor will nudge, not solve.</p>}
                            </div>
                            <textarea className="glass-input w-full min-h-[90px]" value={mentorMessage} onChange={(event) => setMentorMessage(event.target.value)} placeholder="Describe where you are stuck." />
                            <Button variant="blue" icon={Brain} onClick={handleMentor} loading={mentorLoading}>Ask Mentor</Button>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Thinking Timeline</h2>
                            <div className="space-y-3">
                                {timeline.length ? timeline.map((event) => (
                                    <div key={event._id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                        <div className="flex justify-between gap-3">
                                            <p className="font-semibold capitalize">{event.title || event.type.replaceAll('_', ' ')}</p>
                                            <p className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</p>
                                        </div>
                                        {event.details?.status && <p className="text-sm text-gray-400 mt-1">{event.details.status} - {event.details.passedCount}/{event.details.totalCount} tests</p>}
                                        {event.details?.tags?.length ? <p className="text-xs text-google-yellow mt-1">{event.details.tags.join(', ')}</p> : null}
                                    </div>
                                )) : <p className="text-gray-400">Run tests, request hints, or talk to the mentor to build a replay.</p>}
                            </div>
                        </div>
                    )}
                </GlassPanel>

                <GlassPanel className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="glass-input px-3 py-2 text-sm">
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                        </select>
                        <Button variant="glass" size="sm" icon={RefreshCw} onClick={resetCode}>Reset</Button>
                    </div>

                    <div className="flex-1 rounded-lg overflow-hidden border border-white/10 min-h-[520px]">
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
                </GlassPanel>
            </div>
        </div>
    )
}
