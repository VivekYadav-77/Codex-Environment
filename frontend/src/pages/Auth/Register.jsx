import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { UserPlus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { GlassPanel } from '../../components/ui/Glass'
import { apiFetch } from '../../api/client'
import { setCredentials } from '../../store/slices/authSlice'

export default function Register() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const submit = async (event) => {
        event.preventDefault()
        setError('')
        setLoading(true)
        try {
            const result = await apiFetch('/api/auth/register', { method: 'POST', body: form })
            dispatch(setCredentials(result))
            navigate('/practice/hashing')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto pt-12">
            <GlassPanel>
                <h1 className="text-3xl font-bold mb-2">Create account</h1>
                <p className="text-gray-400 mb-6">Start tracking your DSA progress.</p>
                <form onSubmit={submit} className="space-y-4">
                    <input className="glass-input w-full" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <input className="glass-input w-full" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    <input className="glass-input w-full" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                    {error && <p className="text-google-red text-sm">{error}</p>}
                    <Button type="submit" className="w-full" icon={UserPlus} loading={loading}>Register</Button>
                </form>
                <p className="text-sm text-gray-400 mt-5">
                    Already have an account? <Link to="/login" className="text-google-blue">Login</Link>
                </p>
            </GlassPanel>
        </div>
    )
}
