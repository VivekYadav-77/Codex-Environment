import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw, Server, Database, Smartphone, Globe } from 'lucide-react';

export default function SystemDesignAnimator({ steps }) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!steps || steps.length === 0) return null;

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
    const reset = () => setCurrentStep(0);

    // Helper to get an icon based on title keywords
    const getIcon = (title) => {
        const lower = title.toLowerCase();
        if (lower.includes('user') || lower.includes('client')) return <Smartphone className="text-blue-400" size={32} />;
        if (lower.includes('server') || lower.includes('api')) return <Server className="text-green-400" size={32} />;
        if (lower.includes('database') || lower.includes('cache')) return <Database className="text-yellow-400" size={32} />;
        return <Globe className="text-purple-400" size={32} />;
    };

    return (
        <div className="my-8 rounded-xl border border-white/10 bg-black/40 overflow-hidden not-prose">
            {/* Visualizer Canvas */}
            <div className="h-64 relative flex items-center justify-center p-8 border-b border-white/10 bg-gradient-to-br from-gray-900 to-black">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center text-center max-w-sm"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                            {getIcon(steps[currentStep].title)}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{steps[currentStep].title}</h3>
                        <p className="text-gray-400 text-sm">{steps[currentStep].description}</p>
                    </motion.div>
                </AnimatePresence>
                
                {/* Progress Indicators (Dots) */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {steps.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-google-blue' : 'w-2 bg-gray-600'}`} 
                        />
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-white/5 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-400">
                    Step {currentStep + 1} of {steps.length}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={reset}
                        disabled={currentStep === 0}
                        className="p-2 rounded-md hover:bg-white/10 disabled:opacity-30 transition-colors"
                        title="Reset"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button 
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="p-2 rounded-md hover:bg-white/10 disabled:opacity-30 transition-colors flex items-center"
                    >
                        <ChevronLeft size={20} /> Prev
                    </button>
                    <button 
                        onClick={nextStep}
                        disabled={currentStep === steps.length - 1}
                        className="px-4 py-2 rounded-md bg-google-blue hover:bg-google-blue/80 text-white font-medium disabled:opacity-50 transition-colors flex items-center"
                    >
                        Next <ChevronRight size={20} className="ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
