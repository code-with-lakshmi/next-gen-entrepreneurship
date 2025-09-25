import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, PlusSquare, Users, Share2, Bot, User as UserIcon, LogOut } from 'lucide-react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState('')
  const [quote, setQuote] = useState('')
  const [username, setUsername] = useState('')
  const [products, setProducts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      // Early fallback: username from localStorage if present
      try {
        const cached = localStorage.getItem('username')
        if (cached) setUsername(cached)
      } catch {}
      const { data: userData, error: uErr } = await supabase.auth.getUser()
      if (uErr || !userData?.user) {
        navigate('/')
        return
      }
      const user = userData.user
      setEmail(user.email ?? '')
      const nameFromMeta = user.user_metadata?.name || user.user_metadata?.full_name || ''
      if (nameFromMeta) setDisplayName(nameFromMeta)

      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('role, quote, username')
        .eq('id', user.id)
        .maybeSingle()

      if (!pErr && profile) {
        setRole(profile.role || '')
        setQuote(profile.quote || '')
        setUsername(profile.username || '')
        try {
          if (profile.username) localStorage.setItem('username', profile.username)
        } catch {}
      }

      // Fetch products posted by the current user
      const { data: productRows, error: prodErr } = await supabase
        .from('products')
        .select('id, product_name, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!prodErr && Array.isArray(productRows)) {
        setProducts(productRows)
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
              { to: '/ai-talk', label: 'AI Talk', Icon: Bot },
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

        {/* Main Content split into two columns */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column: spans 2 */}
            <section className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Welcome Card */}
              <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 md:p-6 shadow-md shadow-indigo-500/20">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Welcome, {username || email || 'there'}!
                </h1>
                <p className="text-gray-400 mt-1">Your journey starts here.</p>
                <div className="mt-4 rounded-lg bg-black/30 border border-gray-800 p-4">
                  <h3 className="text-sm uppercase tracking-wider text-gray-400">Your Quote</h3>
                  <p className="mt-2 text-lg text-gray-200">
                    {quote || 'Add your quote in Profile'}
                  </p>
                </div>
              </div>

              {/* Products Card */}
              <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 md:p-6 shadow-md shadow-indigo-500/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Your Products</h2>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.length === 0 && (
                    <div className="col-span-1 md:col-span-2 text-gray-400">No products yet. Create one in Add Post.</div>
                  )}
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="text-left rounded-xl border border-indigo-900/40 bg-gradient-to-br from-slate-950/60 via-indigo-950/40 to-purple-950/40 hover:from-slate-900/70 hover:to-purple-900/50 transition transform hover:scale-[1.02] p-4 shadow-sm shadow-indigo-500/10 hover:shadow-indigo-500/30 group"
                    >
                      <h3 className="font-semibold text-gray-100 group-hover:text-indigo-200">
                        {p.product_name || 'Untitled Product'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                        {p.description || 'No description provided.'}
                      </p>
                      {p.created_at && (
                        <div className="mt-3 text-xs text-gray-500">
                          Created on {new Date(p.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Right Column: Notifications */}
            <aside className="lg:col-span-1 space-y-4 md:space-y-6">
              <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 md:p-6 shadow-md shadow-indigo-500/20">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Notifications</h2>
                <ul className="mt-4 space-y-3">
                  {[
                    'John commented on your post',
                    'Sara sent you a message',
                  ].map((n, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-indigo-900/40 bg-indigo-500/10 hover:bg-indigo-500/20 transition p-3 text-sm text-gray-200 shadow-sm shadow-indigo-500/10"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_2px_rgba(99,102,241,0.6)]"></span>
                        <span>{n}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-gray-500">Real-time notifications coming soon.</p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
