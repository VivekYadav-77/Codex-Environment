import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart3, Database, Search, GitBranch, Network,
    RotateCcw, Zap, Scissors, Layers, Cpu, Box,
    Target, Briefcase, ChevronDown, ChevronRight,
    Lock, CheckCircle, BookOpen, Play, Loader2,
    ArrowRight, Trophy, Clock, Code2, Sparkles
} from 'lucide-react'
import { apiFetch } from '../../api/client'
import { GlassPanel } from '../../components/ui/Glass'

const ICON_MAP = {
    BarChart3, Database, Search, GitBranch, Network,
    RotateCcw, Zap, Scissors, Layers, Cpu, Box,
    Target, Briefcase
}

const TIER_CONFIG = {
    beginner: {
        label: 'Beginner',
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/20',
    },
    intermediate: {
        label: 'Intermediate',
        bg: 'bg-sky-500/15',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        glow: 'shadow-sky-500/20',
    },
    advanced: {
        label: 'Advanced',
        bg: 'bg-violet-500/15',
        text: 'text-violet-400',
        border: 'border-violet-500/30',
        glow: 'shadow-violet-500/20',
    },
    expert: {
        label: 'Expert',
        bg: 'bg-rose-500/15',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        glow: 'shadow-rose-500/20',
    },
}

const TYPE_ICON = {
    concept: BookOpen,
    algorithm: Play,
    pattern: Sparkles,
}

