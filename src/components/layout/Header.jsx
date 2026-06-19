import React from 'react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function Header() {
  const location = useLocation();
  const { user } = useAuthStore();
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
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#0891B2]/30 flex items-center justify-center text-sm font-bold text-white">
            {user?.nama_lengkap?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}