import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BookOpen,
    Play,
    PenTool,
    ChevronRight,
    ChevronDown,
    BarChart3,
    GitBranch,
    ListTree,
    Network,
    Binary,
    Search,
    Layers,
    X,
    Database,
    Hash,
    LayoutList,
    ArrowLeftRight,
    Table2,
    Type,
    Lightbulb,
    Target,
    RotateCcw,
    Cpu,
    Zap
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setSidebarOpen } from '../../store/slices/uiSlice'

const menuSections = [
    {
        title: 'Tutorial',
        icon: BookOpen,
        path: '/tutorial',
        items: [
            { label: 'Big O Complexity', path: '/tutorial/complexity', icon: BarChart3 },
            { label: 'Recursion Flow', path: '/tutorial/flow', icon: GitBranch },
        ]
    },
    {
        title: 'Visualizer',
        icon: Play,
        path: '/algorithms',
        items: [
            { label: 'Arrays', path: '/algorithms/arrays', icon: Table2 },
            { label: 'Strings', path: '/algorithms/strings', icon: Type },
            { label: 'Sorting', path: '/algorithms/sorting', icon: Layers },
            { label: 'Searching', path: '/algorithms/searching', icon: Search },
            { label: 'Stacks', path: '/algorithms/stacks', icon: LayoutList },
            { label: 'Queues', path: '/algorithms/queues', icon: ArrowLeftRight },
            { label: 'Linked Lists', path: '/algorithms/linked-lists', icon: Binary },
            { label: 'Trees', path: '/algorithms/trees', icon: ListTree },
            { label: 'Graphs', path: '/algorithms/graphs', icon: Network },
            { label: 'Hashing', path: '/algorithms/hashing', icon: Hash },
            { label: 'Dynamic Programming', path: '/algorithms/dp', icon: Lightbulb },
            { label: 'Greedy', path: '/algorithms/greedy', icon: Target },
            { label: 'Backtracking', path: '/algorithms/backtracking', icon: RotateCcw },
            { label: 'Bit Manipulation', path: '/algorithms/bit-manipulation', icon: Cpu },
            { label: 'Advanced', path: '/algorithms/advanced', icon: Zap },
        ]
    },
    {
        title: 'Practice',
        icon: PenTool,
        path: '/practice',
        items: [
            { label: 'Sorting', path: '/practice/sorting', icon: Layers },
            { label: 'Searching', path: '/practice/searching', icon: Search },
            { label: 'Stacks', path: '/practice/stacks', icon: LayoutList },
            { label: 'Queues', path: '/practice/queues', icon: ArrowLeftRight },
            { label: 'Linked Lists', path: '/practice/linked-lists', icon: Binary },
            { label: 'Trees', path: '/practice/trees', icon: ListTree },
            { label: 'Graphs', path: '/practice/graphs', icon: Network },
            { label: 'Hashing', path: '/practice/hashing', icon: Hash },
        ]
    },
]

export default function Sidebar() {
    const location = useLocation()
    const dispatch = useDispatch()
    const { sidebarOpen } = useSelector(state => state.ui)
    const [openSections, setOpenSections] = useState({})

    // Auto-open section based on current path
    useEffect(() => {
        const activeSection = menuSections.find(section =>
            location.pathname.startsWith(section.path)
        )
        if (activeSection) {
            setOpenSections(prev => ({
                ...prev,
                [activeSection.title]: true
            }))
        }
    }, [location.pathname])

    const closeSidebar = () => dispatch(setSidebarOpen(false))

    const toggleSection = (title) => {
        setOpenSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }))
    }

    return (
        <>
            {/* Mobile Overlay */}
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

            {/* Sidebar */}
            <motion.aside
                className={`
          fixed left-0 top-16 bottom-0 w-64 z-40
          glass border-r border-white/5
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
            >
                <div className="h-full overflow-y-auto py-6 px-4">
                    {/* Mobile Close Button */}
                    <button
                        className="md:hidden absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                        onClick={closeSidebar}
                    >
                        <X size={20} />
                    </button>

                    <div className="space-y-4">
                        {menuSections.map((section) => {
                            const isSectionActive = location.pathname.startsWith(section.path)
                            const isOpen = openSections[section.title]

                            return (
                                <div key={section.title} className="rounded-xl overflow-hidden">
                                    {/* Section Header */}
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold 
                                            transition-all duration-200 uppercase tracking-wider
                                            ${isSectionActive
                                                ? 'text-white bg-white/10'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <section.icon size={18} className={isSectionActive ? 'text-google-blue' : ''} />
                                        <span>{section.title}</span>
                                        <ChevronDown
                                            size={16}
                                            className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Section Items (Collapsible) */}
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                            >
                                                <div className="pt-1 pb-2 space-y-1">
                                                    {section.items.map((item) => {
                                                        const isItemActive = location.pathname === item.path
                                                        return (
                                                            <Link
                                                                key={item.path}
                                                                to={item.path}
                                                                onClick={closeSidebar}
                                                                className="block"
                                                            >
                                                                <motion.div
                                                                    className={`
                                                                        flex items-center gap-3 px-3 py-2.5 rounded-lg mx-2
                                                                        transition-colors relative text-sm
                                                                        ${isItemActive
                                                                            ? 'text-white bg-white/10 border border-white/5'
                                                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                                        }
                                                                    `}
                                                                    whileHover={{ x: 4 }}
                                                                >
                                                                    <item.icon size={16} />
                                                                    <span className="font-medium">{item.label}</span>
                                                                    {isItemActive && (
                                                                        <motion.div
                                                                            layoutId="activeIndicator"
                                                                            className="absolute left-0 w-1 h-6 bg-google-blue rounded-r-full"
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                        />
                                                                    )}
                                                                </motion.div>
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
