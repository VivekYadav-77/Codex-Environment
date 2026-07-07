import { Button } from '../../../components/ui/Button'

export function ReflectionPanel({ submissionResult, reflection, setReflection, reflectionSaved, onSave }) {
    if (submissionResult?.status !== 'accepted') return null

    return (
        <div className="pt-5 border-t border-white/10 space-y-3">
            <h3 className="text-lg font-semibold">Post-Solve Reflection</h3>
            {[
                ['patternUsed', 'Pattern used'],
                ['whyItWorked', 'Why it worked'],
                ['keyInvariant', 'Key invariant'],
                ['dangerousEdgeCase', 'Dangerous edge case'],
                ['interviewExplanation', 'Interview explanation'],
            ].map(([field, label]) => (
                <textarea key={field} className="glass-input w-full min-h-[72px]" value={reflection[field]} onChange={(event) => setReflection((current) => ({ ...current, [field]: event.target.value }))} placeholder={label} />
            ))}
            <label className="block">
                <span className="block text-sm text-gray-400 mb-1">Confidence after solve: {reflection.confidenceAfterSolve}/5</span>
                <input className="w-full" type="range" min="1" max="5" value={reflection.confidenceAfterSolve} onChange={(event) => setReflection((current) => ({ ...current, confidenceAfterSolve: Number(event.target.value) }))} />
            </label>
            <Button variant="green" size="sm" onClick={onSave} disabled={reflectionSaved}>{reflectionSaved ? 'Reflection Saved' : 'Save Reflection'}</Button>
        </div>
    )
}
