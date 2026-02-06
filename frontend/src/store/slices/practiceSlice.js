import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    // Current question
    currentQuestion: null,
    questionId: null,
    topic: null,

    // User's code
    code: '',
    language: 'javascript',

    // AI interactions
    aiHints: [],
    isRequestingHint: false,

    // Review results
    reviewResult: null,
    isSubmitting: false,

    // Progress
    completedQuestions: [],

    // Editor state
    editorReady: false,
}

const practiceSlice = createSlice({
    name: 'practice',
    initialState,
    reducers: {
        // Question management
        setCurrentQuestion: (state, action) => {
            state.currentQuestion = action.payload
            state.questionId = action.payload?.id
            state.topic = action.payload?.topic
            state.code = action.payload?.starterCode?.[state.language] || ''
            state.aiHints = []
            state.reviewResult = null
        },

        // Code editing
        setCode: (state, action) => {
            state.code = action.payload
        },

        setLanguage: (state, action) => {
            state.language = action.payload
            if (state.currentQuestion?.starterCode?.[action.payload]) {
                state.code = state.currentQuestion.starterCode[action.payload]
            }
        },

        // AI Hints
        requestHint: (state) => {
            state.isRequestingHint = true
        },

        addHint: (state, action) => {
            state.aiHints.push({
                id: Date.now(),
                content: action.payload,
                timestamp: new Date().toISOString(),
            })
            state.isRequestingHint = false
        },

        hintError: (state) => {
            state.isRequestingHint = false
        },

        // Review
        submitForReview: (state) => {
            state.isSubmitting = true
        },

        setReviewResult: (state, action) => {
            state.reviewResult = action.payload
            state.isSubmitting = false

            // Mark as completed if passed
            if (action.payload.passed && !state.completedQuestions.includes(state.questionId)) {
                state.completedQuestions.push(state.questionId)
            }
        },

        reviewError: (state) => {
            state.isSubmitting = false
        },

        // Editor state
        setEditorReady: (state, action) => {
            state.editorReady = action.payload
        },

        // Reset
        resetPractice: (state) => {
            state.currentQuestion = null
            state.questionId = null
            state.code = ''
            state.aiHints = []
            state.reviewResult = null
        },
    },
})

export const {
    setCurrentQuestion,
    setCode,
    setLanguage,
    requestHint,
    addHint,
    hintError,
    submitForReview,
    setReviewResult,
    reviewError,
    setEditorReady,
    resetPractice,
} = practiceSlice.actions

export default practiceSlice.reducer
