import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { apiFetch } from '../../api/client';
import SystemDesignAnimator from '../../components/Visualizers/SystemDesignAnimator';

export default function InteractiveLesson() {
    const { slug, topic, subtopic } = useParams();
    // Assuming route is /tracks/:topic/:subtopic/:lesson
    const fullSlug = `${topic}/${subtopic}/${slug}`;
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch(`/api/learning/lessons/${fullSlug}`)
            .then(data => setLesson(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [fullSlug]);

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-google-blue" /></div>;
    if (!lesson) return <div className="text-center py-20 text-xl text-gray-400">Lesson not found.</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link to="/tracks" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back to Tracks
            </Link>
            
            <div className="glass-card p-8 md:p-12 prose prose-invert prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none">
                <div className="mb-8 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-google-blue/20 text-google-blue uppercase tracking-wider font-semibold">
                            {lesson.metadata.track}
                        </span>
                        <span className="text-xs text-gray-400">{lesson.metadata.level}</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-2 m-0">{lesson.metadata.title}</h1>
                    <p className="text-gray-400 text-lg m-0">{lesson.metadata.description}</p>
                </div>

                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        // Custom renderer for Visualizer component embedded in Markdown
                        Visualizer: ({ node, ...props }) => {
                            if (props.type === 'ArchitectureAnimator') {
                                const data = JSON.parse(props.data || '{}');
                                return <SystemDesignAnimator steps={data.steps || []} />;
                            }
                            if (props.type === 'MemoryLayout') {
                                const data = JSON.parse(props.data || '{}');
                                return (
                                    <div className="my-8 p-6 glass-card border border-google-green/30 bg-google-green/5 flex gap-2 overflow-x-auto">
                                        {Array.from({ length: data.blocks }).map((_, i) => (
                                            <div key={i} className="flex flex-col items-center">
                                                <div className="w-16 h-16 border-2 border-google-green flex items-center justify-center font-mono font-bold bg-black/40 rounded-md">
                                                    [ {i} ]
                                                </div>
                                                <span className="text-xs text-gray-500 mt-2 font-mono">0x{1000 + i * data.size}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            return <div className="p-4 border border-yellow-500 text-yellow-500">Unknown visualizer type: {props.type}</div>;
                        },
                        // Override default heading to add anchor links later if needed
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-10 mb-6" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 border-b border-white/10 pb-2" {...props} />,
                        a: ({node, ...props}) => <a className="text-google-blue hover:underline" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-google-blue pl-4 py-1 bg-google-blue/10 rounded-r-lg italic" {...props} />
                    }}
                >
                    {lesson.content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
