import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CheckCircle, Loader2, Lock, Map as MapIcon, RotateCcw, Target } from 'lucide-react'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

const statusIcon = {
    mastered: CheckCircle,
    review: RotateCcw,
    practicing: Target,
    learning: Target,
    locked: Lock,
}

export default function Roadmap() {
    const { user } = useSelector((state) => state.auth)
    const [track, setTrack] = useState(null)
    const [mastery, setMastery] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError('')
            try {
                const [trackData, masteryData] = await Promise.all([
                    apiFetch('/api/tracks/dsa-foundations-to-interview-ready'),
                    user ? apiFetch('/api/coach/me/mastery') : apiFetch('/api/patterns').then((patterns) => patterns.map((pattern, idx) => ({ pattern, masteryScore: 0, status: idx === 0 ? 'learning' : 'locked' }))),
                ])
                setTrack(trackData)
                setMastery(masteryData)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [user])

    const masteryMap = new Map(mastery.map((item) => [item.pattern.slug, item]))

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                    <MapIcon className="text-google-green" />
                    Pattern Roadmap
                </h1>
                <p className="text-gray-400">{track?.targetOutcome || 'A structured path from fundamentals to interview readiness.'}</p>
            </div>

            <GlassPanel>
                {loading && (
                    <div className="h-40 flex items-center justify-center gap-3 text-gray-400">
                        <Loader2 className="animate-spin text-google-blue" />
                        Loading roadmap...
                    </div>
                )}
                {error && !loading && (
                    <div className="p-5 rounded-lg border border-google-red/30 bg-google-red/5">
                        <p className="font-semibold text-google-red">Could not load roadmap</p>
                        <p className="text-sm text-gray-400 mt-1">{error}</p>
                    </div>
                )}
                {!loading && !error && (
                <div className="relative space-y-4">
                    <div className="absolute left-5 top-8 bottom-8 w-px bg-white/10 hidden md:block" />
                    {track?.patterns?.map((entry, index) => {
                        const item = masteryMap.get(entry.patternSlug)
                        const pattern = entry.pattern
                        const Icon = statusIcon[item?.status] || Target
                        const isCurrent = item?.status === 'learning' || item?.status === 'practicing' || item?.status === 'review'
                        return (
                            <Link key={entry.patternSlug} to={`/roadmap/${entry.patternSlug}`} className="block">
                                <div className={`relative grid md:grid-cols-[48px_1fr_140px] gap-4 items-center p-4 rounded-lg border transition-colors ${isCurrent ? 'bg-google-blue/10 border-google-blue/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item?.status === 'locked' ? 'bg-white/5' : 'bg-white/10 ring-2 ring-white/10'}`}>
                                        <Icon size={20} className={item?.status === 'mastered' ? 'text-google-green' : 'text-google-blue'} />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold">{entry.order}. {pattern?.name}</p>
                                            {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-google-blue/20 text-google-blue">Current focus</span>}
                                        </div>
                                        <p className="text-sm text-gray-400">{pattern?.description}</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>{item?.status || 'locked'}</span>
                                            <span>{item?.masteryScore || 0}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-google-green" style={{ width: `${item?.masteryScore || 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
                )}
            </GlassPanel>
        </div>
    )
}
