import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'  // ← Changed from "/App.jsx" to "./App.jsx"
import './index.css'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)