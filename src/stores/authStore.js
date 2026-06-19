/**
 * authStore.js – Zustand store untuk autentikasi GlobalTrade ERP
 *
 * State:
 *   token      → JWT string atau null
 *   user       → { id, nama, email, peran, hak_akses } atau null
 *   isLoading  → boolean saat fetch berlangsung
 *   error      → pesan error login atau null
 *
 * Actions:
 *   login(email, password)  → POST /api/auth/login
 *   logout()                → POST /api/auth/logout
 *   fetchMe()               → GET /api/auth/me (restore sesi dari localStorage)
 *   clearError()
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token:     null,
      user:      null,
      isLoading: false,
      error:     null,

      // ── Login ──────────────────────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            set({ isLoading: false, error: data.message || 'Login failed.' });
            return { success: false, message: data.message };
          }

          set({
            token:     data.data.token,
            user:      data.data.user,
            isLoading: false,
            error:     null,
          });

          return { success: true };
        } catch {
          const msg = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      // ── Logout ─────────────────────────────────────────────────────────────
      logout: async () => {
        const { token } = get();

        // Panggil endpoint logout untuk blacklist token
        if (token) {
          try {
            await fetch(`${API_BASE}/auth/logout`, {
              method:  'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch {
            // Tetap hapus state meskipun request gagal
          }
        }

        // Clear zustand-persist localStorage key + any legacy keys
        localStorage.removeItem('globaltrade-auth');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        set({ token: null, user: null, error: null });
      },

      // ── Restore sesi (fetchMe) ──────────────────────────────────────────────
      fetchMe: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            // Token expired atau invalid → clear state
            set({ token: null, user: null });
            return;
          }

          const data = await res.json();
          set({ user: data.data });
        } catch {
          // Biarkan tetap logged in, akan error saat request berikutnya
        }
      },

      // ── Helpers ────────────────────────────────────────────────────────────
      clearError: () => set({ error: null }),

      isAuthenticated: () => !!get().token,

      hasRole: (...roles) => {
        const { user } = get();
        if (!user) return false;
        if (user.peran === 'admin') return true;
        return roles.includes(user.peran);
      },

      hasPermission: (resource, action) => {
        const { user } = get();
        if (!user) return false;
        if (user.peran === 'admin') return true;
        const actions = user.hak_akses?.[resource] || [];
        return actions.includes(action);
      },
    }),
    {
      name:    'globaltrade-auth',      // key di localStorage
      partialize: (state) => ({         // hanya simpan token & user (bukan isLoading/error)
        token: state.token,
        user:  state.user,
      }),
    }
  )
);

export default useAuthStore;
