import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    BookOpen,
    Play,
    PenTool,
    ArrowRight,
    Sparkles,
    BarChart3,
    Zap,
    Brain
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const features = [
    {
        icon: BookOpen,
        title: 'Bridge Course',
        description: 'Master Big O notation and recursion fundamentals with interactive visualizations.',
        path: '/tutorial',
        accent: 'blue',
    },
    {
        icon: Play,
        title: 'Algorithm Visualizer',
        description: 'Watch sorting, searching, trees, and graphs come to life step-by-step.',
        path: '/algorithms',
        accent: 'green',
    },
    {
        icon: PenTool,
        title: 'AI Practice Arena',
        description: 'Code with Socratic AI hints that guide without giving answers.',
        path: '/practice',
        accent: 'red',
    },
]

const stats = [
    { label: 'Algorithms', value: '50+', icon: Zap },
    { label: 'Practice Problems', value: '100+', icon: Brain },
    { label: 'Visualizations', value: '200+', icon: BarChart3 },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
}

export default function Home() {
    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <motion.section
                className="text-center py-16 md:py-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Sparkles size={16} className="text-google-yellow" />
                    <span className="text-sm text-gray-300">Learn DSA the Visual Way</span>
                </motion.div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-google-blue via-google-red to-google-yellow bg-clip-text text-transparent">
                        Codex Environment
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
                    Master Data Structures & Algorithms through real-time visualization
                    and AI-powered Socratic learning.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/tutorial">
                        <Button variant="blue" size="lg" icon={ArrowRight} iconPosition="right">
                            Start Learning
                        </Button>
                    </Link>
                    <Link to="/algorithms">
                        <Button variant="glass" size="lg" icon={Play}>
                            Explore Visualizer
                        </Button>
                    </Link>
                </div>
            </motion.section>

            {/* Stats Section */}
            <motion.section
                className="grid grid-cols-3 gap-4 md:gap-6 mb-16"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {stats.map(({ label, value, icon: Icon }) => (
                    <motion.div
                        key={label}
                        className="glass-card p-6 flex flex-col items-center justify-center text-center overflow-hidden"
                        variants={itemVariants}
                    >
                        <Icon size={28} className="text-google-blue mb-3 flex-shrink-0" />

                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 break-words max-w-full">
                            {value}
                        </p>

                        <p className="text-xs sm:text-sm text-gray-400 break-words max-w-full">
                            {label}
                        </p>
                    </motion.div>
                ))}
            </motion.section>

            {/* Features Section */}
            <motion.section
                className="mb-16"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                    Your Learning Journey
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {features.map(({ icon: Icon, title, description, path, accent }) => (
                        <motion.div key={title} variants={itemVariants}>
                            <Link to={path}>
                                <Card
                                    icon={Icon}
                                    title={title}
                                    accent={accent}
                                    className="h-full"
                                    onClick={() => { }}
                                >
                                    <p className="text-gray-400">{description}</p>
                                    <div className="flex items-center gap-2 mt-4 text-white font-medium">
                                        Explore <ArrowRight size={16} />
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* How It Works */}
            <motion.section
                className="glass-card p-8 md:p-12 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
            >
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                    Powered by <span className="text-google-blue">AI</span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                    Our Socratic AI tutor helps you learn by asking the right questions—never
                    giving away the answer. Get intelligent hints and comprehensive code reviews
                    that make you a better programmer.
                </p>
                <Link to="/practice">
                    <Button variant="green" size="lg" icon={Brain}>
                        Try AI Practice
                    </Button>
                </Link>
            </motion.section>
        </div>
    )
}
