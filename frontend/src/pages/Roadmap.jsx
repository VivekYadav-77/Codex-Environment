import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CheckCircle, Lock, Map, RotateCcw, Target } from 'lucide-react'
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

    useEffect(() => {
        const load = async () => {
            const [trackData, masteryData] = await Promise.all([
                apiFetch('/api/tracks/dsa-foundations-to-interview-ready'),
                user ? apiFetch('/api/coach/me/mastery') : apiFetch('/api/patterns').then((patterns) => patterns.map((pattern, idx) => ({ pattern, masteryScore: 0, status: idx === 0 ? 'learning' : 'locked' }))),
            ])
            setTrack(trackData)
            setMastery(masteryData)
        }

        load().catch(console.error)
    }, [user])

    const masteryMap = new Map(mastery.map((item) => [item.pattern.slug, item]))

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                    <Map className="text-google-green" />
                    Pattern Roadmap
                </h1>
                <p className="text-gray-400">{track?.targetOutcome || 'A structured path from fundamentals to interview readiness.'}</p>
            </div>

            <GlassPanel>
                <div className="space-y-3">
                    {track?.patterns?.map((entry) => {
                        const item = masteryMap.get(entry.patternSlug)
                        const pattern = entry.pattern
                        const Icon = statusIcon[item?.status] || Target
                        return (
                            <Link key={entry.patternSlug} to={`/roadmap/${entry.patternSlug}`} className="block">
                                <div className="grid md:grid-cols-[48px_1fr_120px] gap-4 items-center p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Icon size={20} className={item?.status === 'mastered' ? 'text-google-green' : 'text-google-blue'} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{entry.order}. {pattern?.name}</p>
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
            </GlassPanel>
        </div>
    )
}
