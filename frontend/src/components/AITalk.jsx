import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts'

function AITalk() {
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [marketingSpend, setMarketingSpend] = useState('')
  const [histValues, setHistValues] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const base = import.meta?.env?.VITE_API_URL
        ? String(import.meta.env.VITE_API_URL).trim().replace(/\/$/, '')
        : ''
      const url = `${base}/api/analyze`

      const body = {
        productName: productName || undefined,
        price: price ? Number(price) : undefined,
        marketingSpend: marketingSpend ? Number(marketingSpend) : undefined,
        historicalValues: histValues
          ? histValues.split(',').map((s) => Number(s.trim())).filter((v) => !Number.isNaN(v))
          : [],
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text}`)
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error('Analyze failed:', err)
      setError(err?.message || 'Failed to analyze')
    } finally {
      setLoading(false)
    }
  }

  const Card = ({ title, children }) => (
    <div className="p-[1px] rounded-xl bg-gradient-to-r from-purple-600/60 via-fuchsia-500/60 to-pink-500/60">
      <div className="bg-white/85 dark:bg-gray-900/85 rounded-xl shadow transition hover:shadow-xl hover:shadow-fuchsia-500/20">
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">{title}</h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  const sim = result?.simulation || {}
  const profitP10 = sim?.profit?.p10
  const profitP50 = sim?.profit?.p50
  const profitP90 = sim?.profit?.p90

  // Prepare forecast data for chart
  const forecastArray = useMemo(() => {
    // The /analyze response structure is { forecast: { source, forecast: [ { ds, p50, p90 }, ... ] } }
    // So prefer result.forecast.forecast (array). If result.forecast is already an array, use it as-is.
    const f = result?.forecast
    if (!f) return []
    if (Array.isArray(f)) return f
    if (Array.isArray(f?.forecast)) return f.forecast
    return []
  }, [result])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-center">
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">AI Talk</span>
        </h1>

        <form onSubmit={handleSubmit} className="rounded-2xl p-[1px] bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Smart Bottle"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 29.99"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marketing Spend</label>
            <input
              type="number"
              step="0.01"
              value={marketingSpend}
              onChange={(e) => setMarketingSpend(e.target.value)}
              placeholder="e.g., 500"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Historical Data (comma-separated)</label>
            <input
              type="text"
              value={histValues}
              onChange={(e) => setHistValues(e.target.value)}
              placeholder="100,120,130"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Forecast">
              <div className="h-64 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastArray} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="ds" stroke="#9CA3AF" tick={{ fontSize: 12 }} hide={forecastArray.length > 12} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', color: '#E5E7EB', border: '1px solid #374151' }} />
                    <Legend />
                    <Line type="monotone" dataKey="p50" stroke="#a78bfa" dot={false} strokeWidth={2} name="P50" />
                    <Line type="monotone" dataKey="p90" stroke="#f472b6" dot={false} strokeWidth={1} name="P90" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <pre className="mt-3 text-xs whitespace-pre-wrap break-words">{JSON.stringify(result?.forecast, null, 2)}</pre>
            </Card>

            <Card title="Elasticity">
              <div>Elasticity Coefficient: <span className="font-medium">{result?.elasticity?.elasticity ?? 'N/A'}</span></div>
              {typeof result?.elasticity?.intercept !== 'undefined' && (
                <div>Intercept: <span className="font-medium">{result?.elasticity?.intercept}</span></div>
              )}
            </Card>

            <Card title="ROI (Conversion Probability)">
              {Array.isArray(result?.roi?.probability_curve) ? (
                <div className="space-y-1 max-h-48 overflow-auto pr-1">
                  {result.roi.probability_curve.slice(0, 6).map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Spend: {row.spend}</span>
                      <span className="text-gray-200">p_conv: {(row.p_conv).toFixed(2)}</span>
                      <span className="text-gray-300">ROI: {(row.roi).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div>ROI data not available</div>
              )}
            </Card>

            <Card title="Monte Carlo (Profit)">
              <div>P10: <span className="font-medium">{typeof profitP10 !== 'undefined' ? profitP10 : 'N/A'}</span></div>
              <div>P50: <span className="font-medium">{typeof profitP50 !== 'undefined' ? profitP50 : 'N/A'}</span></div>
              <div>P90: <span className="font-medium">{typeof profitP90 !== 'undefined' ? profitP90 : 'N/A'}</span></div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default AITalk
