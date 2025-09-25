import React, { useState } from 'react'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { LayoutDashboard, PlusSquare, Users, Share2, Bot, User as UserIcon, LogOut } from 'lucide-react'

export default function AddPost() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [strategy, setStrategy] = useState('')
  const [hiring, setHiring] = useState('')

  // errors
  const [errors, setErrors] = useState({})

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'This field is required'
    if (!description.trim()) e.description = 'This field is required'
    if (!strategy.trim()) e.strategy = 'This field is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    setMessage('')
    if (!validate()) return
    setLoading(true)

    // get current user
    const { data: userData, error: uErr } = await supabase.auth.getUser()
    if (uErr || !userData?.user) {
      setMessage('You must be signed in to post.')
      setLoading(false)
      return
    }
    const user = userData.user

    // insert into products
    const { error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        product_name: name.trim(),
        description: description.trim(),
        price: price !== '' ? Number(price) : null,
        cost: cost !== '' ? Number(cost) : null,
        marketing_strategy: strategy.trim(),
        hiring_needs: hiring.trim() || null,
      })

    if (error) {
      setMessage(`Failed to post: ${error.message}`)
      setLoading(false)
      return
    }

    setMessage('Product posted successfully!')
    // brief delay then redirect to My Posts view
    setTimeout(() => navigate('/my-posts/view'), 400)
    setLoading(false)
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
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-6 shadow-md shadow-indigo-500/20">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Add New Product</h1>
              <p className="text-gray-400 mt-1">Share your idea with the community and get valuable suggestions!</p>

              <div className="mt-6 space-y-5">
                {/* Product Name */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Product Name<span className="text-red-500"> *</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-lg bg-gray-800/70 border p-3 outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-indigo-500'}`}
                    placeholder="What's your product called?"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Description<span className="text-red-500"> *</span></label>
                  <textarea
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full rounded-lg bg-gray-800/70 border p-3 outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-indigo-500'}`}
                    placeholder="Describe your product briefly"
                  />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Price & Cost */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Price</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-lg bg-gray-800/70 border border-gray-700 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Cost</label>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full rounded-lg bg-gray-800/70 border border-gray-700 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>

                {/* Marketing Strategy */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Marketing Strategy<span className="text-red-500"> *</span></label>
                  <textarea
                    rows="3"
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className={`w-full rounded-lg bg-gray-800/70 border p-3 outline-none focus:ring-2 ${errors.strategy ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-indigo-500'}`}
                    placeholder="How will you market this product?"
                  />
                  {errors.strategy && <p className="text-red-400 text-sm mt-1">{errors.strategy}</p>}
                </div>

                {/* Hiring Needs */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Hiring Needs</label>
                  <textarea
                    rows="3"
                    value={hiring}
                    onChange={(e) => setHiring(e.target.value)}
                    className="w-full rounded-lg bg-gray-800/70 border border-gray-700 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Roles you want to hire (optional)"
                  />
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 transition transform hover:scale-105 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30"
                  >
                    {loading ? 'Posting…' : 'Post My Idea'}
                  </button>
                  {message && (
                    <p className="mt-3 text-sm text-indigo-200">{message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
