import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    // Theme
    theme: 'dark',

    // Navigation
    activeRoute: '/',
    sidebarOpen: true,

    // Modal states
    activeModal: null,

    // Loading states
    isLoading: false,
    loadingMessage: '',

    // Notifications
    notification: null,

    // Tutorial progress
    completedModules: [],
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload
        },

        setActiveRoute: (state, action) => {
            state.activeRoute = action.payload
        },

        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen
        },

        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload
        },

        openModal: (state, action) => {
            state.activeModal = action.payload
        },

        closeModal: (state) => {
            state.activeModal = null
        },

        setLoading: (state, action) => {
            state.isLoading = action.payload.loading
            state.loadingMessage = action.payload.message || ''
        },

        showNotification: (state, action) => {
            state.notification = {
                type: action.payload.type, 
                message: action.payload.message,
                duration: action.payload.duration || 3000,
            }
        },

        clearNotification: (state) => {
            state.notification = null
        },

        completeModule: (state, action) => {
            if (!state.completedModules.includes(action.payload)) {
                state.completedModules.push(action.payload)
            }
        },
    },
})

export const {
    setTheme,
    setActiveRoute,
    toggleSidebar,
    setSidebarOpen,
    openModal,
    closeModal,
    setLoading,
    showNotification,
    clearNotification,
    completeModule,
} = uiSlice.actions

export default uiSlice.reducer
