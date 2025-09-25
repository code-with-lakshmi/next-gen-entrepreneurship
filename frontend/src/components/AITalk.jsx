import React, { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts'

function AITalk() {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Dummy state to populate after analysis
  const [feasibility, setFeasibility] = useState(75)
  const [feasibilityReasons, setFeasibilityReasons] = useState([
    'Large target market',
    'Moderate competition',
    'Scalable technology',
    'Requires initial high investment',
  ])
  const [risks, setRisks] = useState([
    'High upfront cost',
    'Strong competition from existing players',
    'Dependence on supply chain stability',
  ])
  const [improvementSuggestions, setImprovementSuggestions] = useState([
    'Focus on building unique features',
    'Explore partnerships for cost reduction',
    'Start with niche markets',
    'Apply for early-stage grants',
  ])
  const [revenueData, setRevenueData] = useState([])
  const [adoptionData, setAdoptionData] = useState([])
  const [profitCostData, setProfitCostData] = useState([])

  const analyzeIdea = (e) => {
    e.preventDefault()
    setLoading(true)
    setShowResults(false)

    // Simulate a 2s analysis delay, then populate dummy data
    setTimeout(() => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const baseRev = 200
      const rev = months.map((m, i) => ({ month: m, revenue: baseRev + i * 30 + Math.round(Math.random() * 20) }))
      const adoption = months.map((m, i) => {
        const x = (i - 5) / 2.5
        const y = 1 / (1 + Math.exp(-x))
        return { month: m, adoption: Math.round(y * 100) }
      })
      const pc = months.map((m, i) => {
        const cost = 150 + i * 6 + Math.round(Math.random() * 15)
        const profit = rev[i].revenue - cost + Math.round(Math.random() * 10)
        return { month: m, profit, cost }
      })

      setFeasibility(75)
      setFeasibilityReasons([
        'Large target market',
        'Moderate competition',
        'Scalable technology',
        'Requires initial high investment',
      ])
      setRisks([
        'High upfront cost',
        'Strong competition from existing players',
        'Dependence on supply chain stability',
      ])
      setImprovementSuggestions([
        'Focus on building unique features',
        'Explore partnerships for cost reduction',
        'Start with niche markets',
        'Apply for early-stage grants',
      ])
      setRevenueData(rev)
      setAdoptionData(adoption)
      setProfitCostData(pc)
      setShowResults(true)
      setLoading(false)
    }, 2000)
  }

  const Card = ({ title, children }) => (
    <div className="p-[1px] rounded-xl bg-gradient-to-r from-purple-600/60 via-fuchsia-500/60 to-pink-500/60">
      <div className="bg-gray-900/70 rounded-xl shadow shadow-indigo-500/20">
        <div className="p-5">
          {title && (
            <h3 className="text-lg font-semibold mb-3 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              {title}
            </h3>
          )}
          <div className="text-sm text-gray-300 space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center">
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">AI Project Mentor</span>
        </h1>

        {/* 1. Input Section */}
        <section>
          <form onSubmit={analyzeIdea} className="rounded-2xl p-[1px] bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
            <div className="rounded-2xl bg-gray-950/70 p-5 md:p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Describe your project idea</label>
              <textarea
                rows={5}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your project idea..."
                className="w-full rounded-lg border border-gray-800 bg-gray-900/80 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 p-3"
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold shadow shadow-fuchsia-500/20 hover:shadow-fuchsia-500/40 hover:brightness-105 disabled:opacity-60"
              >
                {loading && (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {loading ? 'Analyzing Idea…' : 'Analyze Idea'}
              </button>
            </div>
          </form>
        </section>

        {/* 2. AI Output Section */}
        {showResults && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feasibility Score Card */}
            <Card title="Feasibility Score">
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {feasibility}% chance of success
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-200 mb-2">Why?</h4>
                <ul className="list-disc pl-6 space-y-1">
                  {feasibilityReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* AI Analysis Card */}
            <Card title="AI Analysis">
              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-2">Disadvantages / Risks</h4>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  {risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <h4 className="text-sm font-semibold text-gray-200 mb-2">AI Suggestions</h4>
                <ul className="list-disc pl-6 space-y-1">
                  {improvementSuggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Forecast Graphs */}
            <Card title="Revenue Growth Forecast">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', color: '#E5E7EB', border: '1px solid #374151' }} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#a78bfa" strokeWidth={2} dot={false} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Market Adoption Curve">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={adoptionData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adopt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', color: '#E5E7EB', border: '1px solid #374151' }} />
                    <Legend />
                    <Area type="monotone" dataKey="adoption" stroke="#ec4899" fill="url(#adopt)" name="Adoption %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Profit vs Cost Forecast">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitCostData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', color: '#E5E7EB', border: '1px solid #374151' }} />
                    <Legend />
                    <Bar dataKey="profit" fill="#22c55e" name="Profit" />
                    <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>
        )}

        {/* 3. Visualization Section */}
        {showResults && (
          <section>
            <Card title="Future Mockup">
              <div className="rounded-xl border border-fuchsia-700/30 bg-gradient-to-br from-purple-950/60 via-fuchsia-950/40 to-black/40 p-10 text-center">
                <div className="rounded-lg h-40 md:h-56 bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-pink-600/20 border border-fuchsia-600/30 flex items-center justify-center text-sm md:text-base text-fuchsia-200">
                  AI visualization of your idea will appear here.
                </div>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  )
}

export default AITalk
