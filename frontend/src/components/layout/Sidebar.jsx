import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertTriangle,
    BarChart3,
    BookOpen,
    Brain,
    Briefcase,
    ChevronDown,
    Compass,
    Home,
    Map,
    Network,
    PenTool,
    Play,
    RotateCcw,
    Sparkles,
    Target,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setSidebarOpen } from '../../store/slices/uiSlice'

const menuSections = [
    { title: 'Home', icon: Home, path: '/' },
    { title: 'Today', icon: Compass, path: '/session/today' },
    {
        title: 'Learn',
        icon: BookOpen,
        path: '/learn',
        items: [
            { label: 'Learning Hub', path: '/learn', icon: Sparkles },
            { label: 'DSA Roadmap', path: '/roadmap', icon: Map },
            { label: 'System Design', path: '/system-design', icon: Network },
            { label: 'Visualizer', path: '/algorithms', icon: Play },
            { label: 'Complexity', path: '/tutorial/complexity', icon: BarChart3 },
        ],
    },
    {
        title: 'Practice',
        icon: PenTool,
        path: '/practice',
        items: [
            { label: 'Guided Practice', path: '/practice/hashing?mode=guided', icon: Target },
            { label: 'Mixed Practice', path: '/practice/mixed?mode=mixed', icon: Brain },
            { label: 'Revision', path: '/revision', icon: RotateCcw },
            { label: 'Mistake Doctor', path: '/mistake-doctor', icon: AlertTriangle },
            { label: 'Skill Profile', path: '/profile/skills', icon: Brain },
        ],
    },
    {
        title: 'Interview',
        icon: Briefcase,
        path: '/interview',
        items: [
            { label: 'Interview Mode', path: '/interview', icon: Briefcase },
            { label: 'Coding Practice', path: '/practice/mixed?mode=interview', icon: PenTool },
            { label: 'Design Drill', path: '/system-design', icon: Network },
        ],
    },
]

export default function Sidebar() {
    const location = useLocation()
    const dispatch = useDispatch()
    const { sidebarOpen } = useSelector((state) => state.ui)
    const [openSections, setOpenSections] = useState({})

    useEffect(() => {
        const handleResize = () => dispatch(setSidebarOpen(window.innerWidth >= 768))
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [dispatch])

    useEffect(() => {
        const activeSection = menuSections.find((section) => section.items && location.pathname.startsWith(section.path))
        if (activeSection) setOpenSections((current) => ({ ...current, [activeSection.title]: true }))
    }, [location.pathname])

    const closeSidebar = () => {
        if (window.innerWidth < 768) dispatch(setSidebarOpen(false))
    }

    return (
        <>
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 z-40 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSidebar}
                    />
                )}
            </AnimatePresence>

            <motion.aside className={`fixed left-0 top-16 bottom-0 w-64 z-40 glass border-r border-white/5 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="h-full overflow-y-auto py-6 px-4">
                    <div className="mb-5 p-3 rounded-lg bg-google-blue/10 border border-google-blue/20">
                        <p className="text-sm font-semibold text-google-blue">Coach Guided</p>
                        <p className="text-xs text-gray-400 mt-1">Today tells you what to learn, solve, revise, and explain next.</p>
                    </div>
                    <div className="space-y-2">
                        {menuSections.map((section) => {
                            const isSectionActive = section.path === '/'
                                ? location.pathname === '/'
                                : location.pathname.startsWith(section.path) || section.items?.some((item) => location.pathname === item.path.split('?')[0])
                            const isOpen = openSections[section.title]

                            if (!section.items) {
                                return (
                                    <Link key={section.title} to={section.path} onClick={closeSidebar} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider ${isSectionActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                        <section.icon size={18} className={isSectionActive ? 'text-google-blue' : ''} />
                                        {section.title}
                                    </Link>
                                )
                            }

                            return (
                                <div key={section.title}>
                                    <button
                                        onClick={() => setOpenSections((current) => ({ ...current, [section.title]: !current[section.title] }))}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider ${isSectionActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <section.icon size={18} className={isSectionActive ? 'text-google-blue' : ''} />
                                        <span>{section.title}</span>
                                        <ChevronDown size={16} className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                                <div className="py-2 space-y-1">
                                                    {section.items.map((item) => {
                                                        const pathOnly = item.path.split('?')[0]
                                                        const isItemActive = location.pathname === pathOnly
                                                        return (
                                                            <Link key={item.path} to={item.path} onClick={closeSidebar} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mx-2 text-sm ${isItemActive ? 'text-white bg-white/10 border border-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                                                <item.icon size={16} />
                                                                <span className="font-medium">{item.label}</span>
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </motion.aside>
        </>
    )
}
