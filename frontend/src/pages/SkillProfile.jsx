import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Award, Brain, CheckCircle, Compass, Loader2, Target } from 'lucide-react'
import { GlassPanel } from '../components/ui/Glass'
import { Button } from '../components/ui/Button'
import { apiFetch } from '../api/client'

const Metric = ({ label, value, tone = '' }) => (
    <div className="glass-card p-4">
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-3xl font-bold ${tone}`}>{value}</p>
    </div>
)

export default function SkillProfile() {
    const [profile, setProfile] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [memory, setMemory] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch('/api/coach/me/skill-profile').then(setProfile).catch((err) => setError(err.message))
        apiFetch('/api/analytics/me/learning').then(setAnalytics).catch(() => setAnalytics(null))
        apiFetch('/api/coach/me/memory').then(setMemory).catch(() => setMemory(null))
    }, [])

    if (error) return <div className="text-google-red">{error}</div>
    if (!profile) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>

    const earnedBadges = profile.badges?.filter((badge) => badge.earned) || []
    const lockedBadges = profile.badges?.filter((badge) => !badge.earned) || []
    const acceptedProblems = profile.proofPortfolio?.acceptedProblems || []
    const masteredPatterns = profile.proofPortfolio?.masteredPatterns || []

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><Brain className="text-google-blue" />Learner Value Profile</h1>
                    <p className="text-gray-400">{profile.profileSummary?.headline || 'A practical view of readiness, proof, gaps, and next action.'}</p>
                </div>
                <Link to={profile.nextUpgrade?.action || '/session/today'}><Button icon={Compass}>Next Upgrade</Button></Link>
            </div>

            <GlassPanel>
                <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-6">
                    <div>
                        <p className="text-sm text-gray-400">Current identity</p>
                        <h2 className="text-2xl font-bold mt-1">{profile.profileSummary?.learnerLevel}</h2>
                        <p className="text-gray-300 mt-3">{profile.profileSummary?.proof}</p>
                        <div className="grid md:grid-cols-3 gap-3 mt-5">
                            <div className="p-3 rounded-lg bg-white/5"><p className="text-xs text-gray-400">Strongest signal</p><p className="font-semibold text-google-green">{profile.profileSummary?.strength}</p></div>
                            <div className="p-3 rounded-lg bg-white/5"><p className="text-xs text-gray-400">Main gap</p><p className="font-semibold text-google-yellow">{profile.profileSummary?.gap}</p></div>
                            <div className="p-3 rounded-lg bg-white/5"><p className="text-xs text-gray-400">Next value boost</p><p className="font-semibold text-google-blue">{profile.profileSummary?.nextAction}</p></div>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-google-blue/10 border border-google-blue/20">
                        <p className="text-sm text-gray-300">Profile completeness</p>
                        <p className="text-5xl font-bold text-google-blue mt-2">{profile.profileCompleteness?.score || 0}%</p>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-4">
                            <div className="h-full bg-google-blue" style={{ width: `${profile.profileCompleteness?.score || 0}%` }} />
                        </div>
                        <p className="text-sm text-gray-400 mt-3">{profile.nextUpgrade?.label}</p>
                    </div>
                </div>
            </GlassPanel>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Metric label="Readiness" value={`${profile.readinessScore}%`} tone="text-google-green" />
                <Metric label="Solved" value={profile.solved} />
                <Metric label="Consistency" value={`${profile.solveConsistency}%`} tone="text-google-blue" />
                <Metric label="Communication" value={`${profile.communicationScore || 0}%`} tone="text-google-yellow" />
            </div>
            <div className="grid md:grid-cols-4 gap-4">
                <Metric label="Pattern Recognition" value={`${profile.mixedPractice?.recognitionAccuracy || 0}%`} tone="text-google-blue" />
                <Metric label="Hint Dependency" value={profile.hintDependency ?? 0} />
                <Metric label="Revision Health" value={`${profile.revisionHealthScore || 0}%`} tone="text-google-green" />
                <Metric label="Concept Checks" value={`${profile.proofPortfolio?.conceptChecks?.correct || 0}/${profile.proofPortfolio?.conceptChecks?.attempted || 0}`} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Award size={20} />Earned Badges</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                        {earnedBadges.length ? earnedBadges.map((badge) => (
                            <div key={badge.id} className="p-3 rounded-lg bg-google-green/10 border border-google-green/20">
                                <p className="font-semibold text-google-green">{badge.label}</p>
                                <p className="text-xs text-gray-300 mt-1">{badge.reason}</p>
                            </div>
                        )) : <p className="text-gray-400">Badges unlock as your practice creates stronger evidence.</p>}
                    </div>
                    {lockedBadges.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-400 mb-2">Next badges</p>
                            <div className="flex flex-wrap gap-2">
                                {lockedBadges.slice(0, 4).map((badge) => <span key={badge.id} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300">{badge.label}</span>)}
                            </div>
                        </div>
                    )}
                </GlassPanel>
                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle size={20} />Completeness Checklist</h2>
                    <div className="space-y-2">
                        {profile.profileCompleteness?.items?.map((item) => (
                            <Link key={item.key} to={item.action} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10">
                                <span className="text-sm text-gray-300">{item.label}</span>
                                <span className={`text-xs ${item.met ? 'text-google-green' : 'text-google-yellow'}`}>{item.met ? 'Done' : 'Improve'}</span>
                            </Link>
                        ))}
                    </div>
                </GlassPanel>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4">Accepted Proof</h2>
                    <div className="space-y-2">
                        {acceptedProblems.length ? acceptedProblems.map((item) => (
                            <div key={`${item.slug}-${item.solvedAt}`} className="p-3 rounded-lg bg-white/5">
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-xs text-gray-400">{item.difficulty} - {item.patternSlug}</p>
                            </div>
                        )) : <p className="text-gray-400">Accepted solves will appear here.</p>}
                    </div>
                </GlassPanel>
                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4">Mastered Patterns</h2>
                    <div className="space-y-2">
                        {masteredPatterns.length ? masteredPatterns.map((item) => (
                            <Link key={item.slug} to={`/roadmap/${item.slug}`} className="block p-3 rounded-lg bg-white/5 hover:bg-white/10">
                                <div className="flex justify-between text-sm"><span>{item.name}</span><span>{item.score}%</span></div>
                            </Link>
                        )) : <p className="text-gray-400">Mastery appears after repeated accepted practice.</p>}
                    </div>
                </GlassPanel>
                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4">Learner Memory</h2>
                    <p className="text-sm text-gray-300">{memory?.summary || 'Memory will form as you practice, reflect, and revise.'}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {memory?.recentImprovementSignals?.map((signal) => <span key={signal} className="px-2 py-1 rounded bg-google-green/10 text-google-green">{signal}</span>)}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="p-3 rounded-lg bg-white/5"><p className="text-xs text-gray-400">Session Streak</p><p className="text-2xl font-bold">{analytics?.streaks?.dailySession || 0}</p></div>
                        <div className="p-3 rounded-lg bg-white/5"><p className="text-xs text-gray-400">Reflection</p><p className="text-2xl font-bold">{analytics?.streaks?.reflection || 0}</p></div>
                    </div>
                </GlassPanel>
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
