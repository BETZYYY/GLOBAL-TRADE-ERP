import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1c2a41',
          color: '#d6e3ff',
          border: '1px solid #3e484d'
        }
      }} />
      <App />
    </BrowserRouter>
  </React.StrictMode>
)