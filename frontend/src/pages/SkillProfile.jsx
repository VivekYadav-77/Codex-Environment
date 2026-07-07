import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Brain, Loader2, Target } from 'lucide-react'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

export default function SkillProfile() {
    const [profile, setProfile] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch('/api/coach/me/skill-profile').then(setProfile).catch((err) => setError(err.message))
    }, [])

    if (error) return <div className="text-google-red">{error}</div>
    if (!profile) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><Brain className="text-google-blue" />Learner Skill Profile</h1>
                <p className="text-gray-400">A practical view of readiness, mastery, mistakes, and revision health.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Readiness</p><p className="text-3xl font-bold text-google-green">{profile.readinessScore}%</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Solved</p><p className="text-3xl font-bold">{profile.solved}</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Consistency</p><p className="text-3xl font-bold text-google-blue">{profile.solveConsistency}%</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Revision Queue</p><p className="text-3xl font-bold text-google-yellow">{profile.revisionHealth?.queued || 0}</p></div>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
                <GlassPanel className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Target size={20} />Pattern Mastery</h2>
                    <div className="space-y-3">
                        {profile.mastery?.map((item) => (
                            <Link key={item.pattern.slug} to={`/roadmap/${item.pattern.slug}`} className="block p-3 rounded-lg bg-white/5 hover:bg-white/10">
                                <div className="flex justify-between text-sm mb-2"><span>{item.pattern.name}</span><span>{item.masteryScore}%</span></div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-google-green" style={{ width: `${item.masteryScore}%` }} /></div>
                            </Link>
                        ))}
                    </div>
                </GlassPanel>
                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity size={20} />Mistake Signals</h2>
                    <div className="space-y-3">
                        {profile.mistakeDistribution?.length ? profile.mistakeDistribution.map((item) => (
                            <div key={item.tag} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                <span className="capitalize">{item.tag.replaceAll('_', ' ')}</span>
                                <span className="font-semibold text-google-yellow">{item.count}</span>
                            </div>
                        )) : <p className="text-gray-400">No mistake data yet. Run a few submissions.</p>}
                    </div>
                </GlassPanel>
            </div>
        </div>
    )
}
