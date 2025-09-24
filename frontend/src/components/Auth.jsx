import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('startup')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    try {
      const r = localStorage.getItem('selectedRole')
      if (r === 'startup' || r === 'past') setRole(r)
    } catch {}
  }, [])

  const upsertProfile = async (userId, selectedRole) => {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          role: selectedRole,
          quote: 'Dream big, start small.',
        },
        { onConflict: 'user_id' }
      )
    if (error) {
      console.warn('Profile upsert error (ensure profiles table exists):', error)
    }
  }

  const signUp = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(`Sign up error: ${error.message}`)
      setLoading(false)
      return
    }
    // If email confirmation is off, data.user is available now.
    const user = data?.user
    if (user?.id) {
      await upsertProfile(user.id, role)
    }
    setMessage('Sign up success! Redirecting…')
    setLoading(false)
    navigate('/dashboard')
  }

  const signIn = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(`Sign in error: ${error.message}`)
      setLoading(false)
      return
    }
    const user = data?.user
    if (user?.id) {
      // fetch role
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()
      if (pErr) {
        console.warn('Fetch profile error:', pErr)
      } else if (!profile) {
        // If missing profile, create with selected role fallback
        await upsertProfile(user.id, role)
      }
    }
    // If profile has role -> dashboard
    try {
      const { data: check } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .maybeSingle()
      if (check?.role) {
        navigate('/dashboard')
      } else {
        // try localStorage role, upsert, then go dashboard
        let chosen = role
        try {
          const r = localStorage.getItem('selectedRole')
          if (r === 'startup' || r === 'past') chosen = r
        } catch {}
        const current = (await supabase.auth.getUser()).data.user
        if (current?.id && chosen) {
          await upsertProfile(current.id, chosen)
          navigate('/dashboard')
        } else {
          navigate('/roleselect')
        }
      }
    } catch {
      navigate('/roleselect')
    }
    setLoading(false)
  }

  return (
    <div className="nbt-bg">
      <div className="nbt-card-wrap">
        <div className="nbt-card-glow" />
        <div className="nbt-card">
          <div className="mb-8 text-center">
            <h1 className="nbt-title">NeuroBizTwin</h1>
            <p className="nbt-subtitle">Welcome back. Sign in or create your account.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="nbt-input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="nbt-input"
                placeholder="••••••••"
              />
            </div>
            {/* Role selection moved to /roleselect page; we keep role from localStorage but hide UI here. */}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={signUp}
                disabled={loading}
                className="flex-1 nbt-btn-primary"
              >
                {loading ? 'Please wait…' : 'Sign Up'}
              </button>
              <button
                onClick={signIn}
                disabled={loading}
                className="flex-1 nbt-btn-secondary"
              >
                Sign In
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">Already have an account? <span className="text-gray-300">Sign In</span></p>

            {message && (
              <p className="text-sm text-gray-300 text-center bg-gray-800/60 border border-gray-700 rounded-md px-3 py-2">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

