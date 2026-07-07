import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, CheckCircle, Loader2, RotateCcw, SkipForward } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

const isToday = (date) => new Date(date).toDateString() === new Date().toDateString()
const isOverdue = (date) => new Date(date) < new Date() && !isToday(date)

export default function Revision() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = async () => {
        setLoading(true)
        try {
            setItems(await apiFetch('/api/revision/me'))
            setError('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const groups = useMemo(() => ({
        overdue: items.filter((item) => isOverdue(item.dueAt)),
        today: items.filter((item) => isToday(item.dueAt)),
        upcoming: items.filter((item) => !isToday(item.dueAt) && !isOverdue(item.dueAt)),
    }), [items])

    const act = async (id, action) => {
        await apiFetch(`/api/revision/me/${id}/${action}`, { method: 'POST', body: action === 'reschedule' ? { days: 2 } : {} })
        load()
    }

    const renderItem = (item) => (
        <div key={item._id} className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <p className="font-semibold">{item.questionId?.title || 'Revision item'}</p>
                    <p className="text-sm text-gray-400">{item.reason?.replaceAll('_', ' ')} - due {new Date(item.dueAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link to={`/practice/${item.questionId?.topic || 'hashing'}?question=${item.questionId?.slug || ''}&mode=revision`}>
                        <Button size="sm" icon={RotateCcw}>Practice</Button>
                    </Link>
                    <Button size="sm" variant="green" icon={CheckCircle} onClick={() => act(item._id, 'complete')}>Done</Button>
                    <Button size="sm" variant="glass" icon={SkipForward} onClick={() => act(item._id, 'reschedule')}>Later</Button>
                </div>
            </div>
        </div>
    )

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><CalendarClock className="text-google-yellow" />Revision Calendar</h1>
                <p className="text-gray-400">Spaced repetition from your mistakes, hints, and solved history.</p>
            </div>
            {error && <GlassPanel className="border border-google-red/30 text-google-red">{error}</GlassPanel>}
            {['overdue', 'today', 'upcoming'].map((group) => (
                <GlassPanel key={group}>
                    <h2 className="text-xl font-bold mb-4 capitalize">{group}</h2>
                    <div className="space-y-3">{groups[group].length ? groups[group].map(renderItem) : <p className="text-gray-400">Nothing here.</p>}</div>
                </GlassPanel>
            ))}
        </div>
    )
}
