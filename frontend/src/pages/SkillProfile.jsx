import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Brain, Compass, Loader2, Target } from 'lucide-react'
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
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Level</p><p className="text-lg font-bold text-google-blue">{profile.readinessLevel?.label || 'Foundation Ready'}</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Solved</p><p className="text-3xl font-bold">{profile.solved}</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Consistency</p><p className="text-3xl font-bold text-google-blue">{profile.solveConsistency}%</p></div>
            </div>
            <GlassPanel>
                <h2 className="text-xl font-bold mb-3">Readiness Path</h2>
                <p className="text-sm text-gray-400 mb-4">Next missing requirement: {profile.readinessLevel?.nextMissingRequirement}</p>
                <div className="grid md:grid-cols-5 gap-2">
                    {profile.readinessLevel?.levels?.map((level) => {
                        const met = level.requirements.every((requirement) => requirement.met)
                        return <div key={level.id} className={`p-3 rounded-lg border text-sm ${met ? 'border-google-green/30 bg-google-green/5 text-google-green' : 'border-white/10 bg-white/5 text-gray-400'}`}>{level.label}</div>
                    })}
                </div>
            </GlassPanel>
            <div className="grid lg:grid-cols-2 gap-6">
                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Compass size={20} />Recommended Path</h2>
                    <div className="space-y-3">
                        {profile.recommendedPlan?.map((item, index) => (
                            <Link key={`${item.type}-${index}`} to={item.link} className="block p-3 rounded-lg bg-white/5 hover:bg-white/10">
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-gray-400">{item.reason}</p>
                            </Link>
                        ))}
                    </div>
                </GlassPanel>
                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4">Readiness Blockers</h2>
                    <div className="space-y-3">
                        {profile.blockers?.length ? profile.blockers.map((blocker) => (
                            <div key={blocker} className="p-3 rounded-lg bg-google-yellow/10 border border-google-yellow/20 text-sm text-gray-300">{blocker}</div>
                        )) : <p className="text-gray-400">No major blockers yet. Keep building signal through practice.</p>}
                    </div>
                </GlassPanel>
            </div>
            <GlassPanel>
                <h2 className="text-xl font-bold mb-4">Pattern Recognition</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-white/5"><p className="text-sm text-gray-400">Mixed Attempts</p><p className="text-2xl font-bold">{profile.mixedPractice?.attempted || 0}</p></div>
                    <div className="p-4 rounded-lg bg-white/5"><p className="text-sm text-gray-400">Pattern Guesses</p><p className="text-2xl font-bold">{profile.mixedPractice?.guesses || 0}</p></div>
                    <div className="p-4 rounded-lg bg-white/5"><p className="text-sm text-gray-400">Recognition Accuracy</p><p className="text-2xl font-bold text-google-blue">{profile.mixedPractice?.recognitionAccuracy || 0}%</p></div>
                </div>
            </GlassPanel>
            <GlassPanel>
                <h2 className="text-xl font-bold mb-4">Detected Misconceptions</h2>
                <div className="space-y-3">
                    {profile.misconceptions?.length ? profile.misconceptions.map((item) => (
                        <Link key={item.slug} to={`/misconceptions/${item.slug}`} className="block p-3 rounded-lg bg-white/5 hover:bg-white/10">
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-gray-400">{item.correction}</p>
                        </Link>
                    )) : <p className="text-gray-400">No clear misconception pattern yet.</p>}
                </div>
            </GlassPanel>
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
                                <div>
                                    <p className="capitalize">{item.title || item.tag.replaceAll('_', ' ')}</p>
                                    <p className="text-xs text-gray-400">{item.advice}</p>
                                </div>
                                <span className="font-semibold text-google-yellow">{item.count}</span>
                            </div>
                        )) : <p className="text-gray-400">No mistake data yet. Run a few submissions.</p>}
                    </div>
                </GlassPanel>
            </div>
        </div>
    )
}
