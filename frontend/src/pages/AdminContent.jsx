import { useEffect, useState } from 'react'
import { Shield, Loader2 } from 'lucide-react'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

export default function AdminContent() {
    const [questions, setQuestions] = useState(null)
    const [quality, setQuality] = useState({})
    const [solutions, setSolutions] = useState({})
    const [courseDepth, setCourseDepth] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch('/api/admin/questions').then(setQuestions).catch((err) => setError(err.message))
        apiFetch('/api/admin/course-depth').then(setCourseDepth).catch(() => setCourseDepth(null))
    }, [])

    const loadQuality = async (id) => {
        const data = await apiFetch(`/api/admin/questions/${id}/quality`)
        setQuality((current) => ({ ...current, [id]: data }))
    }

    const loadSolution = async (id) => {
        const data = await apiFetch(`/api/admin/questions/${id}/solution`)
        setSolutions((current) => ({ ...current, [id]: { ...(data || {}) } }))
    }

    const saveSolution = async (id) => {
        const data = await apiFetch(`/api/admin/questions/${id}/solution`, { method: 'PATCH', body: solutions[id] || {} })
        setQuality((current) => ({ ...current, [id]: data.quality }))
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><Shield className="text-google-red" />Content Studio</h1>
                <p className="text-gray-400">Admin-only question, pattern, concept check, and track management.</p>
            </div>
            {courseDepth && (
                <GlassPanel>
                    <div className="grid md:grid-cols-4 gap-4 mb-5">
                        <div className="p-4 rounded-lg bg-white/5"><p className="text-sm text-gray-400">Course Depth</p><p className="text-3xl font-bold text-google-blue">{courseDepth.averageScore}%</p></div>
                        <div className="p-4 rounded-lg bg-white/5"><p className="text-sm text-gray-400">Patterns</p><p className="text-3xl font-bold">{courseDepth.patternCount}</p></div>
                        <div className="p-4 rounded-lg bg-white/5"><p className="text-sm text-gray-400">Questions</p><p className="text-3xl font-bold">{courseDepth.questionCount}</p></div>
                        <div className="p-4 rounded-lg bg-white/5"><p className="text-sm text-gray-400">Ready</p><p className={`text-3xl font-bold ${courseDepth.publishReady ? 'text-google-green' : 'text-google-yellow'}`}>{courseDepth.publishReady ? 'Yes' : 'No'}</p></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold mb-2">Weakest Patterns</p>
                            <div className="space-y-2">
                                {courseDepth.weakestPatterns?.map((item) => <div key={item.slug} className="p-3 rounded-lg bg-white/5"><p className="text-sm">{item.title} - {item.score}%</p><p className="text-xs text-gray-400">{item.missing?.slice(0, 3).join(', ')}</p></div>)}
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold mb-2">Weakest Questions</p>
                            <div className="space-y-2">
                                {courseDepth.weakestQuestions?.map((item) => <div key={item.slug || item.title} className="p-3 rounded-lg bg-white/5"><p className="text-sm">{item.title || 'Question'} - {item.score}%</p><p className="text-xs text-gray-400">{item.missing?.slice(0, 3).join(', ')}</p></div>)}
                            </div>
                        </div>
                    </div>
                </GlassPanel>
            )}
            <GlassPanel>
                {error && <p className="text-google-red">{error}</p>}
                {!error && !questions && <Loader2 className="animate-spin text-google-blue" />}
                {questions && <div className="space-y-3">{questions.map((question) => (
                    <div key={question._id} className="p-3 rounded-lg bg-white/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <p className="font-semibold">{question.title}</p>
                                <p className="text-xs text-gray-400">{question.slug} - {question.isActive ? 'Published' : 'Draft'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="text-sm text-google-blue" onClick={() => loadQuality(question._id)}>Check Quality</button>
                                <button className="text-sm text-google-green" onClick={() => loadSolution(question._id)}>Edit Solution</button>
                            </div>
                        </div>
                        {quality[question._id] && (
                            <div className="mt-3 p-3 rounded-lg bg-black/20">
                                <p className="font-semibold">Quality: {quality[question._id].score}% {quality[question._id].publishReady ? 'Ready' : 'Needs work'}</p>
                                {quality[question._id].missing?.length ? <p className="text-xs text-gray-400 mt-1">Missing: {quality[question._id].missing.join(', ')}</p> : null}
                            </div>
                        )}
                        {solutions[question._id] && (
                            <div className="mt-3 grid gap-2">
                                <textarea className="glass-input w-full min-h-[70px]" placeholder="Optimized approach" value={solutions[question._id].optimizedApproach || ''} onChange={(event) => setSolutions((current) => ({ ...current, [question._id]: { ...current[question._id], optimizedApproach: event.target.value } }))} />
                                <textarea className="glass-input w-full min-h-[70px]" placeholder="Complexity explanation" value={solutions[question._id].complexityExplanation || ''} onChange={(event) => setSolutions((current) => ({ ...current, [question._id]: { ...current[question._id], complexityExplanation: event.target.value } }))} />
                                <textarea className="glass-input w-full min-h-[70px]" placeholder="Interview explanation" value={solutions[question._id].interviewExplanation || ''} onChange={(event) => setSolutions((current) => ({ ...current, [question._id]: { ...current[question._id], interviewExplanation: event.target.value } }))} />
                                <button className="text-sm text-google-green text-left" onClick={() => saveSolution(question._id)}>Save Solution</button>
                            </div>
                        )}
                    </div>
                ))}</div>}
            </GlassPanel>
        </div>
    )
}
