import React, { useEffect, useState } from 'react'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { LayoutDashboard, PlusSquare, Users, Share2, Bot, User as UserIcon, LogOut } from 'lucide-react'

export default function MyProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Profile fields
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [username, setUsername] = useState('')
  const [quote, setQuote] = useState('')
  const [theme, setTheme] = useState('dark')

  // Settings (dummy for now)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setMessage('')
      // Get current user
      const { data: userData, error: uErr } = await supabase.auth.getUser()
      if (uErr || !userData?.user) {
        navigate('/')
        return
      }
      const user = userData.user
      setEmail(user.email ?? '')

      // Fetch profile
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('role, username, quote')
        .eq('id', user.id)
        .maybeSingle()

      if (!pErr && profile) {
        setRole(profile.role || '')
        setUsername(profile.username || '')
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

  const saveChanges = async () => {
    setLoading(true)
    setMessage('')
    const { data: current } = await supabase.auth.getUser()
    const userId = current?.user?.id
    if (!userId) {
      setMessage('Not authenticated.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          username: username?.trim() || null,
          quote: quote?.trim() || null,
          role: role || null,
        },
        { onConflict: 'id' }
      )

    if (error) {
      setMessage(`Save failed: ${error.message}`)
    } else {
      try {
        if (username?.trim()) localStorage.setItem('username', username.trim())
      } catch {}
      setMessage('Profile saved successfully!')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-950 via-[#0b0218] to-purple-950 text-gray-200">
        <p>Loading profile…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-[#0b0218] to-purple-950 text-gray-100">
      <div className="flex min-h-screen">
        {/* Sidebar - same style as Dashboard */}
        <aside className="flex-shrink-0 bg-gradient-to-b from-indigo-950/70 via-purple-950/40 to-black/60 border-r border-indigo-900/30 backdrop-blur p-3 md:p-4 w-16 md:w-64">
          <div className="flex items-center justify-center md:justify-start md:px-2 py-3">
            <Link to="/dashboard" className="text-sm md:text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">NeuroBizTwin</Link>
          </div>
          <nav className="mt-2 space-y-2">
            {[
              { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
              { to: '/my-posts', label: 'My Posts', Icon: PlusSquare },
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

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 md:p-6 shadow-md shadow-indigo-500/20">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">My Profile</h1>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-lg bg-black/40 border border-gray-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-700/40 outline-none px-3 py-2 text-gray-100"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full rounded-lg bg-black/30 border border-gray-800 px-3 py-2 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm text-gray-300 mb-1">Role</label>
                  <input
                    type="text"
                    value={role || ''}
                    readOnly
                    className="w-full rounded-lg bg-black/30 border border-gray-800 px-3 py-2 text-gray-400 cursor-not-allowed capitalize"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Quote</label>
                  <input
                    type="text"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Update  your motivational quote"
                    className="w-full rounded-lg bg-black/40 border border-gray-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-700/40 outline-none px-3 py-2 text-gray-100"
                  />
                </div>
              </div>
              <div className="mt-5">
                <button
                  onClick={saveChanges}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30"
                >
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
                {message && (
                  <p className="mt-3 text-sm text-indigo-200">{message}</p>
                )}
              </div>
            </div>

            {/* Account Settings Card */}
            <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 md:p-6 shadow-md shadow-indigo-500/20">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Account Settings</h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => alert('Password reset flow coming soon')}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30"
                >
                  Change Password
                </button>
                <button
                  onClick={() => alert('Delete account flow coming soon')}
                  className="inline-flex items-center justify-center rounded-lg bg-red-600/90 hover:bg-red-600 px-3 py-2 text-xs font-semibold text-white border border-red-700 shadow-sm hover:shadow-red-500/30"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* Preferences Card */}
            <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 md:p-6 shadow-md shadow-indigo-500/20">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Preferences</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Notifications</span>
                  <button
                    onClick={() => setNotificationsEnabled((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Theme</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`rounded-md px-3 py-1 text-xs border ${theme === 'dark' ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-black/30 text-gray-300 border-gray-700'}`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`rounded-md px-3 py-1 text-xs border ${theme === 'light' ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-black/30 text-gray-300 border-gray-700'}`}
                    >
                      Light
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
