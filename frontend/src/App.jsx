import React from 'react'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import RoleSelect from './components/RoleSelect'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/roleselect" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/roleselect" element={<RoleSelect />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
