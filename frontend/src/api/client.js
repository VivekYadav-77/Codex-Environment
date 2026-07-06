const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export const getStoredAuth = () => {
    try {
        const raw = localStorage.getItem('codex_auth')
        return raw ? JSON.parse(raw) : null
    } catch (error) {
        return null
    }
}

export const setStoredAuth = (auth) => {
    if (!auth) {
        localStorage.removeItem('codex_auth')
        return
    }
    localStorage.setItem('codex_auth', JSON.stringify(auth))
}

export async function apiFetch(path, options = {}) {
    const auth = getStoredAuth()
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    }

    if (auth?.token) {
        headers.Authorization = `Bearer ${auth.token}`
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        body: options.body && typeof options.body !== 'string'
            ? JSON.stringify(options.body)
            : options.body,
    })

    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await response.json() : await response.text()

    if (!response.ok) {
        const message = data?.error || data || 'Request failed'
        throw new Error(message)
    }

    return data
}
