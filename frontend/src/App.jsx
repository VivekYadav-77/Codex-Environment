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
const Revision = lazy(() => import('./pages/Revision'))
const SkillProfile = lazy(() => import('./pages/SkillProfile'))
const Interview = lazy(() => import('./pages/Interview'))
const AdminContent = lazy(() => import('./pages/AdminContent'))
const DailySession = lazy(() => import('./pages/DailySession'))
const Misconceptions = lazy(() => import('./pages/Misconceptions'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Learn = lazy(() => import('./pages/Learn'))
const SystemDesign = lazy(() => import('./pages/SystemDesign'))

// Learning Tracks
const TrackDashboard = lazy(() => import('./pages/LearningTracks/TrackDashboard'))
const InteractiveLesson = lazy(() => import('./pages/LearningTracks/InteractiveLesson'))

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
                            <Route path="/onboarding" element={<Onboarding />} />
                            <Route path="/session/today" element={<DailySession />} />
                            <Route path="/learn" element={<Learn />} />
                            <Route path="/system-design" element={<SystemDesign />} />
                            <Route path="/system-design/:slug" element={<SystemDesign />} />
                            <Route path="/roadmap" element={<Roadmap />} />
                            <Route path="/roadmap/:patternSlug" element={<PatternLesson />} />
                            <Route path="/revision" element={<Revision />} />
                            <Route path="/profile/skills" element={<SkillProfile />} />
                            <Route path="/interview" element={<Interview />} />
                            <Route path="/admin/content" element={<AdminContent />} />
                            <Route path="/misconceptions" element={<Misconceptions />} />
                            <Route path="/misconceptions/:slug" element={<Misconceptions />} />
                            <Route path="/mistake-doctor" element={<Misconceptions />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Deep Structured Learning Tracks */}
                            <Route path="/tracks" element={<TrackDashboard />} />
                            <Route path="/tracks/:topic/:subtopic/:slug" element={<InteractiveLesson />} />

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
