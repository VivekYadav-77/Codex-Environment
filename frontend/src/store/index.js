import { configureStore } from '@reduxjs/toolkit'
import executionReducer from './slices/executionSlice'
import uiReducer from './slices/uiSlice'
import practiceReducer from './slices/practiceSlice'

export const store = configureStore({
    reducer: {
        execution: executionReducer,
        ui: uiReducer,
        practice: practiceReducer,
    },
})

export default store
