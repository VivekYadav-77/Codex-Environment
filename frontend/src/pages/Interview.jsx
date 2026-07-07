import { useState } from 'react'
import { Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { Briefcase, Loader2, Network, Play, Send } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

export default function Interview() {
    const [session, setSession] = useState(null)
    const [question, setQuestion] = useState(null)
    const [language, setLanguage] = useState('javascript')
    const [code, setCode] = useState('')
    const [result, setResult] = useState(null)
    const [explanation, setExplanation] = useState('')
    const [loading, setLoading] = useState(false)

    const start = async () => {
        setLoading(true)
        const data = await apiFetch('/api/interview/start', { method: 'POST', body: { language } })
        setSession(data.session)
        setQuestion(data.question)
        setCode(data.question.starterCode?.[language] || '')
        setResult(null)
        setLoading(false)
    }

    const run = async () => {
        const data = await apiFetch(`/api/interview/${session._id}/run`, { method: 'POST', body: { language, code } })
        setResult(data)
    }

    const finish = async () => {
        const data = await apiFetch(`/api/interview/${session._id}/finish`, { method: 'POST', body: { explanation } })
        setSession(data)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><Briefcase className="text-google-green" />Interview Mode</h1>
                <p className="text-gray-400">Timed practice with hidden pattern labels and final interviewer feedback.</p>
            </div>
            {!session && (
                <div className="grid md:grid-cols-2 gap-6">
                    <GlassPanel>
                        <Briefcase className="text-google-blue mb-3" />
                        <h2 className="text-xl font-bold mb-2">Coding Interview</h2>
                        <p className="text-sm text-gray-400 mb-4">Timed coding practice with hidden pattern labels, hidden tests, and final interviewer-style feedback.</p>
                        <Button icon={loading ? Loader2 : Play} loading={loading} onClick={start}>Start Coding Interview</Button>
                    </GlassPanel>
                    <GlassPanel>
                        <Network className="text-google-green mb-3" />
                        <h2 className="text-xl font-bold mb-2">System Design Interview</h2>
                        <p className="text-sm text-gray-400 mb-4">Practice requirements, estimates, architecture, bottlenecks, tradeoffs, and final recommendation.</p>
                        <Link to="/system-design"><Button variant="green" icon={Network}>Start Design Drill</Button></Link>
                    </GlassPanel>
                </div>
            )}
            {session && question && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <GlassPanel>
                        <p className="text-sm text-gray-400 mb-2">{question.difficulty}</p>
                        <h2 className="text-2xl font-bold mb-3">{question.title}</h2>
                        <p className="text-gray-300 whitespace-pre-line mb-4">{question.description}</p>
                        <textarea className="glass-input w-full min-h-[120px]" value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explain your approach like an interview." />
                        {result && <p className="mt-4 text-sm text-gray-300">Latest run: {result.status} ({result.passedCount}/{result.totalCount})</p>}
                        {session.status === 'finished' && (
                            <div className="mt-4 p-4 rounded-lg bg-white/5">
                                <p className="font-semibold">Score: {session.finalScore}%</p>
                                <p className="text-sm text-gray-400 mb-3">{session.feedback}</p>
                                {session.report && (
                                    <div className="mb-3 p-3 rounded bg-black/20">
                                        <p className="font-semibold">{session.report.verdict}</p>
                                        <p className="text-xs text-gray-400 mt-1">Next: {session.report.recommendedNextTask}</p>
                                        <p className="text-xs text-google-blue mt-2">{session.report.idealExplanation}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(session.scoreBreakdown || {}).map(([key, value]) => (
                                        <div key={key} className="p-2 rounded bg-black/20">
                                            <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                            <p className="font-semibold">{value}%</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </GlassPanel>
                    <GlassPanel>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="glass-input mb-4"><option value="javascript">JavaScript</option><option value="python">Python</option></select>
                        <div className="h-[520px] rounded-lg overflow-hidden border border-white/10"><Editor height="100%" language={language} value={code} onChange={(value) => setCode(value || '')} theme="vs-dark" /></div>
                        <div className="flex gap-3 mt-4"><Button className="flex-1" icon={Play} onClick={run}>Run Hidden Tests</Button><Button className="flex-1" variant="green" icon={Send} onClick={finish}>Finish</Button></div>
                    </GlassPanel>
                </div>
            )}
        </div>
    )
}
