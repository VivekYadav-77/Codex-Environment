import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { BookOpen, CheckCircle, Compass, Loader2, RotateCcw, Target } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

const taskIcon = {
    learn: BookOpen,
    practice: Target,
    revision: RotateCcw,
}

const taskLink = (task) => {
    if (task.type === 'learn') return `/roadmap/${task.patternSlug}`
    if (task.type === 'practice' || task.type === 'revision') return `/practice/${task.topic || 'hashing'}${task.questionId ? `?question=${task.questionId}` : ''}`
    return '/roadmap'
}

export default function Dashboard() {
    const { user } = useSelector((state) => state.auth)
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const load = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                setDashboard(await apiFetch('/api/coach/me/dashboard'))
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [user])

    if (!user) {
        return (
            <div className="max-w-3xl mx-auto pt-12">
                <GlassPanel>
                    <h1 className="text-3xl font-bold mb-3">Your adaptive DSA coach</h1>
                    <p className="text-gray-400 mb-6">Login to see today’s plan, mastery scores, and revision queue.</p>
                    <Link to="/login"><Button>Login to Continue</Button></Link>
                </GlassPanel>
            </div>
        )
    }

    if (loading) {
        return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>
    }

    if (error) {
        return <div className="text-google-red">{error}</div>
    }

    const today = dashboard?.today
    const mastery = dashboard?.mastery || []
    const topWeak = mastery.filter((item) => item.masteryScore < 60).slice(0, 4)

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                    <Compass className="text-google-blue" />
                    Adaptive Coach
                </h1>
                <p className="text-gray-400">Today’s plan is generated from your submissions, mastery, and revision needs.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Solved</p><p className="text-3xl font-bold text-google-green">{today?.summary?.solved || 0}</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Attempted</p><p className="text-3xl font-bold text-google-yellow">{today?.summary?.attempted || 0}</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Strong</p><p className="text-lg font-semibold">{today?.summary?.strongPatterns?.[0] || 'Building'}</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Focus</p><p className="text-lg font-semibold text-google-blue">{today?.summary?.weakPatterns?.[0] || 'Start roadmap'}</p></div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <GlassPanel className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Today’s Plan</h2>
                    <div className="space-y-3">
                        {today?.tasks?.length ? today.tasks.map((task, index) => {
                            const Icon = taskIcon[task.type] || CheckCircle
                            return (
                                <Link key={`${task.type}-${index}`} to={taskLink(task)} className="block">
                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Icon className="text-google-blue" />
                                            <div>
                                                <p className="font-semibold">{task.title}</p>
                                                <p className="text-sm text-gray-400">{task.reason}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        }) : <p className="text-gray-400">Your roadmap is ready. Start with the first pattern.</p>}
                    </div>
                </GlassPanel>

                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4">Weak Patterns</h2>
                    <div className="space-y-3">
                        {topWeak.map((item) => (
                            <Link key={item.pattern.slug} to={`/roadmap/${item.pattern.slug}`} className="block">
                                <div className="p-3 rounded-lg bg-white/5">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>{item.pattern.name}</span>
                                        <span>{item.masteryScore}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-google-blue" style={{ width: `${item.masteryScore}%` }} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </GlassPanel>
            </div>
        </div>
    )
}
