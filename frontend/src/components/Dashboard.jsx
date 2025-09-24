import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, PlusSquare, Users, Share2, Bot, User as UserIcon, LogOut } from 'lucide-react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [quote, setQuote] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: userData, error: uErr } = await supabase.auth.getUser()
      if (uErr || !userData?.user) {
        navigate('/')
        return
      }
      const user = userData.user
      setEmail(user.email ?? '')

      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('role, quote')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!pErr && profile) {
        setRole(profile.role || '')
        setQuote(profile.quote || '')
      }
      setLoading(false)
    }

    load()
  }, [navigate])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 text-gray-200">
        <p>Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-black to-gray-900 text-gray-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex-shrink-0 bg-gradient-to-b from-indigo-950/70 via-purple-950/40 to-black/60 border-r border-indigo-900/30 backdrop-blur p-3 md:p-4 w-16 md:w-64">
          <div className="flex items-center justify-center md:justify-start md:px-2 py-3">
            <Link to="/dashboard" className="text-sm md:text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">NeuroBizTwin</Link>
          </div>
          <nav className="mt-2 space-y-2">
            {[
              { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
              { to: '/addpost', label: 'Add Post', Icon: PlusSquare },
              { to: '/community', label: 'Community', Icon: Users },
              { to: '/network', label: 'My Network', Icon: Share2 },
              { to: '/aitalk', label: 'AI Talk', Icon: Bot },
              { to: '/profile', label: 'My Profile', Icon: UserIcon },
            ].map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2 transition shadow-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-600/40 shadow-indigo-500/40'
                    : 'bg-gray-900/40 border border-gray-800 hover:shadow-indigo-500/30 hover:border-indigo-700/40'
                }`}
                title={label}
              >
                <Icon className="h-5 w-5 text-indigo-300" />
                <span className="hidden md:inline text-sm font-semibold text-gray-100">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto pt-4">
            <button onClick={signOut} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900/40 hover:bg-gray-800 border border-gray-800 px-3 py-2 text-sm">
              <LogOut className="h-4 w-4 text-gray-300" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
            </div>

            <div className="grid gap-4 md:gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-5 md:p-6">
                <h2 className="text-sm uppercase tracking-wider text-gray-400">Account</h2>
                <p className="mt-2 text-lg break-all">{email}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-5 md:p-6">
                <h2 className="text-sm uppercase tracking-wider text-gray-400">Role</h2>
                <p className="mt-2 text-lg capitalize">{role || '—'}</p>
              </div>
              <div className="md:col-span-2 rounded-xl border border-gray-800 bg-gray-900/70 p-5 md:p-6">
                <h2 className="text-sm uppercase tracking-wider text-gray-400">Quote</h2>
                <p className="mt-2 text-xl text-gray-200">{quote || 'Dream big, start small.'}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
