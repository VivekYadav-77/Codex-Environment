import { GlassPanel } from '../../../components/ui/Glass'

const steps = ['Understand', 'Plan', 'Code', 'Test', 'Reflect']

export function WorkflowStepper({ activeTab, approach, submissionResult }) {
    return (
        <GlassPanel className="mb-6">
            <div className="grid grid-cols-5 gap-2">
                {steps.map((step, index) => {
                    const active = (activeTab === 'problem' && index === 0) || (activeTab === 'approach' && index === 1) || (index === 2 && activeTab === 'problem') || (activeTab === 'tests' && index === 3) || (activeTab === 'review' && index === 4)
                    const complete = index === 0 || (index === 1 && Object.values(approach).some(Boolean)) || (index === 3 && submissionResult)
                    return (
                        <div key={step} className={`rounded-lg p-2 text-center text-xs border ${active ? 'border-google-blue bg-google-blue/10 text-white' : complete ? 'border-google-green/30 bg-google-green/5 text-google-green' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                            {step}
                        </div>
                    )
                })}
            </div>
        </GlassPanel>
    )
}
