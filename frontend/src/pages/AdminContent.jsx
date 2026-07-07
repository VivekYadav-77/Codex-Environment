import { useEffect, useState } from 'react'
import { Shield, Loader2 } from 'lucide-react'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

export default function AdminContent() {
    const [questions, setQuestions] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch('/api/admin/questions').then(setQuestions).catch((err) => setError(err.message))
    }, [])

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><Shield className="text-google-red" />Content Studio</h1>
                <p className="text-gray-400">Admin-only question, pattern, concept check, and track management.</p>
            </div>
            <GlassPanel>
                {error && <p className="text-google-red">{error}</p>}
                {!error && !questions && <Loader2 className="animate-spin text-google-blue" />}
                {questions && <div className="space-y-3">{questions.map((question) => <div key={question._id} className="p-3 rounded-lg bg-white/5"><p className="font-semibold">{question.title}</p><p className="text-xs text-gray-400">{question.slug} - {question.isActive ? 'Published' : 'Draft'}</p></div>)}</div>}
            </GlassPanel>
        </div>
    )
}
