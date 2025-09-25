import React, { useMemo, useState } from 'react'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { LayoutDashboard, PlusSquare, Users, Share2, Bot, User as UserIcon, LogOut, Send } from 'lucide-react'

export default function Network() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState({}) // {id: [{from:'me'|'them', text, time}]}

  const connections = [
    { id: 'c1', name: 'Abigail Wilson', role: 'Software Engineer' },
    { id: 'c2', name: 'John Doe', role: 'Entrepreneur, Acme Corp' },
    { id: 'c3', name: 'Emma Johnson', role: 'Marketing Specialist' },
    { id: 'c4', name: 'Ethan Brown', role: 'Product Manager' },
    { id: 'c5', name: 'Liam Patel', role: 'Founder, StartupX' },
  ]

  const suggestions = [
    { id: 's1', name: 'Hannah Kim', role: 'Designer' },
    { id: 's2', name: 'Michael Brooks', role: 'Business Analyst' },
    { id: 's3', name: 'Sarah Lee', role: 'Project Manager' },
    { id: 's4', name: 'Olivia Parker', role: 'Data Scientist' },
  ]

  const filtered = useMemo(() => {
    if (!search.trim()) return connections
    const q = search.toLowerCase()
    return connections.filter(c => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q))
  }, [search])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const initials = (name) => name.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase()

  const sendMessage = () => {
    if (!selected || !message.trim()) return
    setChat(prev => {
      const prevMsgs = prev[selected.id] || []
      return { ...prev, [selected.id]: [...prevMsgs, { from: 'me', text: message.trim(), time: new Date().toLocaleTimeString() }] }
    })
    setMessage('')
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
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left + Middle: Connections */}
            <section className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 shadow-md shadow-indigo-500/20">
                  <p className="text-sm text-gray-400">Connections</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-300">1,200</p>
                </div>
                <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 shadow-md shadow-indigo-500/20">
                  <p className="text-sm text-gray-400">Pending Requests</p>
                  <p className="mt-1 text-2xl font-bold text-violet-300">42</p>
                </div>
              </div>

              {/* Search */}
              <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-4 shadow-md shadow-indigo-500/20">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your connections..."
                  className="w-full rounded-lg bg-black/40 border border-gray-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-700/40 outline-none px-3 py-2 text-gray-100"
                />
              </div>

              {/* Connections list */}
              <div className="space-y-3">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="w-full text-left rounded-xl bg-gray-900/70 border border-indigo-900/30 p-4 shadow-md shadow-indigo-500/20 hover:bg-gray-900/80 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center text-sm font-semibold">
                        {initials(c.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-100 truncate">{c.name}</p>
                        <p className="text-sm text-gray-400 truncate">{c.role}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Right Panel */}
            <aside className="lg:col-span-1 space-y-4 md:space-y-6">
              {!selected ? (
                <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 shadow-md shadow-indigo-500/20">
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Suggested Connections</h2>
                  <ul className="mt-4 space-y-3">
                    {suggestions.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg bg-black/30 border border-gray-800 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center text-xs font-semibold">
                            {initials(s.name)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-200">{s.name}</p>
                            <p className="text-xs text-gray-500">{s.role}</p>
                          </div>
                        </div>
                        <button onClick={() => alert('Connect coming soon')} className="rounded-md border border-indigo-800 bg-indigo-600/20 hover:bg-indigo-600/30 text-xs px-3 py-1 text-indigo-200">Connect</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-5 shadow-md shadow-indigo-500/20 flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center text-xs font-semibold">
                        {initials(selected.name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-100">{selected.name}</h3>
                        <p className="text-xs text-gray-500">{selected.role}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-xs text-indigo-300 hover:text-indigo-200 underline">Back to Suggestions</button>
                  </div>

                  {/* Messages */}
                  <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
                    {(chat[selected.id] || [
                      { from: 'them', text: 'Hey! Great to connect.', time: '10:12 AM' },
                      { from: 'me', text: 'Likewise! Would love to chat about your idea.', time: '10:14 AM' },
                    ]).map((m, idx) => (
                      <div key={idx} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.from === 'me' ? 'ml-auto bg-indigo-600/30 text-indigo-100' : 'bg-black/30 border border-gray-800 text-gray-200'}`}>
                        <p>{m.text}</p>
                        <p className="mt-1 text-[10px] text-gray-400">{m.time}</p>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-lg bg-black/40 border border-gray-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-700/40 outline-none px-3 py-2 text-gray-100"
                    />
                    <button onClick={sendMessage} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30">
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
