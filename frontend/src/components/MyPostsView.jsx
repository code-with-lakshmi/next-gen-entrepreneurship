import React, { useEffect, useState } from 'react'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { LayoutDashboard, PlusSquare, Users, Share2, Bot, User as UserIcon, LogOut } from 'lucide-react'

export default function MyPostsView() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState('')
  const [counts] = useState({})

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setMessage('')
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) { navigate('/'); return }
      const { data, error } = await supabase
        .from('products')
        .select('id, product_name, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) setMessage(`Failed to fetch posts: ${error.message}`)
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [navigate])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-[#0b0218] to-purple-950 text-gray-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-6 shadow-md shadow-indigo-500/20">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">My Posts</h1>
              <p className="text-gray-400 mt-1">Here are the ideas you’ve shared with the community.</p>
              {message && <p className="mt-2 text-sm text-red-400">{message}</p>}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading && (
                  <div className="md:col-span-2 rounded-xl border border-gray-800 bg-gray-900/70 p-6">Loading…</div>
                )}
                {!loading && products.length === 0 && (
                  <div className="md:col-span-2 rounded-xl border border-gray-800 bg-gray-900/70 p-6">You haven't created any posts yet.</div>
                )}
                {!loading && products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="text-left rounded-xl bg-gray-800/70 border border-indigo-900/30 p-4 shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition"
                  >
                    <h3 className="text-base md:text-lg font-semibold text-gray-100">{p.product_name || 'Untitled'}</h3>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">{p.description || 'No description provided.'}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-gray-500">Posted on {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</p>
                      <div className="flex items-center gap-2" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
