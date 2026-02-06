import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from "../../assets/logo.svg"

import {
    Code2,
    BookOpen,
    Play,
    PenTool,
    Menu,
    X,
    Github,
    Sparkles
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebar } from '../../store/slices/uiSlice'

const navLinks = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/tutorial', label: 'Tutorial', icon: BookOpen },
    { path: '/algorithms', label: 'Visualizer', icon: Play },
    { path: '/practice', label: 'Practice', icon: PenTool },
]

export default function Navbar() {
    const location = useLocation()
    const dispatch = useDispatch()
    const { sidebarOpen } = useSelector(state => state.ui)

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5 }}
                        >
                        <img src={logo} alt="" style={{ width: "90px", height: "90px" }} />
                        </motion.div> 
                        
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Codex Environment
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ path, label, icon: Icon }) => {
                            const isActive = location.pathname === path
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className="relative px-4 py-2 rounded-lg transition-colors"
                                >
                                    <motion.div
                                        className={`flex items-center gap-2 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="font-medium">{label}</span>
                                    </motion.div>
                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                                            layoutId="navbar-active"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <motion.a
                            href="https://github.com/VivekYadav-77"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Github size={20} />
                        </motion.a>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
