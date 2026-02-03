import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    // Algorithm data
    algorithm: null,
    algorithmId: null,

    // Execution steps
    steps: [],
    currentStep: 0,

    // Playback state
    isPlaying: false,
    playbackSpeed: 1, // 0.5, 1, 2, 4

    // Snapshots for time-travel
    snapshots: [],

    // Input data for visualization
    inputData: [],

    // Current visualization state
    visualState: {
        array: [],
        comparing: [],
        swapping: [],
        sorted: [],
        pointers: {},
        tree: null,
        graph: null,
        linkedList: null,
        callStack: [],
        variables: {},
    },

    // Code highlighting
    currentLine: 0,
    selectedLanguage: 'javascript',
}

const executionSlice = createSlice({
    name: 'execution',
    initialState,
    reducers: {
        // Set algorithm data
        setAlgorithm: (state, action) => {
            state.algorithm = action.payload
            state.algorithmId = action.payload?.id
        },

        // Set execution steps
        setSteps: (state, action) => {
            state.steps = action.payload
            state.currentStep = 0
            state.snapshots = []
        },

        // Navigate steps
        setCurrentStep: (state, action) => {
            state.currentStep = Math.max(0, Math.min(action.payload, state.steps.length - 1))
        },

        nextStep: (state) => {
            if (state.currentStep < state.steps.length - 1) {
                state.currentStep += 1
            } else {
                state.isPlaying = false
            }
        },

        prevStep: (state) => {
            if (state.currentStep > 0) {
                state.currentStep -= 1
            }
        },

        // Playback controls
        play: (state) => {
            state.isPlaying = true
        },

        pause: (state) => {
            state.isPlaying = false
        },

        togglePlay: (state) => {
            state.isPlaying = !state.isPlaying
        },

        setPlaybackSpeed: (state, action) => {
            state.playbackSpeed = action.payload
        },

        // Visual state updates
        setVisualState: (state, action) => {
            state.visualState = { ...state.visualState, ...action.payload }
        },

        setInputData: (state, action) => {
            state.inputData = action.payload
        },

        // Code view
        setCurrentLine: (state, action) => {
            state.currentLine = action.payload
        },

        setSelectedLanguage: (state, action) => {
            state.selectedLanguage = action.payload
        },

        // Snapshot for time-travel
        addSnapshot: (state, action) => {
            state.snapshots.push({
                step: state.currentStep,
                visualState: { ...state.visualState },
                timestamp: Date.now(),
            })
        },

        // Reset
        resetExecution: (state) => {
            state.steps = []
            state.currentStep = 0
            state.isPlaying = false
            state.snapshots = []
            state.visualState = initialState.visualState
            state.currentLine = 0
        },
    },
})

export const {
    setAlgorithm,
    setSteps,
    setCurrentStep,
    nextStep,
    prevStep,
    play,
    pause,
    togglePlay,
    setPlaybackSpeed,
    setVisualState,
    setInputData,
    setCurrentLine,
    setSelectedLanguage,
    addSnapshot,
    resetExecution,
} = executionSlice.actions

export default executionSlice.reducer
