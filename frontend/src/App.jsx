import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'

const Home = lazy(() => import('./pages/Home'))
const ComplexityModule = lazy(() => import('./pages/Tutorial/ComplexityModule'))
const FlowModule = lazy(() => import('./pages/Tutorial/FlowModule'))
const AlgorithmViewer = lazy(() => import('./pages/Algorithms/AlgorithmViewer'))
const PracticeArena = lazy(() => import('./pages/Practice/PracticeArena'))
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const PatternLesson = lazy(() => import('./pages/PatternLesson'))

const PageLoader = () => (
    <div className="min-h-[50vh] flex items-center justify-center">
        <div className="glass-card px-5 py-4 text-sm text-gray-300">Loading page...</div>
    </div>
)

export default function App() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Sidebar />

            {/* Main Content */}
            <main className="pt-16 md:pl-64">
                <div className="p-6">
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* Home */}
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/roadmap" element={<Roadmap />} />
                            <Route path="/roadmap/:patternSlug" element={<PatternLesson />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Tutorial Routes */}
                            <Route path="/tutorial" element={<ComplexityModule />} />
                            <Route path="/tutorial/complexity" element={<ComplexityModule />} />
                            <Route path="/tutorial/flow" element={<FlowModule />} />

                            {/* Algorithm Visualizer Routes */}
                            <Route path="/algorithms" element={<AlgorithmViewer />} />
                            <Route path="/algorithms/:category" element={<AlgorithmViewer />} />
                            <Route path="/algorithms/:category/:algorithmId" element={<AlgorithmViewer />} />

                            {/* Practice Routes */}
                            <Route path="/practice" element={<PracticeArena />} />
                            <Route path="/practice/:topic" element={<PracticeArena />} />
                        </Routes>
                    </Suspense>
                </div>
            </main>
        </div>
    )
}
