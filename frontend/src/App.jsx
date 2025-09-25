import React from 'react'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import RoleSelect from './components/RoleSelect'
import MyProfile from './components/MyProfile'
import ProductDetail from './components/ProductDetail'
import PostDetail from './components/PostDetail'
import AddPost from './components/AddPost'
import Community from './components/Community'
import MyPosts from './components/MyPosts'
import MyPostsView from './components/MyPostsView'
import Network from './components/Network'
import AITalk from './components/AITalk'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/roleselect" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/roleselect" element={<RoleSelect />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/my-posts" element={<MyPosts />} />
      <Route path="/my-posts/add" element={<AddPost />} />
      <Route path="/my-posts/view" element={<MyPostsView />} />
      <Route path="/addpost" element={<AddPost />} />
      <Route path="/community" element={<Community />} />
      <Route path="/network" element={<Network />} />
      <Route path="/profile" element={<MyProfile />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/ai-talk" element={<AITalk />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
