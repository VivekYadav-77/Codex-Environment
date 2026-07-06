import { createSlice } from '@reduxjs/toolkit'
import { getStoredAuth, setStoredAuth } from '../../api/client'

const stored = typeof window !== 'undefined' ? getStoredAuth() : null

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: stored?.user || null,
        token: stored?.token || null,
    },
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
            setStoredAuth(action.payload)
        },
        logout: (state) => {
            state.user = null
            state.token = null
            setStoredAuth(null)
        },
    },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
