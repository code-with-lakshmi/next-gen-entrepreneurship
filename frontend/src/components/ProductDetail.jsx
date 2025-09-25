import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function ProductDetail() {
  const { id } = useParams()
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Product Details</h1>
          <p className="text-gray-400 mt-1">Placeholder detail page for product ID: <span className="text-indigo-300 font-mono">{id}</span></p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-6 shadow-md shadow-indigo-500/20">
          <p className="text-gray-300">This is a placeholder. We will render full product details here later.</p>
        </div>
        <div className="mt-6">
          <Link to="/dashboard" className="text-sm text-indigo-300 hover:text-indigo-200 underline">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
