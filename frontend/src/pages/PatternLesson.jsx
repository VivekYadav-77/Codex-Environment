import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, CheckCircle, Loader2, Target } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

export default function PatternLesson() {
    const { patternSlug } = useParams()
    const [data, setData] = useState(null)
    const [checks, setChecks] = useState([])
    const [answers, setAnswers] = useState({})
    const [checkResults, setCheckResults] = useState({})
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch(`/api/patterns/${patternSlug}`).then(setData).catch((err) => setError(err.message))
        apiFetch(`/api/patterns/${patternSlug}/concept-checks`).then(setChecks).catch(() => setChecks([]))
    }, [patternSlug])

    const submitCheck = async (check) => {
        const selectedIndex = answers[check._id]
        if (selectedIndex === undefined) return
        if (check.generated) {
            setCheckResults((current) => ({ ...current, [check._id]: { correct: selectedIndex === check.correctIndex, explanation: check.explanation } }))
            return
        }
        const result = await apiFetch('/api/coach/me/concept-checks/attempt', {
            method: 'POST',
            body: { conceptCheckId: check._id, selectedIndex },
        })
        setCheckResults((current) => ({ ...current, [check._id]: result }))
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto">
                <GlassPanel className="border border-google-red/30">
                    <p className="font-semibold text-google-red">Could not load pattern</p>
                    <p className="text-sm text-gray-400 mt-1">{error}</p>
                </GlassPanel>
            </div>
        )
    }
    if (!data) {
        return <div className="h-64 flex items-center justify-center gap-3 text-gray-400"><Loader2 className="animate-spin text-google-blue" />Loading pattern...</div>
    }

    const { pattern, questions } = data
    const questionMap = new Map(questions.map((question) => [question.slug || question.id, question]))
    const problemGroups = [
        { title: 'Guided Problems', mode: 'guided', slugs: pattern.guidedProblemSlugs || [], fallback: questions.slice(0, 3) },
        { title: 'Mixed Recognition', mode: 'mixed', slugs: pattern.mixedProblemSlugs || [], fallback: questions.slice(3, 6) },
        { title: 'Interview Challenge', mode: 'interview', slugs: pattern.interviewProblemSlugs || [], fallback: questions.slice(0, 1) },
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"><BookOpen className="text-google-blue" />{pattern.name} Lab</h1>
                <p className="text-gray-400">{pattern.description}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <GlassPanel className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><CheckCircle size={20} />Concept Diagnosis</h2>
                        <div className="space-y-4">
                            {checks.map((check) => (
                                <div key={check._id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    <p className="font-semibold mb-3">{check.question}</p>
                                    <div className="space-y-2">
                                        {check.options.map((option, index) => (
                                            <label key={option} className="flex items-center gap-2 text-sm text-gray-300">
                                                <input type="radio" name={check._id} checked={answers[check._id] === index} onChange={() => setAnswers((current) => ({ ...current, [check._id]: index }))} />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                    <Button size="sm" className="mt-3" onClick={() => submitCheck(check)}>Check Readiness</Button>
                                    {checkResults[check._id] && (
                                        <p className={`text-sm mt-3 ${checkResults[check._id].correct ? 'text-google-green' : 'text-google-yellow'}`}>
                                            {checkResults[check._id].correct ? 'Ready signal: ' : 'Review signal: '}
                                            {checkResults[check._id].explanation}
                                        </p>
                                    )}
                                </div>
                            ))}
                            {!checks.length && <p className="text-sm text-gray-400">Concept checks will appear here as content is added.</p>}
                        </div>
                    </section>

                    <div className="grid md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-white/5"><p className="text-xs text-gray-400">Category</p><p className="font-semibold">{pattern.category}</p></div>
                        <div className="p-3 rounded-lg bg-white/5"><p className="text-xs text-gray-400">Level</p><p className="font-semibold capitalize">{pattern.difficultyBand}</p></div>
                        <div className="p-3 rounded-lg bg-white/5"><p className="text-xs text-gray-400">Practice Set</p><p className="font-semibold">{questions.length} problems</p></div>
                    </div>

                    <section><h2 className="text-xl font-bold mb-2">Real-World Analogy</h2><p className="text-gray-300">{pattern.analogy || pattern.mentalModel}</p></section>
                    <section><h2 className="text-xl font-bold mb-2">Mental Model</h2><p className="text-gray-300">{pattern.mentalModel}</p></section>
                    <section><h2 className="text-xl font-bold mb-2">When To Use</h2><p className="text-gray-300">{pattern.whenToUse}</p></section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">Pattern Signal Detector</h2>
                        <div className="grid md:grid-cols-2 gap-3">
                            <div className="p-4 rounded-lg bg-google-green/10 border border-google-green/20">
                                <p className="font-semibold text-google-green mb-2">Use this when</p>
                                <ul className="space-y-2">{pattern.signalRules?.map((item) => <li key={item} className="text-sm text-gray-300">- {item}</li>)}</ul>
                            </div>
                            <div className="p-4 rounded-lg bg-google-yellow/10 border border-google-yellow/20">
                                <p className="font-semibold text-google-yellow mb-2">Do not force it when</p>
                                <ul className="space-y-2">{pattern.antiSignals?.map((item) => <li key={item} className="text-sm text-gray-300">- {item}</li>)}</ul>
                            </div>
                        </div>
                    </section>

                    <section><h2 className="text-xl font-bold mb-2">Brute Force To Optimized</h2><p className="text-gray-300">{pattern.bruteForceToOptimized}</p></section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">Visual Walkthrough</h2>
                        <div className="grid md:grid-cols-4 gap-3">
                            {pattern.visualSteps?.map((step, index) => (
                                <div key={step} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-xs text-google-blue mb-1">Step {index + 1}</p>
                                    <p className="text-sm text-gray-300">{step}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section><h2 className="text-xl font-bold mb-2">Template Notes</h2><p className="text-gray-300">{pattern.templateNotes}</p></section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">Common Mistakes And Traps</h2>
                        <ul className="space-y-2">
                            {[...(pattern.commonMistakes || []), ...(pattern.trapExamples || [])].map((mistake) => (
                                <li key={mistake} className="text-gray-300 flex gap-2"><span className="text-google-red">!</span>{mistake}</li>
                            ))}
                        </ul>
                    </section>
                </GlassPanel>

                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Target size={20} />Practice Ladder</h2>
                    <div className="space-y-5">
                        {problemGroups.map((group) => {
                            const selected = group.slugs.map((slug) => questionMap.get(slug)).filter(Boolean)
                            const items = selected.length ? selected : group.fallback
                            return (
                                <div key={group.title}>
                                    <p className="text-sm font-semibold text-google-blue mb-2">{group.title}</p>
                                    <div className="space-y-2">
                                        {items.map((question) => (
                                            <Link key={question.slug} to={`/practice/${question.topic}?mode=${group.mode}`} className="block">
                                                <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                                    <p className="font-semibold">{question.title}</p>
                                                    <p className="text-xs text-gray-400">{question.difficulty} - {question.topic}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {questions[0] && (
                        <Link to={`/practice/${questions[0].topic}?mode=guided`} className="block mt-4">
                            <Button className="w-full">Start Guided Practice</Button>
                        </Link>
                    )}
                </GlassPanel>
            </div>
        </div>
    )
}
