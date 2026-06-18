import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'

import useAuthStore       from './stores/authStore'
import ProtectedRoute     from './components/ProtectedRoute'
import SocketManager      from './components/SocketManager'

// ── Pages ─────────────────────────────────────────────────────────────────────
import Login              from './pages/Login'
import Dashboard          from './pages/Dashboard'
import Transactions       from './pages/Transactions'
import Hedging            from './pages/Hedging'
import CreditRisk         from './pages/CreditRisk'
import RiskDetail         from './pages/RiskDetail'
import PaymentTerms       from './pages/PaymentTerms'
import CurrencyBasket     from './pages/CurrencyBasket'
import CryptoSettlement   from './pages/CryptoSettlement'

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe)

  // Restore sesi dari localStorage saat pertama load
  useEffect(() => { fetchMe() }, [fetchMe])

  return (
    <>
      <SocketManager />
      <Routes>
      {/* ── Public ───────────────────────────────────────────────────────── */}
      <Route path="/login" element={<Login />} />

      {/* ── Protected: semua role ────────────────────────────────────────── */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/transactions" element={
        <ProtectedRoute>
          <Transactions />
        </ProtectedRoute>
      } />

      <Route path="/hedging" element={
        <ProtectedRoute roles={['treasury_officer', 'finance_manager', 'admin']}>
          <Hedging />
        </ProtectedRoute>
      } />

      <Route path="/credit-risk" element={
        <ProtectedRoute roles={['risk_analyst', 'finance_manager', 'admin']}>
          <CreditRisk />
        </ProtectedRoute>
      } />

      <Route path="/risk-detail" element={
        <ProtectedRoute roles={['risk_analyst', 'finance_manager', 'admin']}>
          <RiskDetail />
        </ProtectedRoute>
      } />

      <Route path="/payment-terms" element={
        <ProtectedRoute roles={['treasury_officer', 'finance_manager', 'admin']}>
          <PaymentTerms />
        </ProtectedRoute>
      } />

      <Route path="/currency-basket" element={
        <ProtectedRoute roles={['treasury_officer', 'finance_manager', 'admin']}>
          <CurrencyBasket />
        </ProtectedRoute>
      } />

      <Route path="/crypto" element={
        <ProtectedRoute>
          <CryptoSettlement />
        </ProtectedRoute>
      } />

      {/* ── Fallback ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
