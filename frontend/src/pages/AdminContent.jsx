import { useEffect, useState } from 'react'
import { Shield, Loader2 } from 'lucide-react'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

export default function AdminContent() {
    const [questions, setQuestions] = useState(null)
    const [quality, setQuality] = useState({})
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch('/api/admin/questions').then(setQuestions).catch((err) => setError(err.message))
    }, [])

    const loadQuality = async (id) => {
        const data = await apiFetch(`/api/admin/questions/${id}/quality`)
        setQuality((current) => ({ ...current, [id]: data }))
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><Shield className="text-google-red" />Content Studio</h1>
                <p className="text-gray-400">Admin-only question, pattern, concept check, and track management.</p>
            </div>
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
                            <button className="text-sm text-google-blue" onClick={() => loadQuality(question._id)}>Check Quality</button>
                        </div>
                        {quality[question._id] && (
                            <div className="mt-3 p-3 rounded-lg bg-black/20">
                                <p className="font-semibold">Quality: {quality[question._id].score}% {quality[question._id].publishReady ? 'Ready' : 'Needs work'}</p>
                                {quality[question._id].missing?.length ? <p className="text-xs text-gray-400 mt-1">Missing: {quality[question._id].missing.join(', ')}</p> : null}
                            </div>
                        )}
                    </div>
                ))}</div>}
            </GlassPanel>
        </div>
    )
}
