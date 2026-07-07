import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HintLadder } from './HintLadder'
import { OfficialSolutionPanel } from './OfficialSolutionPanel'
import { PracticeModeSelector } from './PracticeModeSelector'
import { ReflectionPanel } from './ReflectionPanel'
import { WorkflowStepper } from './WorkflowStepper'

describe('practice support panels', () => {
    it('renders practice mode selector', () => {
        render(<PracticeModeSelector practiceMode="mixed" onChange={vi.fn()} />)
        expect(screen.getByText('Practice mode')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Mixed Pattern')).toBeInTheDocument()
    })

    it('renders workflow steps', () => {
        render(<WorkflowStepper activeTab="approach" approach={{ bruteForce: 'try all pairs' }} submissionResult={null} />)
        expect(screen.getByText('Understand')).toBeInTheDocument()
        expect(screen.getByText('Plan')).toBeInTheDocument()
        expect(screen.getByText('Reflect')).toBeInTheDocument()
    })

    it('renders hint ladder with levels', () => {
        render(<HintLadder hints={[{ id: 1, hintLevel: 2, content: 'Look for the pattern signal.' }]} hintLevel={3} hintLoading={false} onHint={vi.fn()} />)
        expect(screen.getByText('Level 2')).toBeInTheDocument()
        expect(screen.getByText('Look for the pattern signal.')).toBeInTheDocument()
    })

    it('shows official solution empty state', () => {
        render(<OfficialSolutionPanel officialSolution={{ empty: true }} />)
        expect(screen.getByText(/has not been added yet/i)).toBeInTheDocument()
    })

    it('hides reflection panel before acceptance', () => {
        const { container } = render(<ReflectionPanel submissionResult={{ status: 'wrong_answer' }} reflection={{}} setReflection={vi.fn()} reflectionSaved={false} onSave={vi.fn()} />)
        expect(container).toBeEmptyDOMElement()
    })
})
