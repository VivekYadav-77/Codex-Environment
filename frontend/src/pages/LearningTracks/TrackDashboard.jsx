import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Route, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { GlassPanel } from '../../components/ui/Glass';
import { apiFetch } from '../../api/client';

export default function TrackDashboard() {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/api/learning/tracks')
            .then(data => setTracks(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                        <BookOpen className="text-google-blue" /> Structured Tracks
                    </h1>
                    <p className="text-gray-400">Deep, interactive, theoretical tutorials for DSA and System Design.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {tracks.map(track => (
                    <GlassPanel key={track.title} className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Route size={24} className="text-google-blue" />
                            <h2 className="text-2xl font-bold">{track.title}</h2>
                        </div>
                        <div className="flex-1 space-y-3">
                            {track.lessons.map((lesson, idx) => (
                                <Link 
                                    key={lesson.slug} 
                                    to={`/tracks/${lesson.slug}`}
                                    className="block p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-lg">{idx + 1}. {lesson.title}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            lesson.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                                            lesson.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                            {lesson.level}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{lesson.description}</p>
                                </Link>
                            ))}
                        </div>
                    </GlassPanel>
                ))}
            </div>
        </div>
    );
}
