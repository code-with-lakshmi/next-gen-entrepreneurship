import React, { useEffect, useState } from 'react'
import './App.css'
import { fetchMessage } from './api'
import Auth from './components/Auth'

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    fetchMessage().then((data) => {
      if (mounted) setMessage(data?.message ?? '')
    })
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <main className="text-center w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-blue-600">NeuroBizTwin Dashboard</h1>
        <p className="text-lg text-gray-700 mt-4">{message || 'Loading...'}</p>
        <Auth />
      </main>
    </div>
  )
}

export default App
