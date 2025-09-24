import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RoleSelect() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // No async checks; this page is the default landing to pick a role
    setLoading(false)
  }, [])

  const chooseRole = (roleValue) => {
    try {
      localStorage.setItem('selectedRole', roleValue)
    } catch {}
    navigate('/auth')
  }

  if (loading) {
    return (
      <div className="nbt-bg">
        <div className="text-gray-300">Loading…</div>
      </div>
    )
  }

  return (
    <div className="nbt-bg">
      <div className="nbt-card-wrap max-w-2xl">
        <div className="nbt-card-glow" />
        <div className="nbt-card">
          <div className="text-center mb-8">
            <h1 className="nbt-title">NeuroBizTwin</h1>
            <p className="nbt-subtitle">Choose your role to continue</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button onClick={() => chooseRole('startup')} className="nbt-role-card-primary nbt-role-card">
              <div className="text-2xl">🚀</div>
              <div className="mt-3 text-lg font-semibold">Startup Entrepreneur</div>
              <div className="mt-1 text-sm text-gray-300">Share your product ideas and validate feasibility.</div>
              <div className="mt-4 inline-block rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-sm">Select</div>
            </button>

            <button onClick={() => chooseRole('past')} className="nbt-role-card-secondary nbt-role-card">
              <div className="text-2xl">💡</div>
              <div className="mt-3 text-lg font-semibold">Entrepreneur</div>
              <div className="mt-1 text-sm text-gray-300">Share your past products and guide startups.</div>
              <div className="mt-4 inline-block rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-sm">Select</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
