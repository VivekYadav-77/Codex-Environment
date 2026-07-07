import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BookOpen, CheckCircle, Clock, Loader2, Network, PlayCircle, Target } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

export default function DailySession() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = async () => {
        setLoading(true)
        try {
            setSession(await apiFetch('/api/session/today'))
            setError('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const start = async () => setSession(await apiFetch('/api/session/start', { method: 'POST', body: {} }))
    const completeTask = async (taskId) => setSession(await apiFetch(`/api/session/${session._id}/complete-task`, { method: 'POST', body: { taskId } }))
    const finish = async () => setSession(await apiFetch(`/api/session/${session._id}/finish`, { method: 'POST', body: {} }))

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>
    if (error) return <div className="text-google-red">{error}</div>

    const completed = session?.tasks?.filter((task) => task.status === 'completed').length || 0
    const icons = {
        revision: Clock,
        learn: BookOpen,
        concept_check: CheckCircle,
        practice: Target,
        mixed: Target,
        'mixed-warmup': Target,
        system_design: Network,
        reflection: CheckCircle,
        mistake_correction: AlertTriangle,
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><PlayCircle className="text-google-green" />Today&apos;s Coach Mission</h1>
                <p className="text-gray-400">A focused loop: revise, learn, practice, diagnose, reflect, and build System Design readiness when enabled.</p>
            </div>

            <GlassPanel>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-400">Progress</p>
                        <p className="text-2xl font-bold">{completed}/{session?.tasks?.length || 0} tasks</p>
                        <p className="text-xs text-google-blue mt-1">{session?.summary?.mission || 'Coach-guided learning loop'} - {session?.summary?.plannedMinutes || 0} min</p>
                    </div>
                    <div className="flex gap-2">
                        {session?.status === 'planned' && <Button icon={PlayCircle} onClick={start}>Start Session</Button>}
                        {session?.status !== 'completed' && <Button variant="green" icon={CheckCircle} onClick={finish}>Finish</Button>}
                    </div>
                </div>
                {session?.summary?.message && <p className="mt-4 text-sm text-google-green">{session.summary.message}</p>}
            </GlassPanel>

            <div className="space-y-3">
                {session?.tasks?.map((task) => (
                    <GlassPanel key={task._id}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    {task.status === 'completed' ? <CheckCircle className="text-google-green" /> : (() => {
                                        const Icon = icons[task.type] || Clock
                                        return <Icon className="text-google-yellow" />
                                    })()}
                                    <p className="font-semibold">{task.title}</p>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{task.reason}</p>
                                <p className="text-xs text-gray-500 mt-1">{task.estimatedMinutes} min - {task.type.replaceAll('_', ' ')}</p>
                            </div>
                            <div className="flex gap-2">
                                {task.link && <Link to={task.link}><Button size="sm" variant="glass">Open</Button></Link>}
                                {task.status !== 'completed' && <Button size="sm" onClick={() => completeTask(task._id)}>Mark Done</Button>}
                            </div>
                        </div>
                    </GlassPanel>
                ))}
            </div>
        </div>
    )
}
