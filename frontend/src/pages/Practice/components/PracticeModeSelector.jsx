import { GlassPanel } from '../../../components/ui/Glass'

export function PracticeModeSelector({ practiceMode, onChange }) {
    return (
        <GlassPanel className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <p className="font-semibold">Practice mode</p>
                    <p className="text-sm text-gray-400">Guided teaches the loop, mixed hides the pattern, interview adds pressure.</p>
                </div>
                <select value={practiceMode} onChange={(e) => onChange(e.target.value)} className="glass-input px-3 py-2 text-sm">
                    <option value="guided">Guided Mode</option>
                    <option value="practice">Normal Practice</option>
                    <option value="revision">Revision</option>
                    <option value="mixed">Mixed Pattern</option>
                    <option value="interview">Interview Mode</option>
                </select>
            </div>
        </GlassPanel>
    )
}
