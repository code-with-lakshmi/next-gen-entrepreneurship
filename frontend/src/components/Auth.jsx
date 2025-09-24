import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const signUp = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(`Sign up error: ${error.message}`)
    else setMessage('Sign up success! Check your email for confirmation if enabled.')
    setLoading(false)
  }

  const signIn = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(`Sign in error: ${error.message}`)
    else setMessage('Signed in successfully!')
    setLoading(false)
  }

  return (
    <div className="mt-8 mx-auto max-w-md w-full bg-white shadow rounded p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Authentication</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={signUp}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Sign Up
          </button>
          <button
            onClick={signIn}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Sign In
          </button>
        </div>
        {message && (
          <p className="text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  )
}
