import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BookOpen, ChevronRight, Loader2, Sparkles, Play,
    Trophy, Target, ArrowRight, Lock, CheckCircle,
    BarChart3, Database, Network, Layers, Cpu,
    GitBranch, Code2, Brain, Star, Zap
} from 'lucide-react'
import { apiFetch } from '../../api/client'
import { useSelector } from 'react-redux'

// Static track definitions with rich metadata — supplemented by /api/learning/tracks
const STATIC_TRACKS = [
    {
        id: 'dsa-beginner',
        title: 'DSA Foundations',
        subtitle: 'Phase 1–3',
        description: 'Start your DSA journey here. Learn to think in complexity, master arrays, strings, stacks, queues, hashing, and every classic sorting & searching algorithm.',
        tier: 'Beginner',
        icon: 'BarChart3',
        color: '#4285F4',
        gradient: 'from-blue-600/20 to-blue-900/10',
        borderColor: 'border-blue-500/30',
        topics: ['Complexity Analysis', 'Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Hashing', 'Searching & Sorting'],
        lessonCount: 38,
        estimatedHours: '15–20 hrs',
        link: '/roadmap/dsa',
        practiceLink: '/practice',
    },
    {
        id: 'dsa-intermediate',
        title: 'Trees, Graphs & Recursion',
        subtitle: 'Phase 4–6',
        description: 'Climb to the intermediate level. Conquer binary trees, BSTs, heaps, tries, graph traversals (BFS/DFS), shortest paths, MSTs, and recursion+backtracking.',
        tier: 'Intermediate',
        icon: 'GitBranch',
        color: '#34A853',
        gradient: 'from-emerald-600/20 to-emerald-900/10',
        borderColor: 'border-emerald-500/30',
        topics: ['Binary Trees', 'BST & Balanced Trees', 'Heaps & Tries', 'Graph Traversal', 'Shortest Paths', 'Recursion & Backtracking'],
        lessonCount: 44,
        estimatedHours: '25–35 hrs',
        link: '/roadmap/dsa',
        practiceLink: '/practice',
    },
    {
        id: 'dsa-advanced',
        title: 'Dynamic Programming & Greedy',
        subtitle: 'Phase 7–9',
        description: 'The separator between good engineers and great ones. Master greedy algorithms, divide & conquer, and the full spectrum of DP patterns — from Knapsack to Bitmask DP.',
        tier: 'Advanced',
        icon: 'Layers',
        color: '#FBBC04',
        gradient: 'from-yellow-600/20 to-yellow-900/10',
        borderColor: 'border-yellow-500/30',
        topics: ['Greedy Strategy', 'Divide & Conquer', 'DP Memoization & Tabulation', 'DP Patterns (LIS, LCS, Knapsack)', 'Tree DP & Bitmask DP'],
        lessonCount: 31,
        estimatedHours: '30–45 hrs',
        link: '/roadmap/dsa',
        practiceLink: '/practice',
    },
    {
        id: 'dsa-expert',
        title: 'Advanced Algorithms & Interview Mastery',
        subtitle: 'Phase 10–13',
        description: 'Go elite. Deep-dive into segment trees, Fenwick trees, string algorithms (KMP, Manacher), advanced data structures, pattern recognition, and full mock interview prep.',
        tier: 'Expert',
        icon: 'Cpu',
        color: '#EA4335',
        gradient: 'from-red-600/20 to-red-900/10',
        borderColor: 'border-red-500/30',
        topics: ['Sliding Window & Two Pointers', 'Segment Trees & BIT', 'KMP, Z-algorithm, Suffix Arrays', 'Bloom Filter & Skip List', 'DSA Pattern Recognition', 'Mock Interviews'],
        lessonCount: 47,
        estimatedHours: '40–60 hrs',
        link: '/roadmap/dsa',
        practiceLink: '/interview',
    },
    {
        id: 'system-design-foundations',
        title: 'System Design Foundations',
        subtitle: 'SD Phase 1–3',
        description: 'Learn the language of distributed systems. DNS, CDN, CAP Theorem, load balancing, caching, SQL vs NoSQL, consistent hashing, and core scalability patterns.',
        tier: 'Intermediate',
        icon: 'Network',
        color: '#8B5CF6',
        gradient: 'from-violet-600/20 to-violet-900/10',
        borderColor: 'border-violet-500/30',
        topics: ['DNS & CDN', 'CAP Theorem', 'Load Balancing', 'Caching Strategies', 'Database Sharding', 'Microservices'],
        lessonCount: 18,
        estimatedHours: '10–15 hrs',
        link: '/roadmap/system-design',
        practiceLink: '/system-design',
    },
    {
        id: 'system-design-advanced',
        title: 'System Design — Case Studies',
        subtitle: 'SD Phase 4–6',
        description: 'Design real systems: URL shortener, notification service, Twitter feed, YouTube streaming, Uber ride hailing, and web crawlers. The interview gold standard.',
        tier: 'Expert',
        icon: 'Trophy',
        color: '#F97316',
        gradient: 'from-orange-600/20 to-orange-900/10',
        borderColor: 'border-orange-500/30',
        topics: ['Data Warehousing & Search', 'Fault Tolerance & Observability', 'Design: URL Shortener', 'Design: Twitter Feed', 'Design: YouTube Streaming', 'Design: Uber Rides'],
        lessonCount: 12,
        estimatedHours: '15–20 hrs',
        link: '/roadmap/system-design',
        practiceLink: '/system-design',
    },
]

