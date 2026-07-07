import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Brain, Loader2, Network, Route, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

const bands = [
    { id: 'beginner', label: 'Foundation', description: 'Core signals, invariants, and basic implementation habits.' },
    { id: 'intermediate', label: 'Pattern Fluency', description: 'Transfer patterns across problem statements and edge cases.' },
    { id: 'advanced', label: 'Interview Depth', description: 'Explain tradeoffs, optimize confidently, and handle hard variants.' },
]

export default function Learn() {
    const [patterns, setPatterns] = useState([])
    const [concepts, setConcepts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            apiFetch('/api/patterns').catch(() => []),
            apiFetch('/api/system-design/concepts').catch(() => []),
        ]).then(([patternData, conceptData]) => {
            setPatterns(patternData)
            setConcepts(conceptData)
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>

    const patternStats = {
        objectives: patterns.reduce((sum, pattern) => sum + (pattern.learningObjectives?.length || 0), 0),
        checks: patterns.length * 3,
        practiceSets: patterns.reduce((sum, pattern) => sum + (pattern.guidedProblemSlugs?.length || 0) + (pattern.mixedProblemSlugs?.length || 0) + (pattern.interviewProblemSlugs?.length || 0), 0),
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><BookOpen className="text-google-blue" />Learn</h1>
                    <p className="text-gray-400">One learning hub for DSA patterns and System Design concepts.</p>
                </div>
                <Link to="/onboarding"><Button variant="glass" icon={Sparkles}>Tune Coach</Button></Link>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
                <div className="glass-card p-4"><p className="text-sm text-gray-400">DSA Patterns</p><p className="text-3xl font-bold text-google-blue">{patterns.length}</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Learning Objectives</p><p className="text-3xl font-bold text-google-green">{patternStats.objectives}</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Concept Checks</p><p className="text-3xl font-bold text-google-yellow">{patternStats.checks}</p></div>
                <div className="glass-card p-4"><p className="text-sm text-gray-400">Practice Links</p><p className="text-3xl font-bold">{patternStats.practiceSets}</p></div>
            </div>
            <GlassPanel>
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2"><Route size={20} />Structured DSA Curriculum</h2>
                        <p className="text-sm text-gray-400">Every concept follows the same path: objectives, mental model, worked example, template, mistakes, practice, and checkpoint.</p>
                    </div>
                    <Link to="/roadmap"><Button size="sm">Open Roadmap</Button></Link>
                </div>
                <div className="grid lg:grid-cols-3 gap-4">
                    {bands.map((band) => {
                        const items = patterns.filter((pattern) => pattern.difficultyBand === band.id)
                        return (
                            <div key={band.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="font-semibold text-google-blue">{band.label}</p>
                                <p className="text-sm text-gray-400 mt-1">{band.description}</p>
                                <div className="mt-4 space-y-2">
                                    {items.map((pattern) => (
                                        <Link key={pattern.slug} to={`/roadmap/${pattern.slug}`} className="block p-3 rounded-lg bg-black/20 hover:bg-white/10">
                                            <div className="flex justify-between gap-3">
                                                <p className="font-semibold">{pattern.name}</p>
                                                <span className="text-xs text-google-green">{pattern.learningObjectives?.length || 0} goals</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{pattern.signalRules?.[0] || pattern.whenToUse}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </GlassPanel>
            <div className="grid lg:grid-cols-2 gap-6">
                <GlassPanel>
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2"><Route size={20} />DSA Pattern Lab</h2>
                            <p className="text-sm text-gray-400">Learn signals, traps, templates, and guided practice.</p>
                        </div>
                        <Link to="/roadmap"><Button size="sm">Roadmap</Button></Link>
                    </div>
                    <div className="space-y-3 max-h-[620px] overflow-y-auto">
                        {patterns.map((pattern) => (
                            <Link key={pattern.slug} to={`/roadmap/${pattern.slug}`} className="block p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
                                <div className="flex justify-between gap-3">
                                    <p className="font-semibold">{pattern.name}</p>
                                    <span className="text-xs text-google-blue capitalize">{pattern.difficultyBand}</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{pattern.description}</p>
                                <p className="text-xs text-google-green mt-2">{pattern.signalRules?.[0] || pattern.whenToUse}</p>
                            </Link>
                        ))}
                    </div>
                </GlassPanel>
                <GlassPanel>
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2"><Network size={20} />System Design Studio</h2>
                            <p className="text-sm text-gray-400">Practice components, tradeoffs, estimation, and case studies.</p>
                        </div>
                        <Link to="/system-design"><Button size="sm" variant="green">Studio</Button></Link>
                    </div>
                    <div className="space-y-3 max-h-[620px] overflow-y-auto">
                        {concepts.map((concept) => (
                            <Link key={concept.slug} to={`/system-design/${concept.slug}`} className="block p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
                                <div className="flex justify-between gap-3">
                                    <p className="font-semibold">{concept.title}</p>
                                    <span className="text-xs text-google-yellow capitalize">{concept.category.replaceAll('_', ' ')}</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{concept.summary}</p>
                                <p className="text-xs text-google-green mt-2">{concept.analogy}</p>
                            </Link>
                        ))}
                    </div>
                </GlassPanel>
            </div>
            <GlassPanel>
                <h2 className="text-xl font-bold flex items-center gap-2"><Brain size={20} />How the coach uses this</h2>
                <p className="text-gray-400 mt-2">Today picks one concept, one practice action, one revision or mistake correction, and one reflection so learning does not turn into random browsing.</p>
            </GlassPanel>
        </div>
    )
}
