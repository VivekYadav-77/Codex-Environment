import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, Target } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'
import { apiFetch } from '../api/client'

export default function PatternLesson() {
    const { patternSlug } = useParams()
    const [data, setData] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch(`/api/patterns/${patternSlug}`)
            .then(setData)
            .catch((err) => setError(err.message))
    }, [patternSlug])

    if (error) return <p className="text-google-red">{error}</p>
    if (!data) return <p className="text-gray-400">Loading pattern...</p>

    const { pattern, questions } = data

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                    <BookOpen className="text-google-blue" />
                    {pattern.name}
                </h1>
                <p className="text-gray-400">{pattern.description}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <GlassPanel className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold mb-2">When To Use</h2>
                        <p className="text-gray-300">{pattern.whenToUse}</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Mental Model</h2>
                        <p className="text-gray-300">{pattern.mentalModel}</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Template Notes</h2>
                        <p className="text-gray-300">{pattern.templateNotes}</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold mb-2">Common Mistakes</h2>
                        <ul className="space-y-2">
                            {pattern.commonMistakes?.map((mistake) => (
                                <li key={mistake} className="text-gray-300 flex gap-2">
                                    <span className="text-google-red">•</span>
                                    {mistake}
                                </li>
                            ))}
                        </ul>
                    </section>
                </GlassPanel>

                <GlassPanel>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Target size={20} />Practice</h2>
                    <div className="space-y-3">
                        {questions.map((question) => (
                            <Link key={question.slug} to={`/practice/${question.topic}`} className="block">
                                <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <p className="font-semibold">{question.title}</p>
                                    <p className="text-xs text-gray-400">{question.difficulty} • {question.topic}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {questions[0] && (
                        <Link to={`/practice/${questions[0].topic}`} className="block mt-4">
                            <Button className="w-full">Start Practice</Button>
                        </Link>
                    )}
                </GlassPanel>
            </div>
        </div>
    )
}
