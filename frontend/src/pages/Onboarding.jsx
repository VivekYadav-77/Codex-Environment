import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, GraduationCap, Layers, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

const choices = {
    goal: [
        { value: 'college_learning', label: 'College learning' },
        { value: 'placement_prep', label: 'Placement prep' },
        { value: 'interview_prep', label: 'Interview prep' },
    ],
    level: [
        { value: 'beginner', label: 'Beginner' },
        { value: 'knows_basics', label: 'Know basics' },
        { value: 'solving_problems', label: 'Solving problems' },
        { value: 'interview_ready', label: 'Interview ready' },
    ],
    dailyTimeMinutes: [
        { value: 20, label: '20 min' },
        { value: 45, label: '45 min' },
        { value: 90, label: '90 min' },
    ],
}

export default function Onboarding() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        goal: 'placement_prep',
        level: 'beginner',
        dailyTimeMinutes: 45,
        selectedTracks: ['dsa', 'system_design'],
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch('/api/onboarding/me')
            .then((data) => {
                if (data?.completed) setForm({ ...form, ...data })
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const setTrack = (track) => {
        setForm((current) => {
            const hasTrack = current.selectedTracks.includes(track)
            const selectedTracks = hasTrack
                ? current.selectedTracks.filter((item) => item !== track)
                : [...current.selectedTracks, track]
            return { ...current, selectedTracks: selectedTracks.length ? selectedTracks : [track] }
        })
    }

    const save = async () => {
        setSaving(true)
        setError('')
        try {
            await apiFetch('/api/onboarding/me', { method: 'PUT', body: form })
            navigate('/session/today')
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><GraduationCap className="text-google-blue" />Coach Setup</h1>
                <p className="text-gray-400">Tell the platform how to guide your DSA and System Design practice.</p>
            </div>
            {error && <div className="text-google-red">{error}</div>}
            <GlassPanel>
                <div className="grid lg:grid-cols-3 gap-5">
                    <section>
                        <h2 className="font-bold mb-3 flex items-center gap-2"><CheckCircle size={18} />Goal</h2>
                        <div className="space-y-2">
                            {choices.goal.map((item) => (
                                <button key={item.value} onClick={() => setForm({ ...form, goal: item.value })} className={`w-full text-left p-3 rounded-lg border ${form.goal === item.value ? 'border-google-blue bg-google-blue/10' : 'border-white/10 bg-white/5'}`}>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h2 className="font-bold mb-3 flex items-center gap-2"><Layers size={18} />Current Level</h2>
                        <div className="space-y-2">
                            {choices.level.map((item) => (
                                <button key={item.value} onClick={() => setForm({ ...form, level: item.value })} className={`w-full text-left p-3 rounded-lg border ${form.level === item.value ? 'border-google-green bg-google-green/10' : 'border-white/10 bg-white/5'}`}>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h2 className="font-bold mb-3 flex items-center gap-2"><Clock size={18} />Daily Time</h2>
                        <div className="space-y-2">
                            {choices.dailyTimeMinutes.map((item) => (
                                <button key={item.value} onClick={() => setForm({ ...form, dailyTimeMinutes: item.value })} className={`w-full text-left p-3 rounded-lg border ${form.dailyTimeMinutes === item.value ? 'border-google-yellow bg-google-yellow/10' : 'border-white/10 bg-white/5'}`}>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
                <div className="mt-6">
                    <h2 className="font-bold mb-3">Tracks</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                        {[
                            { value: 'dsa', label: 'DSA pattern mastery', text: 'Roadmap, Pattern Lab, practice, revision, mistake diagnosis.' },
                            { value: 'system_design', label: 'System Design readiness', text: 'Concepts, architecture canvas, tradeoff drills, design prompts.' },
                        ].map((track) => (
                            <button key={track.value} onClick={() => setTrack(track.value)} className={`text-left p-4 rounded-lg border ${form.selectedTracks.includes(track.value) ? 'border-google-blue bg-google-blue/10' : 'border-white/10 bg-white/5'}`}>
                                <p className="font-semibold">{track.label}</p>
                                <p className="text-sm text-gray-400 mt-1">{track.text}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <Button className="mt-6" icon={CheckCircle} onClick={save} loading={saving}>Save and Start Today</Button>
            </GlassPanel>
        </div>
    )
}
