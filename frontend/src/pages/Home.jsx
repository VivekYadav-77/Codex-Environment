import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Brain, CheckCircle, Compass, Network, Sparkles, Target } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/Glass'

const pillars = [
    {
        icon: Compass,
        title: 'Daily coach plan',
        text: 'A focused mission picks what to learn, solve, revise, and reflect on today.',
    },
    {
        icon: Target,
        title: 'DSA Pattern Lab',
        text: 'Learn signals, traps, templates, and pattern recognition instead of memorizing random answers.',
    },
    {
        icon: Network,
        title: 'System Design Studio',
        text: 'Practice components, tradeoffs, architecture sketches, estimation, and interview prompts.',
    },
    {
        icon: Brain,
        title: 'Mistake Doctor',
        text: 'Turn wrong submissions into plain-language diagnosis and recovery actions.',
    },
]

export default function Home() {
    return (
        <div className="max-w-7xl mx-auto space-y-16">
            <motion.section
                className="pt-10 md:pt-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                        <Sparkles size={16} className="text-google-yellow" />
                        <span className="text-sm text-gray-300">Adaptive DSA + System Design Coach</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Learn faster by knowing exactly what to think about next.
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mb-8">
                        Codex Environment guides learners from beginner foundations to interview readiness with pattern labs,
                        mistake diagnosis, spaced revision, and practical system design drills.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/onboarding"><Button size="lg" icon={ArrowRight} iconPosition="right">Set Up Coach</Button></Link>
                        <Link to="/session/today"><Button variant="green" size="lg" icon={Compass}>Start Today</Button></Link>
                        <Link to="/learn"><Button variant="glass" size="lg" icon={Target}>Explore Learn</Button></Link>
                    </div>
                </div>
            </motion.section>

            <section className="grid md:grid-cols-4 gap-4">
                {pillars.map(({ icon: Icon, title, text }) => (
                    <GlassPanel key={title} className="h-full">
                        <Icon className="text-google-blue mb-4" />
                        <h2 className="font-bold mb-2">{title}</h2>
                        <p className="text-sm text-gray-400">{text}</p>
                    </GlassPanel>
                ))}
            </section>

            <GlassPanel>
                <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-3">The loop that makes learning stick</h2>
                        <div className="grid md:grid-cols-5 gap-3">
                            {['Revise', 'Learn', 'Practice', 'Diagnose', 'Reflect'].map((step) => (
                                <div key={step} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <CheckCircle size={16} className="text-google-green mb-2" />
                                    <p className="font-semibold">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Link to="/session/today"><Button className="w-full" size="lg" icon={Compass}>Open Today</Button></Link>
                </div>
            </GlassPanel>
        </div>
    )
}