const ICON_MAP = { BarChart3, Database, Network, Layers, Cpu, GitBranch, Code2, Brain, Trophy }

const TIER_CONFIG = {
    Beginner: {
        bg: 'bg-emerald-500/12',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        order: 0,
    },
    Intermediate: {
        bg: 'bg-sky-500/12',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        dot: 'bg-sky-400',
        order: 1,
    },
    Advanced: {
        bg: 'bg-yellow-500/12',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        dot: 'bg-yellow-400',
        order: 2,
    },
    Expert: {
        bg: 'bg-rose-500/12',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-400',
        order: 3,
    },
}

function TrackCard({ track, index }) {
    const [hovered, setHovered] = useState(false)
    const Icon = ICON_MAP[track.icon] || BookOpen
    const tier = TIER_CONFIG[track.tier]

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${track.borderColor} ${
                hovered ? 'shadow-2xl' : ''
            }`}
            style={{
                background: hovered
                    ? `linear-gradient(145deg, ${track.color}18, rgba(15,15,25,0.95))`
                    : `linear-gradient(145deg, ${track.color}0A, rgba(15,15,25,0.9))`,
                boxShadow: hovered ? `0 20px 60px ${track.color}18` : 'none'
            }}
        >
            {/* Top accent bar */}
            <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${track.color}, transparent)` }} />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: track.color + '22', border: `1px solid ${track.color}44` }}
                    >
                        <Icon size={22} style={{ color: track.color }} />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${tier.bg} ${tier.text} ${tier.border}`}>
                            {track.tier}
                        </span>
                        <span className="text-xs text-gray-600">{track.subtitle}</span>
                    </div>
                </div>

                {/* Title & description */}
                <h3 className="text-lg font-bold text-white mb-2 leading-tight">{track.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-5">{track.description}</p>

                {/* Topic chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {track.topics.map((topic) => (
                        <span
                            key={topic}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-gray-400"
                        >
                            {topic}
                        </span>
                    ))}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 pb-5 mb-5 border-b border-white/8 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <BookOpen size={12} />
                        <span>{track.lessonCount} lessons</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Zap size={12} />
                        <span>{track.estimatedHours}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link
                        to={track.link}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all border border-white/12 hover:border-white/22 hover:bg-white/8"
                        style={{ background: `linear-gradient(135deg, ${track.color}28, ${track.color}12)` }}
                    >
                        <Target size={15} style={{ color: track.color }} />
                        View Roadmap
                    </Link>
                    <Link
                        to={track.practiceLink}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all bg-white/5 border border-white/10 hover:bg-white/12 hover:border-white/20"
                    >
                        <Play size={15} className="text-google-blue" />
                        Practice
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}

export default function TrackDashboard() {
    const { user } = useSelector(state => state.auth)
    const [filter, setFilter] = useState('All')
    const filters = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert']
    const filtered = filter === 'All'
        ? STATIC_TRACKS
        : STATIC_TRACKS.filter(t => t.tier === filter)

    // Group by type for display
    const dsaTracks = filtered.filter(t => !t.id.startsWith('system'))
    const sdTracks = filtered.filter(t => t.id.startsWith('system'))

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero */}
            <div className="relative mb-10 p-8 rounded-2xl overflow-hidden border border-white/10"
                style={{ background: 'linear-gradient(135deg, rgba(66,133,244,0.12) 0%, rgba(139,92,246,0.1) 50%, rgba(249,115,22,0.06) 100%)' }}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.15),transparent_65%)]" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/15 flex items-center justify-center">
                            <BookOpen className="text-google-blue" size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-google-blue uppercase tracking-widest mb-0.5">Learning Platform</p>
                            <h1 className="text-3xl md:text-4xl font-bold">Structured Learning Tracks</h1>
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg max-w-3xl mb-6">
                        A complete curriculum from <span className="text-emerald-400 font-semibold">absolute beginner</span> to{' '}
                        <span className="text-rose-400 font-semibold">industry expert</span> — covering every DSA topic
                        and System Design concept you'll need for top-tier tech interviews.
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                        {[
                            { icon: BookOpen, label: '6 structured tracks', color: 'text-google-blue' },
                            { icon: Layers, label: '190+ topics covered', color: 'text-violet-400' },
                            { icon: Code2, label: 'JS, Python, C++, Java', color: 'text-google-green' },
                            { icon: Star, label: 'Beginner → Expert path', color: 'text-google-yellow' },
                        ].map(({ icon: Icon, label, color }) => (
                            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                <Icon size={13} className={color} />
                                <span className="text-gray-300">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Links to Roadmaps */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <Link
                    to="/roadmap/dsa"
                    className="flex items-center gap-4 p-4 rounded-2xl border border-blue-500/25 bg-blue-500/8 hover:bg-blue-500/15 hover:border-blue-500/40 transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <BarChart3 size={20} className="text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-white text-sm">DSA Roadmap</p>
                        <p className="text-xs text-gray-400">13 phases · 190+ topics · Beginner to Expert</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link
                    to="/roadmap/system-design"
                    className="flex items-center gap-4 p-4 rounded-2xl border border-violet-500/25 bg-violet-500/8 hover:bg-violet-500/15 hover:border-violet-500/40 transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                        <Network size={20} className="text-violet-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-white text-sm">System Design Roadmap</p>
                        <p className="text-xs text-gray-400">6 phases · Industry case studies · Production scale</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

            {/* Tier Filter */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                            filter === f
                                ? 'bg-white/12 border-white/25 text-white'
                                : 'bg-white/3 border-white/8 text-gray-400 hover:bg-white/8 hover:text-white'
                        }`}
                    >
                        {f !== 'All' && TIER_CONFIG[f] && (
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${TIER_CONFIG[f].dot}`} />
                        )}
                        {f}
                    </button>
                ))}
            </div>

            {/* DSA Tracks */}
            {dsaTracks.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-px flex-1 bg-white/8" />
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <BarChart3 size={14} className="text-blue-400" />
                            <span className="text-sm font-semibold text-blue-300">Data Structures & Algorithms</span>
                        </div>
                        <div className="h-px flex-1 bg-white/8" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                        {dsaTracks.map((track, i) => (
                            <TrackCard key={track.id} track={track} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* System Design Tracks */}
            {sdTracks.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-px flex-1 bg-white/8" />
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                            <Network size={14} className="text-violet-400" />
                            <span className="text-sm font-semibold text-violet-300">System Design</span>
                        </div>
                        <div className="h-px flex-1 bg-white/8" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                        {sdTracks.map((track, i) => (
                            <TrackCard key={track.id} track={track} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                    <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No tracks for this filter</p>
                    <button onClick={() => setFilter('All')} className="mt-3 text-google-blue hover:underline text-sm">
                        Show all tracks
                    </button>
                </div>
            )}
        </div>
    )
}
