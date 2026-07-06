import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Home from './pages/Home'
import ComplexityModule from './pages/Tutorial/ComplexityModule'
import FlowModule from './pages/Tutorial/FlowModule'
import AlgorithmViewer from './pages/Algorithms/AlgorithmViewer'
import PracticeArena from './pages/Practice/PracticeArena'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard'
import Roadmap from './pages/Roadmap'
import PatternLesson from './pages/PatternLesson'

export default function App() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Sidebar />

            {/* Main Content */}
            <main className="pt-16 md:pl-64">
                <div className="p-6">
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
                </div>
            </main>
        </div>
    )
}
