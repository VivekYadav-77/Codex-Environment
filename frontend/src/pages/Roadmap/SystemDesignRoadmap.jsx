import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Network, Server, Database, Shield, Layers, Zap,
    Globe, ArrowRight, BookOpen, Play, CheckCircle,
    Clock, Trophy, ChevronRight, Cpu, Cloud
} from 'lucide-react'

const PHASES = [
    {
        phase: 1,
        title: 'Fundamentals',
        description: 'Build the vocabulary of distributed systems — the concepts every architect knows cold.',
        color: '#4285F4',
        icon: 'Globe',
        tier: 'beginner',
        topics: [
            { id: 'client-server-model', title: 'Client-Server Model', description: 'Requests, responses, and the basic architecture of the web.', learnPath: '/tracks' },
            { id: 'dns-cdn', title: 'DNS & CDN', description: 'Domain resolution hierarchy and how CDNs edge-cache content globally.', learnPath: '/tracks' },
            { id: 'http-https', title: 'HTTP & HTTPS', description: 'The protocol powering the web — methods, status codes, TLS.', learnPath: '/tracks' },
            { id: 'rest-graphql', title: 'REST vs GraphQL', description: 'Resource-based vs query-based APIs — when to use which.', learnPath: '/tracks' },
            { id: 'latency-throughput', title: 'Latency & Throughput', description: 'The two key metrics of system performance and how they conflict.', learnPath: '/tracks' },
            { id: 'cap-theorem', title: 'CAP Theorem', description: 'Consistency, Availability, Partition Tolerance — you can only pick two.', learnPath: '/tracks' },
        ]
    },
    {
        phase: 2,
        title: 'Core Components',
        description: 'The building blocks every production system is composed of.',
        color: '#34A853',
        icon: 'Server',
        tier: 'intermediate',
        topics: [
            { id: 'load-balancing', title: 'Load Balancing', description: 'Distribute traffic across servers — round robin, least connections, consistent hashing.', learnPath: '/tracks' },
            { id: 'caching', title: 'Caching Strategies', description: 'Cache-aside, write-through, write-back, and TTL invalidation.', learnPath: '/tracks' },
            { id: 'databases-sql-nosql', title: 'SQL vs NoSQL', description: 'When to choose relational vs document, key-value, or graph databases.', learnPath: '/tracks' },
            { id: 'consistent-hashing', title: 'Consistent Hashing', description: 'Distribute data across nodes with minimal reshuffling when nodes change.', learnPath: '/tracks' },
            { id: 'replication', title: 'Database Replication', description: 'Leader-follower, multi-leader, and leaderless replication strategies.', learnPath: '/tracks' },
            { id: 'sharding', title: 'Database Sharding', description: 'Horizontal partitioning strategies — range, hash, and directory-based.', learnPath: '/tracks' },
        ]
    },
    {
        phase: 3,
        title: 'Scalability Patterns',
        description: 'Architect systems that grow gracefully from thousands to billions of users.',
        color: '#FBBC04',
        icon: 'Layers',
        tier: 'intermediate',
        topics: [
            { id: 'horizontal-vs-vertical', title: 'Horizontal vs Vertical Scaling', description: 'Scale up vs scale out — tradeoffs, cost, and implementation.', learnPath: '/tracks' },
            { id: 'message-queues', title: 'Message Queues & Pub/Sub', description: 'Decouple producers and consumers with Kafka, RabbitMQ, and SQS.', learnPath: '/tracks' },
            { id: 'microservices', title: 'Microservices Architecture', description: 'Break a monolith into services — API gateways, service discovery, circuit breakers.', learnPath: '/tracks' },
            { id: 'rate-limiting', title: 'Rate Limiting', description: 'Token bucket, leaky bucket, and sliding window counter algorithms.', learnPath: '/tracks' },
            { id: 'service-mesh', title: 'Service Mesh', description: 'Istio, Envoy — sidecar proxies for observability, security, and traffic management.', learnPath: '/tracks' },
            { id: 'event-driven', title: 'Event-Driven Architecture', description: 'React to events asynchronously for high throughput and loose coupling.', learnPath: '/tracks' },
        ]
    },
    {
        phase: 4,
        title: 'Storage & Data',
        description: 'Deep-dive into databases, distributed storage, and data consistency models.',
        color: '#EA4335',
        icon: 'Database',
        tier: 'advanced',
        topics: [
            { id: 'acid-properties', title: 'ACID vs BASE', description: 'Transactional guarantees in SQL vs eventual consistency in NoSQL.', learnPath: '/tracks' },
            { id: 'data-warehousing', title: 'Data Warehousing & OLAP', description: 'Columnar storage, star schemas, and analytics at scale.', learnPath: '/tracks' },
            { id: 'blob-storage', title: 'Blob Storage', description: 'Store and serve unstructured data — S3, GCS, and CDN integration.', learnPath: '/tracks' },
            { id: 'search-engines', title: 'Search Engines', description: 'Inverted indexes, relevance ranking, and Elasticsearch architecture.', learnPath: '/tracks' },
            { id: 'time-series-db', title: 'Time Series Databases', description: 'Store metrics and events with InfluxDB, Prometheus, and TimescaleDB.', learnPath: '/tracks' },
        ]
    },
    {
        phase: 5,
        title: 'Reliability & Performance',
        description: 'Build systems that are fast, fault-tolerant, and observable in production.',
        color: '#8B5CF6',
        icon: 'Shield',
        tier: 'advanced',
        topics: [
            { id: 'fault-tolerance', title: 'Fault Tolerance & Redundancy', description: 'Active-passive failover, chaos engineering, and graceful degradation.', learnPath: '/tracks' },
            { id: 'circuit-breakers', title: 'Circuit Breakers & Bulkheads', description: 'Prevent cascading failures with Hystrix and Resilience4j patterns.', learnPath: '/tracks' },
            { id: 'observability', title: 'Observability: Logs, Metrics, Traces', description: 'The three pillars of production visibility — Datadog, Jaeger, Grafana.', learnPath: '/tracks' },
            { id: 'disaster-recovery', title: 'Disaster Recovery & Backups', description: 'RPO/RTO objectives, multi-region setups, and backup strategies.', learnPath: '/tracks' },
            { id: 'content-delivery', title: 'Content Delivery at Scale', description: 'Serve static assets globally with edge caching and geo-routing.', learnPath: '/tracks' },
        ]
    },
    {
        phase: 6,
        title: 'Industry Case Studies',
        description: 'Apply everything by designing real systems that power billions of users.',
        color: '#F97316',
        icon: 'Trophy',
        tier: 'expert',
        topics: [
            { id: 'design-url-shortener', title: 'URL Shortener (bit.ly)', description: 'Base62 encoding, 301 vs 302 redirects, and analytics tracking.', learnPath: '/tracks' },
            { id: 'design-rate-limiter', title: 'Rate Limiter', description: 'Token bucket and sliding window at API scale using Redis.', learnPath: '/tracks' },
            { id: 'design-twitter-feed', title: 'Twitter News Feed', description: 'Push vs pull fanout, timeline caching, and celebrity user optimization.', learnPath: '/tracks' },
            { id: 'design-notification', title: 'Notification Service', description: 'Push, email, and SMS at scale — priority queues and delivery guarantees.', learnPath: '/tracks' },
            { id: 'design-video-streaming', title: 'Video Streaming (YouTube)', description: 'Transcoding pipeline, HLS/DASH adaptive streaming, and CDN chunk delivery.', learnPath: '/tracks' },
            { id: 'design-uber', title: 'Ride Hailing (Uber)', description: 'Geospatial indexing, WebSocket real-time tracking, and matching engines.', learnPath: '/tracks' },
            { id: 'design-web-crawler', title: 'Web Crawler', description: 'BFS with politeness, distributed URL queues, and deduplication.', learnPath: '/tracks' },
        ]
    },
]

