import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/transactions', icon: 'receipt_long', label: 'Transactions' },
    { path: '/hedging', icon: 'account_balance_wallet', label: 'Hedging' },
    { path: '/payment-terms', icon: 'payments', label: 'Payment Terms' },
    { path: '/currency-basket', icon: 'currency_exchange', label: 'Currency Basket' },
    { path: '/credit-risk', icon: 'speed', label: 'Credit Risk' },
    { path: '/crypto-settlement', icon: 'currency_bitcoin', label: 'Crypto Settlement' },
    { path: '/reports', icon: 'assessment', label: 'Reports' },
  ];

  return (
    <nav
      className="fixed left-0 top-0 h-screen border-r border-[#1E3A5F] bg-[#0A1628] flex flex-col items-center py-4 z-50 overflow-hidden"
      style={{ width: '56px', minWidth: '56px' }}
    >
      <div className="flex justify-center w-full mb-8">
        <div className="w-8 h-8 rounded-full bg-[#0891B2] flex-shrink-0 flex items-center justify-center font-h3-caps text-h3-caps text-white font-bold" title="GLOBALTRADE ERP">GT</div>
      </div>
      <div className="w-full flex flex-col space-y-2 px-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
          return (
            <Link 
              key={item.path}
              to={item.path} 
              title={item.label}
              className={`flex justify-center items-center w-full py-3 rounded ${isActive ? 'text-[#0891B2] border-l-2 border-[#0891B2] bg-[#0891B2]/10 font-bold' : 'text-on-surface-variant hover:bg-[#16243B] hover:text-white'}`}
            >
              <span className="material-symbols-outlined flex-shrink-0">{item.icon}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto px-2 w-full flex justify-center">
        <div className="flex items-center w-full justify-center py-3 rounded hover:bg-[#16243B] cursor-pointer" title="S. Miller">
          <img alt="Finance Manager Profile" className="w-8 h-8 rounded-full border border-[#1E3A5F] object-cover flex-shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANp2GXvqluu45rSOmuHB3_uwZft6WVmRI0SPFgCRi2hgvlSZbALbzmOpA5nLZDVDWM-PFI8nPyw46smLOmzZNj2ebCyxFGbgXkotv-Y-hDZTm5lPCwQniZ_CVW3-IgsSddC2-77v-xwiHjkBx7wt_0i9KlvSNP5i0ic0z1rYmULISjmtxYUNcK3EXuF8OUHhtY5-ZQNTF8JG49rU7CUCBr2w_uGKgWtnOckhG3CKoyyC7i4UgxMHb2hBLeNZmWKjoM2PugekfzePQ" />
        </div>
      </div>
    </nav>
  );
}
