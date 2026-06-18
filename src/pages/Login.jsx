import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function Login() {
  const navigate  = useNavigate();
  const { login, isLoading, error, clearError, token } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState('');

  // Kalau sudah login, redirect ke dashboard
  useEffect(() => {
    if (token) navigate('/', { replace: true });
  }, [token, navigate]);

  // Sync store error ke localError
  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleChange = (e) => {
    setLocalError('');
    clearError();
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!form.email || !form.password) {
      setLocalError('Email and password are required.');
      return;
    }

    const result = await login(form.email, form.password);
    if (result.success) navigate('/', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F1B2D 0%, #0A1628 50%, #061020 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Background decoration ───────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Orb kiri atas */}
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)',
        }} />
        {/* Orb kanan bawah */}
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        }} />
        {/* Grid lines */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.03 }} width="100%" height="100%">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0891B2" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── Card ────────────────────────────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: '420px', margin: '0 16px',
        background: 'rgba(15, 27, 45, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(8, 145, 178, 0.2)',
        borderRadius: '20px',
        padding: '40px 40px 36px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
        position: 'relative',
      }}>

        {/* Glow top border */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
          background: 'linear-gradient(90deg, transparent, #0891B2, transparent)',
          borderRadius: '1px',
        }} />

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {/* Logo icon */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #0891B2, #0E7490)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(8,145,178,0.35)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>

          <h1 style={{
            margin: 0, fontSize: '22px', fontWeight: 700,
            color: '#F0F9FF', letterSpacing: '-0.3px',
          }}>
            GlobalTrade ERP
          </h1>
          <p style={{
            margin: '6px 0 0', fontSize: '13.5px',
            color: '#64748B', letterSpacing: '0.2px',
          }}>
            Sistem Manajemen Keuangan & Risiko
          </p>
        </div>

        {/* ── Error Alert ──────────────────────────────────────────────── */}
        {localError && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '12px 14px',
            marginBottom: '20px',
            animation: 'fadeIn 0.2s ease',
          }}>
            <svg style={{ flexShrink: 0, marginTop: '1px' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ margin: 0, fontSize: '13px', color: '#FCA5A5', lineHeight: '1.4' }}>
              {localError}
            </p>
          </div>
        )}

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '12.5px', fontWeight: 600,
              color: '#94A3B8', marginBottom: '7px', letterSpacing: '0.3px',
            }}>
              EMAIL
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@globaltrade.co.id"
                autoComplete="email"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: '42px', paddingRight: '14px',
                  paddingTop: '11px', paddingBottom: '11px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: localError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(51,65,85,0.8)',
                  borderRadius: '10px',
                  color: '#E2E8F0', fontSize: '14px',
                  outline: 'none', transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#0891B2'; e.target.style.boxShadow = '0 0 0 3px rgba(8,145,178,0.15)'; }}
                onBlur={e =>  { e.target.style.borderColor = 'rgba(51,65,85,0.8)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', fontSize: '12.5px', fontWeight: 600,
              color: '#94A3B8', marginBottom: '7px', letterSpacing: '0.3px',
            }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: '42px', paddingRight: '44px',
                  paddingTop: '11px', paddingBottom: '11px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: localError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(51,65,85,0.8)',
                  borderRadius: '10px',
                  color: '#E2E8F0', fontSize: '14px',
                  outline: 'none', transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#0891B2'; e.target.style.boxShadow = '0 0 0 3px rgba(8,145,178,0.15)'; }}
                onBlur={e =>  { e.target.style.borderColor = 'rgba(51,65,85,0.8)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: '#475569',
                }}
              >
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: isLoading
                ? 'rgba(8,145,178,0.5)'
                : 'linear-gradient(135deg, #0891B2, #0E7490)',
              border: 'none', borderRadius: '10px',
              color: 'white', fontSize: '14.5px', fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.3px',
              boxShadow: isLoading ? 'none' : '0 4px 20px rgba(8,145,178,0.35)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
            onMouseEnter={e => { if (!isLoading) { e.target.style.background = 'linear-gradient(135deg, #0E7490, #0891B2)'; e.target.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { if (!isLoading) { e.target.style.background = 'linear-gradient(135deg, #0891B2, #0E7490)'; e.target.style.transform = 'translateY(0)'; }}}
          >
            {isLoading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Memverifikasi...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Masuk ke Sistem
              </>
            )}
          </button>
        </form>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div style={{
          marginTop: '28px', paddingTop: '20px',
          borderTop: '1px solid rgba(51,65,85,0.5)',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '11.5px', color: '#334155' }}>
            © 2024 GlobalTrade ERP · Sistem Keuangan Internasional
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: #334155; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  );
}
