import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

import useAuthStore       from './stores/authStore'
import ProtectedRoute     from './components/ProtectedRoute'
import SocketManager      from './components/SocketManager'
import Layout             from './components/layout/Layout'

// ── Pages ──────────────────────────────────────────────────────────────────────
import Login              from './pages/Login'
import Dashboard          from './pages/Dashboard'
import Transactions       from './pages/Transactions'
import Hedging            from './pages/Hedging'
import CreditRisk         from './pages/CreditRisk'
import RiskDetail         from './pages/RiskDetail'
import PaymentTerms       from './pages/PaymentTerms'
import CurrencyBasket     from './pages/CurrencyBasket'
import CryptoSettlement   from './pages/CryptoSettlement'
import Reports            from './pages/Reports'

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe)

  useEffect(() => { fetchMe() }, [fetchMe])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E2D44',
            color: '#F8FAFC',
            border: '1px solid #1E3A5F',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#0D9488', secondary: '#F8FAFC' },
            style: {
              borderLeft: '4px solid #0D9488',
            }
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#F8FAFC' },
            style: {
              borderLeft: '4px solid #DC2626',
            }
          },
        }}
      />
      <SocketManager />
      <Routes>
        {/* ── Public ──────────────────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />

        {/* ── Protected: all roles can access all pages ────────────────────── */}
        <Route element={<Layout />}>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } />

          <Route path="/transactions/:id" element={
            <ProtectedRoute>
              <RiskDetail />
            </ProtectedRoute>
          } />

          <Route path="/risk-detail/:id?" element={
            <ProtectedRoute>
              <RiskDetail />
            </ProtectedRoute>
          } />

          <Route path="/hedging" element={
            <ProtectedRoute>
              <Hedging />
            </ProtectedRoute>
          } />

          <Route path="/payment-terms" element={
            <ProtectedRoute>
              <PaymentTerms />
            </ProtectedRoute>
          } />

          <Route path="/currency-basket" element={
            <ProtectedRoute>
              <CurrencyBasket />
            </ProtectedRoute>
          } />

          <Route path="/credit-risk" element={
            <ProtectedRoute>
              <CreditRisk />
            </ProtectedRoute>
          } />

          <Route path="/crypto-settlement" element={
            <ProtectedRoute>
              <CryptoSettlement />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
        </Route>

        {/* ── Fallback ────────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