const ICON_MAP = { Globe, Server, Database, Shield, Layers, Zap, Network, Cpu, Cloud, Trophy }

const TIER_CONFIG = {
    beginner: { label: 'Beginner', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    intermediate: { label: 'Intermediate', bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
    advanced: { label: 'Advanced', bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
    expert: { label: 'Expert', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
}

export default function SystemDesignRoadmap() {
    const [selectedPhase, setSelectedPhase] = useState(null)
    const totalTopics = PHASES.reduce((acc, p) => acc + p.topics.length, 0)

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero */}
            <div className="relative mb-10 p-8 rounded-2xl overflow-hidden border border-white/10"
                style={{ background: 'linear-gradient(135deg, rgba(234,67,53,0.15) 0%, rgba(139,92,246,0.12) 50%, rgba(249,115,22,0.08) 100%)' }}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,67,53,0.18),transparent_60%)]" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-google-red/20 border border-google-red/30 flex items-center justify-center">
                            <Network className="text-google-red" size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-google-red uppercase tracking-widest mb-0.5">Architecture & Design</p>
                            <h1 className="text-3xl md:text-4xl font-bold">System Design Roadmap</h1>
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg max-w-3xl mb-6">
                        Master how to design scalable, reliable, and maintainable systems — from a simple web server
                        to <span className="text-violet-400 font-semibold">Google-scale infrastructure</span>.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <Layers size={14} className="text-google-red" />
                            <span className="text-gray-300"><span className="font-bold text-white">6</span> Phases</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <BookOpen size={14} className="text-violet-400" />
                            <span className="text-gray-300"><span className="font-bold text-white">{totalTopics}</span> Topics</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <Trophy size={14} className="text-google-yellow" />
                            <span className="text-gray-300">Industry Case Studies Included</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phase Cards Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {PHASES.map((phase, idx) => {
                    const Icon = ICON_MAP[phase.icon] || Network
                    const tier = TIER_CONFIG[phase.tier]
                    const isSelected = selectedPhase === phase.phase

                    return (
                        <motion.div
                            key={phase.phase}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.07 }}
                            onClick={() => setSelectedPhase(isSelected ? null : phase.phase)}
                            className={`rounded-2xl border cursor-pointer transition-all overflow-hidden ${
                                isSelected ? 'border-white/25 shadow-xl' : 'border-white/8 hover:border-white/18'
                            }`}
                            style={{
                                background: isSelected
                                    ? `linear-gradient(145deg, ${phase.color}18, rgba(0,0,0,0.5))`
                                    : 'rgba(255,255,255,0.03)'
                            }}
                        >
                            {/* Phase Header */}
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: phase.color + '22', border: `1px solid ${phase.color}44` }}
                                    >
                                        <Icon size={22} style={{ color: phase.color }} />
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${tier.bg} ${tier.text} ${tier.border}`}>
                                        {tier.label}
                                    </span>
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Phase {phase.phase}</p>
                                <h3 className="text-lg font-bold text-white mb-2">{phase.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{phase.description}</p>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
                                    <span className="text-xs text-gray-500">{phase.topics.length} topics</span>
                                    <ChevronRight
                                        size={16}
                                        className={`text-gray-500 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Expanded topic list */}
                            {isSelected && (
                                <div className="border-t border-white/8 p-4 space-y-2">
                                    {phase.topics.map(topic => (
                                        <Link
                                            key={topic.id}
                                            to={topic.learnPath}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 hover:border-white/15 transition-all group"
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: phase.color }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white leading-tight">{topic.title}</p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{topic.description}</p>
                                            </div>
                                            <ArrowRight size={14} className="text-gray-600 group-hover:text-gray-300 transition-colors flex-shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {/* CTA Section */}
            <div className="mt-10 p-6 rounded-2xl border border-white/10 bg-white/3 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Ready to practice design?</h3>
                    <p className="text-sm text-gray-400">The structured tracks include interactive case-study walkthroughs, draft whiteboards, and AI-scored design attempts.</p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                    <Link
                        to="/system-design"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-google-red/20 border border-google-red/30 hover:bg-google-red/30 text-sm font-semibold text-white transition-colors"
                    >
                        <Network size={16} className="text-google-red" />
                        Open Design Studio
                    </Link>
                    <Link
                        to="/tracks"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/8 border border-white/12 hover:bg-white/15 text-sm font-semibold text-white transition-colors"
                    >
                        <BookOpen size={16} />
                        View Tracks
                    </Link>
                </div>
            </div>
        </div>
    )
}
