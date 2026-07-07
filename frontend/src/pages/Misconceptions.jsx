import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

export default function Misconceptions() {
    const { slug } = useParams()
    const [items, setItems] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch(slug ? `/api/misconceptions/${slug}` : '/api/misconceptions/me')
            .then((data) => setItems(Array.isArray(data) ? data : [data]))
            .catch((err) => setError(err.message))
    }, [slug])

    if (error) return <div className="text-google-red">{error}</div>
    if (!items) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><AlertTriangle className="text-google-yellow" />Misconceptions</h1>
                <p className="text-gray-400">Common mental-model gaps detected from your attempts and practice behavior.</p>
            </div>
            <div className="space-y-4">
                {items.map((item) => (
                    <GlassPanel key={item.slug}>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold">{item.title}</h2>
                                <p className="text-gray-400 mt-1">{item.description}</p>
                                <p className="text-sm text-google-green mt-3">{item.correction}</p>
                                <p className="text-sm text-gray-300 mt-2">{item.recommendedAction}</p>
                                <p className="text-xs text-google-yellow mt-2">Confidence: {item.confidence || 'low'} - Evidence: {item.evidenceCount || 0}</p>
                            </div>
                            {!slug && <Link className="text-google-blue text-sm" to={`/misconceptions/${item.slug}`}>Details</Link>}
                        </div>
                    </GlassPanel>
                ))}
            </div>
        </div>
    )
}
