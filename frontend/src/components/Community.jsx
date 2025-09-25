import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { LayoutDashboard, PlusSquare, Users, Share2, Bot, User as UserIcon, LogOut, ThumbsUp, MessageCircle, Send, Search as SearchIcon, ChevronDown, ChevronUp } from 'lucide-react'

export default function Community() {
  const navigate = useNavigate()

  // UI state
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('recent') // 'recent' | 'liked' | 'ai'
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState([])
  const [openComments, setOpenComments] = useState({})
  const [likes, setLikes] = useState({})

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, description, ai_score, likes_count, comments_count, author_name, author_avatar, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        // Fallback placeholder data if table not ready
        const demo = [
          { id: '1', title: 'Smart Hydroponics Kit', description: 'IoT-enabled indoor farming solution.', ai_score: 82, likes_count: 12, comments_count: 3, author_name: 'Aarav', author_avatar: '', created_at: new Date().toISOString() },
          { id: '2', title: 'Language Buddy', description: 'AI tutor for conversational practice.', ai_score: 76, likes_count: 30, comments_count: 12, author_name: 'Mira', author_avatar: '', created_at: new Date().toISOString() },
          { id: '3', title: 'GreenRide', description: 'Shared e-bike network for campuses.', ai_score: 68, likes_count: 5, comments_count: 1, author_name: 'Kabir', author_avatar: '', created_at: new Date().toISOString() },
        ]
        setPosts(demo)
        setLikes(Object.fromEntries(demo.map(d => [d.id, d.likes_count || 0])))
      } else {
        setPosts(data || [])
        setLikes(Object.fromEntries((data || []).map(d => [d.id, d.likes_count || 0])))
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let list = posts
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => (p.title || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
    }
    if (filter === 'liked') {
      list = [...list].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    } else if (filter === 'ai') {
      list = [...list].sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0))
    }
    return list
  }, [posts, search, filter])

  const toggleComments = (id) => setOpenComments((m) => ({ ...m, [id]: !m[id] }))
  const likePost = (id) => setLikes((m) => ({ ...m, [id]: (m[id] || 0) + 1 }))

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

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left: Feed */}
            <section className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Top bar */}
              <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-4 md:p-5 shadow-md shadow-indigo-500/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Community</h1>
                  <div className="flex flex-1 md:max-w-md gap-2 items-center">
                    <div className="relative flex-1">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full rounded-lg bg-black/40 border border-gray-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-700/40 outline-none pl-9 pr-3 py-2 text-gray-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      {[
                        { key: 'recent', label: 'Recent' },
                        { key: 'liked', label: 'Most Liked' },
                        { key: 'ai', label: 'AI Score' },
                      ].map(b => (
                        <button
                          key={b.key}
                          onClick={() => setFilter(b.key)}
                          className={`rounded-md px-3 py-2 text-xs border transition ${filter === b.key ? 'bg-indigo-600/30 border-indigo-600/60 text-indigo-200' : 'bg-black/30 border-gray-800 text-gray-300 hover:border-indigo-700/50'}`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed list */}
              <div className="space-y-4 md:space-y-5">
                {loading && (
                  <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-5">Loading posts…</div>
                )}
                {!loading && filtered.length === 0 && (
                  <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-5">No posts found.</div>
                )}
                {!loading && filtered.map((p) => (
                  <article key={p.id} className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-4 md:p-5 shadow-md shadow-indigo-500/20">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center text-sm font-semibold">
                        {(p.author_name?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-gray-300 font-medium">{p.author_name || 'Entrepreneur'}</p>
                            <p className="text-xs text-gray-500">{new Date(p.created_at || Date.now()).toLocaleString()}</p>
                          </div>
                          <button onClick={() => navigate(`/post/${p.id}`)} className="text-xs text-indigo-300 hover:text-indigo-200 underline">View</button>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-gray-100">{p.title || 'Untitled'}</h3>
                        <p className="mt-1 text-sm text-gray-400">{p.description || 'No description provided.'}</p>
                        <div className="mt-3 rounded-lg bg-black/30 border border-gray-800 p-3 text-sm text-indigo-200">
                          AI Insight: Feasibility {p.ai_score != null ? `${p.ai_score}%` : '—'} chance of success
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <button onClick={() => likePost(p.id)} className="inline-flex items-center gap-1 rounded-md bg-black/30 hover:bg-black/40 border border-gray-800 px-3 py-1.5 text-xs text-gray-200 shadow-sm hover:shadow-indigo-500/20">
                            <ThumbsUp className="h-4 w-4" /> Like <span className="text-indigo-300">{likes[p.id] ?? p.likes_count ?? 0}</span>
                          </button>
                          <button onClick={() => toggleComments(p.id)} className="inline-flex items-center gap-1 rounded-md bg-black/30 hover:bg-black/40 border border-gray-800 px-3 py-1.5 text-xs text-gray-200">
                            <MessageCircle className="h-4 w-4" /> Comments {openComments[p.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <button onClick={() => alert('Share coming soon')} className="inline-flex items-center gap-1 rounded-md bg-black/30 hover:bg-black/40 border border-gray-800 px-3 py-1.5 text-xs text-gray-200">
                            <Send className="h-4 w-4" /> Share
                          </button>
                        </div>

                        {/* Comments */}
                        {openComments[p.id] && (
                          <div className="mt-3 space-y-3">
                            <div className="rounded-lg bg-black/30 border border-gray-800 p-3">
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-700/70 flex items-center justify-center text-xs">J</div>
                                <div>
                                  <p className="text-sm text-gray-200">John • <span className="text-gray-500 text-xs">2h ago</span></p>
                                  <p className="text-sm text-gray-300">Great concept! Consider partnerships with campus clubs.</p>
                                </div>
                              </div>
                              {/* nested reply */}
                              <div className="mt-3 ml-8 pl-3 border-l border-gray-800">
                                <div className="flex items-start gap-3">
                                  <div className="h-7 w-7 rounded-full bg-purple-700/70 flex items-center justify-center text-[10px]">S</div>
                                  <div>
                                    <p className="text-sm text-gray-200">Sara • <span className="text-gray-500 text-xs">1h ago</span></p>
                                    <p className="text-sm text-gray-300">Agree! Also test with a pilot cohort.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Right: Sidebar */}
            <aside className="lg:col-span-1 space-y-4 md:space-y-6">
              {/* Suggested Connections */}
              <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 shadow-md shadow-indigo-500/20">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">People you may want to connect with</h2>
                <ul className="mt-4 space-y-3">
                  {[
                    { name: 'Anika', role: 'Marketing' },
                    { name: 'Dev', role: 'Engineer' },
                    { name: 'Riya', role: 'Designer' },
                    { name: 'Vikram', role: 'Growth' },
                  ].map((p, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 rounded-lg bg-black/30 border border-gray-800 p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center text-xs font-semibold">
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="text-sm text-gray-200">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.role}</p>
                        </div>
                      </div>
                      <button onClick={() => alert('Connect coming soon')} className="rounded-md border border-indigo-800 bg-indigo-600/20 hover:bg-indigo-600/30 text-xs px-3 py-1 text-indigo-200">Connect</button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trending Posts */}
              <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 shadow-md shadow-indigo-500/20">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Trending Ideas</h2>
                <ul className="mt-4 space-y-3">
                  {([...posts].sort((a,b) => (b.ai_score||0)-(a.ai_score||0)).slice(0,3)).map((t) => (
                    <li key={t.id} className="rounded-lg bg-black/30 border border-gray-800 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-200">{t.title}</p>
                          <p className="text-xs text-gray-500">AI Score: {t.ai_score ?? '—'}</p>
                        </div>
                        <button onClick={() => navigate(`/post/${t.id}`)} className="text-xs text-indigo-300 hover:text-indigo-200 underline">View</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
