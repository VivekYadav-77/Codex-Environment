import { Lightbulb } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

export function HintLadder({ hints, hintLevel, hintLoading, onHint }) {
    return (
        <div className="pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Lightbulb size={20} className="text-google-yellow" />AI Hints</h3>
                <Button variant="glass" size="sm" onClick={onHint} loading={hintLoading} icon={Lightbulb}>Hint Level {hintLevel}</Button>
            </div>
            {hints.length === 0 ? <p className="text-gray-400 text-sm">Ask for a nudge when you are stuck.</p> : (
                <div className="space-y-3">
                    {hints.map((hint) => (
                        <div key={hint.id} className="p-3 rounded-lg bg-google-yellow/10 border border-google-yellow/20 text-sm text-gray-300">
                            <p className="text-xs text-google-yellow mb-1">Level {hint.hintLevel || 1}</p>
                            {hint.content}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