export default function DsaRoadmap() {
    const { topicId } = useParams()
    const navigate = useNavigate()
    const [phases, setPhases] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedPhases, setExpandedPhases] = useState({ 1: true })
    const [selectedTopic, setSelectedTopic] = useState(null)

    useEffect(() => {
        apiFetch('/api/roadmap/dsa')
            .then(data => {
                setPhases(data)
                // Auto-expand beginner phases initially
                const initial = {}
                data.forEach(p => { if (p.tier === 'beginner') initial[p.phase] = true })
                setExpandedPhases(initial)
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    // If a topicId param exists, auto-select that topic
    useEffect(() => {
        if (topicId && phases.length > 0) {
            for (const phase of phases) {
                const topic = phase.topics.find(t => t.id === topicId)
                if (topic) {
                    setSelectedTopic({ ...topic, phase: phase.phase, phaseTitle: phase.title, phaseColor: phase.color })
                    setExpandedPhases(prev => ({ ...prev, [phase.phase]: true }))
                    break
                }
            }
        }
    }, [topicId, phases])

    const togglePhase = (phaseNum) => {
        setExpandedPhases(prev => ({ ...prev, [phaseNum]: !prev[phaseNum] }))
    }

    const totalTopics = phases.reduce((acc, p) => acc + p.topics.length, 0)

    if (loading) return (
        <div className="h-64 flex items-center justify-center gap-3 text-gray-400">
            <Loader2 className="animate-spin text-google-blue" size={24} />
            Loading DSA Roadmap...
        </div>
    )

    if (error) return (
        <div className="p-6 rounded-xl border border-google-red/30 bg-google-red/5 text-google-red">
            Failed to load roadmap: {error}
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="relative mb-10 p-8 rounded-2xl overflow-hidden border border-white/10"
                style={{ background: 'linear-gradient(135deg, rgba(66,133,244,0.15) 0%, rgba(52,168,83,0.1) 50%, rgba(234,67,53,0.08) 100%)' }}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(66,133,244,0.2),transparent_60%)]" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-google-blue/20 border border-google-blue/30 flex items-center justify-center">
                            <BarChart3 className="text-google-blue" size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-google-blue uppercase tracking-widest mb-0.5">Structured Learning</p>
                            <h1 className="text-3xl md:text-4xl font-bold">DSA Roadmap</h1>
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg max-w-3xl mb-6">
                        A complete journey from <span className="text-emerald-400 font-semibold">absolute beginner</span> to{' '}
                        <span className="text-rose-400 font-semibold">industry expert</span> — covering every data structure,
                        algorithm, and pattern you'll ever need.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <Trophy size={14} className="text-google-yellow" />
                            <span className="text-gray-300"><span className="font-bold text-white">13</span> Phases</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <BookOpen size={14} className="text-google-blue" />
                            <span className="text-gray-300"><span className="font-bold text-white">{totalTopics}</span> Topics</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <Code2 size={14} className="text-google-green" />
                            <span className="text-gray-300">4 Languages: JS, Python, C++, Java</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tier Legend */}
            <div className="flex flex-wrap gap-3 mb-8">
                {Object.entries(TIER_CONFIG).map(([tier, config]) => (
                    <div key={tier} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
                        <div className={`w-2 h-2 rounded-full ${config.bg.replace('bg-', 'bg-').replace('/15', '')}`} style={{ backgroundColor: 'currentColor' }} />
                        {config.label}
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
                {/* Left: Phase Accordion */}
                <div className="space-y-3">
                    {phases.map((phase, phaseIdx) => {
                        const Icon = ICON_MAP[phase.icon] || BookOpen
                        const tier = TIER_CONFIG[phase.tier] || TIER_CONFIG.beginner
                        const isExpanded = expandedPhases[phase.phase]

                        return (
                            <motion.div
                                key={phase.phase}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: phaseIdx * 0.04 }}
                                className={`rounded-2xl border overflow-hidden transition-all ${isExpanded ? 'border-white/15 shadow-lg ' + tier.glow : 'border-white/8 hover:border-white/15'}`}
                            >
                                {/* Phase Header */}
                                <button
                                    onClick={() => togglePhase(phase.phase)}
                                    className="w-full flex items-center gap-4 p-5 text-left transition-colors"
                                    style={{
                                        background: isExpanded
                                            ? `linear-gradient(135deg, ${phase.color}18, ${phase.color}08)`
                                            : 'rgba(255,255,255,0.03)'
                                    }}
                                >
                                    <div
                                        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: phase.color + '22', border: `1px solid ${phase.color}44` }}
                                    >
                                        <Icon size={20} style={{ color: phase.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phase {phase.phase}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tier.bg} ${tier.text} border ${tier.border}`}>
                                                {tier.label}
                                            </span>
                                        </div>
                                        <p className="font-bold text-base text-white">{phase.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{phase.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-xs text-gray-500 font-medium hidden sm:block">{phase.topics.length} topics</span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </button>

                                {/* Topics Grid */}
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <div className="p-4 pt-0 border-t border-white/5">
                                                <div className="grid sm:grid-cols-2 gap-2 mt-3">
                                                    {phase.topics.map((topic) => {
                                                        const TypeIcon = TYPE_ICON[topic.type] || BookOpen
                                                        const isSelected = selectedTopic?.id === topic.id
                                                        return (
                                                            <button
                                                                key={topic.id}
                                                                onClick={() => {
                                                                    setSelectedTopic({ ...topic, phase: phase.phase, phaseTitle: phase.title, phaseColor: phase.color })
                                                                    if (topic.algorithmId) {
                                                                        // Navigate to algorithm viewer if it has a linked algorithmId
                                                                    }
                                                                }}
                                                                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                                                                    isSelected
                                                                        ? 'border-white/20 bg-white/10 shadow-sm'
                                                                        : 'border-white/5 bg-white/3 hover:bg-white/8 hover:border-white/12'
                                                                }`}
                                                            >
                                                                <div
                                                                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                                                                    style={{ backgroundColor: phase.color + '20' }}
                                                                >
                                                                    <TypeIcon size={13} style={{ color: phase.color }} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-white leading-tight truncate">{topic.title}</p>
                                                                    <p className="text-xs text-gray-500 capitalize">{topic.type}</p>
                                                                </div>
                                                                {topic.algorithmId && (
                                                                    <Link
                                                                        to={`/algorithms/${topic.category || 'sorting'}/${topic.algorithmId}`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="flex-shrink-0 p-1 rounded-lg bg-google-blue/20 hover:bg-google-blue/30 transition-colors"
                                                                        title="View in Visualizer"
                                                                    >
                                                                        <Play size={11} className="text-google-blue" />
                                                                    </Link>
                                                                )}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Right: Topic Detail Panel */}
                <div className="lg:sticky lg:top-6">
                    <AnimatePresence mode="wait">
                        {selectedTopic ? (
                            <motion.div
                                key={selectedTopic.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="rounded-2xl border border-white/12 overflow-hidden"
                                style={{
                                    background: `linear-gradient(145deg, ${selectedTopic.phaseColor}12, rgba(0,0,0,0.3))`
                                }}
                            >
                                <div className="p-6">
                                    {/* Topic type badge */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                            Phase {selectedTopic.phase} · {selectedTopic.phaseTitle}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-2">{selectedTopic.title}</h2>
                                    <p className="text-gray-300 text-sm leading-relaxed mb-6">{selectedTopic.description}</p>

                                    {/* Topic metadata */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                                            <p className="text-xs text-gray-500 mb-1">Type</p>
                                            <p className="text-sm font-semibold capitalize text-white">{selectedTopic.type}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                                            <p className="text-xs text-gray-500 mb-1">Phase</p>
                                            <p className="text-sm font-semibold text-white">{selectedTopic.phase} of 13</p>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="space-y-3">
                                        {selectedTopic.algorithmId && (
                                            <Link
                                                to={`/algorithms/${selectedTopic.category || 'sorting'}/${selectedTopic.algorithmId}`}
                                                className="flex items-center justify-between w-full p-4 rounded-xl bg-google-blue/20 border border-google-blue/30 hover:bg-google-blue/30 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Play size={18} className="text-google-blue" />
                                                    <div>
                                                        <p className="font-semibold text-sm text-white">Interactive Visualizer</p>
                                                        <p className="text-xs text-gray-400">Step-by-step animation</p>
                                                    </div>
                                                </div>
                                                <ArrowRight size={16} className="text-google-blue group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        )}
                                        <Link
                                            to={`/practice`}
                                            className="flex items-center justify-between w-full p-4 rounded-xl bg-google-green/15 border border-google-green/25 hover:bg-google-green/25 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Code2 size={18} className="text-google-green" />
                                                <div>
                                                    <p className="font-semibold text-sm text-white">Practice Problems</p>
                                                    <p className="text-xs text-gray-400">Apply what you learn</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className="text-google-green group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                                    <Target size={28} className="text-gray-500" />
                                </div>
                                <p className="text-gray-400 font-medium mb-2">Select a topic</p>
                                <p className="text-sm text-gray-600">Click any topic from the roadmap to see details, launch the visualizer, or jump to practice problems.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
