import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const path = location.pathname;
  let breadcrumb = 'Dashboard';
  
  if (path.includes('transactions')) breadcrumb = 'Transactions';
  else if (path.includes('hedging')) breadcrumb = 'Hedging';
  else if (path.includes('payment-terms')) breadcrumb = 'Payment Terms';
  else if (path.includes('currency-basket')) breadcrumb = 'Currency Basket';
  else if (path.includes('credit-risk')) breadcrumb = 'Credit Risk';
  else if (path.includes('crypto-settlement')) breadcrumb = 'Crypto Settlement';
  else if (path.includes('risk-detail')) breadcrumb = 'Risk Detail';
  else if (path.includes('reports')) breadcrumb = 'Reports';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 fixed top-0 right-0 border-b border-[#1E3A5F] bg-[#16243B] flex justify-between items-center px-gutter z-40" style={{ left: '56px', width: 'calc(100% - 56px)' }}>
      <div className="flex items-center">
        <span className="font-body text-body">
          <span className="text-[#475569]">Dashboard</span>
          <span className="text-[#475569]"> / </span>
          <span className="text-[#F8FAFC] font-medium">{breadcrumb}</span>
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-on-surface-variant hover:text-[#0891B2] transition-colors cursor-pointer active:opacity-80 p-2 rounded-full hover:bg-[#0F1B2D]">
          <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
        </button>
        <div className="flex items-center gap-3 ml-4">
          {/* Role Badge */}
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#0891B2]/20 text-[#06B6D4] border border-[#0891B2]/30 uppercase tracking-wider">
            {user?.peran?.replace('_', ' ') || 'User'}
          </span>

          {/* Avatar with dropdown */}
          <div className="relative avatar-menu" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-[#0891B2]/30 flex items-center justify-center text-sm font-bold text-white hover:bg-[#0891B2]/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0891B2]/50"
              title="Account menu"
            >
              {user?.nama_lengkap?.charAt(0)?.toUpperCase() || 'U'}
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-52 bg-[#1E2D44] border border-[#1E3A5F] rounded-xl shadow-2xl z-50 overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-[#1E3A5F]">
                  <p className="text-sm font-semibold text-[#F8FAFC] truncate">
                    {user?.nama_lengkap || 'User'}
                  </p>
                  <p className="text-xs text-[#94A3B8] truncate mt-0.5">
                    {user?.email || ''}
                  </p>
                </div>

                {/* Menu actions */}
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-[#DC2626] hover:bg-[#DC2626]/10 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}