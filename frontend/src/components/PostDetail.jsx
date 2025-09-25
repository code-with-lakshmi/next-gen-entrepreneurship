import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function PostDetail() {
  const { id } = useParams()
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-[#0b0218] to-purple-950 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl border border-indigo-900/30 bg-gray-900/70 p-6 shadow-md shadow-indigo-500/20">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Post Details</h1>
          <p className="text-gray-400 mt-1">Placeholder detail page for post ID: <span className="text-indigo-300 font-mono">{id}</span></p>
          <p className="mt-4 text-gray-300">We will render full post details and comments here.</p>
        </div>
        <div className="mt-6">
          <Link to="/community" className="text-sm text-indigo-300 hover:text-indigo-200 underline">← Back to Community</Link>
        </div>
      </div>
    </div>
  )
}
