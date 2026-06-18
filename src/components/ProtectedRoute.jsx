/**
 * ProtectedRoute.jsx
 *
 * Wrapper untuk route yang butuh autentikasi.
 * - Kalau belum login → redirect ke /login
 * - Kalau roles tertentu dibutuhkan → cek req.user.peran
 * - Kalau akses ditolak → tampilkan halaman 403
 *
 * Penggunaan:
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 *
 *   <ProtectedRoute roles={['admin', 'finance_manager']}>
 *     <Approval />
 *   </ProtectedRoute>
 */

import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

// ─── Halaman 403 ──────────────────────────────────────────────────────────────
function AccessDenied({ userRole }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A1628',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", color: '#94A3B8',
    }}>
      <div style={{
        textAlign: 'center', padding: '40px',
        background: 'rgba(15,27,45,0.8)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '20px', maxWidth: '400px',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 20px',
          background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 style={{ margin: '0 0 8px', color: '#F1F5F9', fontSize: '20px', fontWeight: 700 }}>
          Akses Ditolak
        </h2>
        <p style={{ margin: '0 0 6px', fontSize: '14px', lineHeight: 1.5 }}>
          Anda tidak memiliki hak akses untuk halaman ini.
        </p>
        {userRole && (
          <p style={{ margin: '0 0 24px', fontSize: '12px', color: '#475569' }}>
            Peran Anda saat ini: <strong style={{ color: '#0891B2' }}>{userRole}</strong>
          </p>
        )}
        <a href="/" style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #0891B2, #0E7490)',
          color: 'white', borderRadius: '8px', textDecoration: 'none',
          fontSize: '14px', fontWeight: 600,
        }}>
          Kembali ke Dashboard
        </a>
      </div>
    </div>
  );
}

// ─── Protected Route ──────────────────────────────────────────────────────────
export default function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const { token, user } = useAuthStore();

  // Belum login → redirect ke login, simpan halaman asal
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cek role jika dibutuhkan
  if (roles && roles.length > 0) {
    const isAdmin    = user.peran === 'admin';
    const hasRole    = roles.includes(user.peran);

    if (!isAdmin && !hasRole) {
      return <AccessDenied userRole={user.peran} />;
    }
  }

  return children;
}
