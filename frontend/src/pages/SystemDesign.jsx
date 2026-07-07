import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle, Loader2, Network, Save, Send } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

const blankAttempt = {
    requirements: '',
    estimates: '',
    highLevelDesign: '',
    bottlenecks: '',
    tradeoffs: '',
    finalRecommendation: '',
}

const componentPalette = ['Client', 'Load Balancer', 'API Service', 'Cache', 'Database', 'Queue', 'Worker', 'CDN']

export default function SystemDesign() {
    const { slug } = useParams()
    const [concepts, setConcepts] = useState([])
    const [concept, setConcept] = useState(null)
    const [prompts, setPrompts] = useState([])
    const [selectedPrompt, setSelectedPrompt] = useState(null)
    const [attempt, setAttempt] = useState(blankAttempt)
    const [result, setResult] = useState(null)
    const [draftNotes, setDraftNotes] = useState('')
    const [draftSaved, setDraftSaved] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            apiFetch('/api/system-design/concepts'),
            apiFetch('/api/system-design/prompts'),
        ]).then(([conceptData, promptData]) => {
            setConcepts(conceptData)
            setPrompts(promptData)
            setConcept(conceptData.find((item) => item.slug === slug) || conceptData[0])
            setSelectedPrompt(promptData[0])
        }).finally(() => setLoading(false))
    }, [slug])

    const grouped = useMemo(() => concepts.reduce((acc, item) => {
        acc[item.category] = [...(acc[item.category] || []), item]
        return acc
    }, {}), [concepts])

    const submitAttempt = async () => {
        const data = await apiFetch('/api/system-design/attempts', {
            method: 'POST',
            body: { ...attempt, promptSlug: selectedPrompt.slug },
        })
        setResult(data)
    }

    const saveDraft = async () => {
        await apiFetch('/api/system-design/drafts', {
            method: 'POST',
            body: {
                title: selectedPrompt?.title || 'Architecture draft',
                promptSlug: selectedPrompt?.slug || '',
                components: componentPalette.slice(0, 5).map((name, index) => ({ name, x: index * 120, y: index % 2 ? 120 : 40 })),
                connections: ['Client -> Load Balancer', 'Load Balancer -> API Service', 'API Service -> Cache', 'API Service -> Database'],
                notes: draftNotes,
            },
        })
        setDraftSaved(true)
    }

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>
    if (!concept) return <div className="text-gray-400">No System Design content found. Seed the database.</div>

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><Network className="text-google-green" />System Design Studio</h1>
                <p className="text-gray-400">Learn components, sketch architecture, and practice interview tradeoffs.</p>
            </div>
            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                <GlassPanel>
                    <h2 className="font-bold mb-3">Concept Path</h2>
                    <div className="space-y-4">
                        {Object.entries(grouped).map(([category, items]) => (
                            <div key={category}>
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{category.replaceAll('_', ' ')}</p>
                                <div className="space-y-2">
                                    {items.map((item) => (
                                        <Link key={item.slug} to={`/system-design/${item.slug}`} className={`block p-3 rounded-lg text-sm ${item.slug === concept.slug ? 'bg-google-blue/15 border border-google-blue/30' : 'bg-white/5 border border-white/10'}`}>
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassPanel>
                <div className="space-y-6">
                    <GlassPanel>
                        <p className="text-sm text-google-yellow capitalize mb-2">{concept.category.replaceAll('_', ' ')}</p>
                        <h2 className="text-2xl font-bold mb-3">{concept.title}</h2>
                        <p className="text-gray-300">{concept.explanation}</p>
                        <div className="mt-4 p-4 rounded-lg bg-google-green/10 border border-google-green/20">
                            <p className="text-sm text-google-green font-semibold">Real-world analogy</p>
                            <p className="text-sm text-gray-300 mt-1">{concept.analogy}</p>
                        </div>
                        <div className="mt-5 grid md:grid-cols-3 gap-3">
                            {concept.diagram?.map((node, index) => (
                                <div key={node} className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                                    <p className="text-xs text-gray-500">Step {index + 1}</p>
                                    <p className="font-semibold">{node}</p>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                    <div className="grid lg:grid-cols-2 gap-6">
                        <GlassPanel>
                            <h2 className="text-xl font-bold mb-3">Tradeoff Cards</h2>
                            <div className="space-y-3">
                                {concept.tradeoffs?.map((tradeoff) => (
                                    <div key={`${tradeoff.optionA}-${tradeoff.optionB}`} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                        <p className="font-semibold">{tradeoff.optionA} vs {tradeoff.optionB}</p>
                                        <p className="text-sm text-gray-400 mt-1">{tradeoff.decisionRule}</p>
                                    </div>
                                ))}
                            </div>
                        </GlassPanel>
                        <GlassPanel>
                            <h2 className="text-xl font-bold mb-3">Mini Drill</h2>
                            <p className="text-gray-300">{concept.drill?.prompt}</p>
                            <div className="mt-3 space-y-2">
                                {concept.drill?.checklist?.map((item) => (
                                    <p key={item} className="text-sm text-gray-400 flex items-center gap-2"><CheckCircle size={14} className="text-google-green" />{item}</p>
                                ))}
                            </div>
                        </GlassPanel>
                    </div>
                    <GlassPanel>
                        <h2 className="text-xl font-bold mb-4">Architecture Canvas</h2>
                        <div className="grid md:grid-cols-4 gap-3 mb-4">
                            {componentPalette.map((item) => (
                                <div key={item} className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-center">{item}</div>
                            ))}
                        </div>
                        <textarea className="glass-input w-full min-h-[90px]" value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} placeholder="Write component notes, data flow, and tradeoffs." />
                        <Button className="mt-3" variant="green" icon={Save} onClick={saveDraft}>{draftSaved ? 'Draft Saved' : 'Save Draft'}</Button>
                    </GlassPanel>
                    <GlassPanel>
                        <h2 className="text-xl font-bold mb-4">System Design Interview Drill</h2>
                        <select className="glass-input mb-4 w-full" value={selectedPrompt?.slug || ''} onChange={(event) => setSelectedPrompt(prompts.find((item) => item.slug === event.target.value))}>
                            {prompts.map((prompt) => <option key={prompt.slug} value={prompt.slug}>{prompt.title}</option>)}
                        </select>
                        {selectedPrompt && <p className="text-sm text-gray-400 mb-4">{selectedPrompt.scenario}</p>}
                        {Object.keys(blankAttempt).map((field) => (
                            <label key={field} className="block mb-3">
                                <span className="block text-sm font-semibold text-gray-300 mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                                <textarea className="glass-input w-full min-h-[80px]" value={attempt[field]} onChange={(event) => setAttempt({ ...attempt, [field]: event.target.value })} />
                            </label>
                        ))}
                        <Button icon={Send} onClick={submitAttempt}>Submit Design Drill</Button>
                        {result && (
                            <div className="mt-4 p-4 rounded-lg bg-google-blue/10 border border-google-blue/20">
                                <p className="font-semibold">Score: {result.score}%</p>
                                <p className="text-sm text-gray-300 mt-1">{result.feedback}</p>
                            </div>
                        )}
                    </GlassPanel>
                </div>
            </div>
        </div>
    )
}
