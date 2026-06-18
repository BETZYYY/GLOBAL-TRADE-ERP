import React from 'react';

export default function Sidebar() {
  return (
    <nav className="w-sidebar_width_collapsed hover:w-sidebar_width_expanded transition-all duration-300 h-screen fixed left-0 top-0 border-r border-outline-variant dark:border-outline-variant bg-surface-container-low flex flex-col items-center py-4 z-50 group overflow-hidden">
      <div className="flex items-center w-full px-4 mb-8">
        <div className="w-8 h-8 rounded-full bg-brand-teal flex-shrink-0 flex items-center justify-center font-h3-caps text-h3-caps text-white font-bold">GT</div>
        <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          <div className="font-h1 text-h1 text-primary dark:text-primary tracking-tighter">GLOBALTRADE</div>
          <div className="font-label-xs text-label-xs text-on-surface-variant">ERP</div>
        </div>
      </div>
      <div className="w-full flex flex-col space-y-2 px-2">
        <a className="flex items-center w-full px-2 py-3 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-highest hover:text-primary transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined flex-shrink-0" data-icon="dashboard">dashboard</span>
          <span className="ml-4 font-label-xs text-label-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Dashboard</span>
        </a>
        <a className="flex items-center w-full px-2 py-3 rounded text-secondary dark:text-secondary border-l-2 border-secondary font-bold bg-secondary-container/10 transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined flex-shrink-0" data-icon="receipt_long">receipt_long</span>
          <span className="ml-4 font-label-xs text-label-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Transactions</span>
        </a>
        <a className="flex items-center w-full px-2 py-3 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-highest hover:text-primary transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined flex-shrink-0" data-icon="account_balance_wallet">account_balance_wallet</span>
          <span className="ml-4 font-label-xs text-label-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Hedging</span>
        </a>
        <a className="flex items-center w-full px-2 py-3 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-highest hover:text-primary transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined flex-shrink-0" data-icon="payments">payments</span>
          <span className="ml-4 font-label-xs text-label-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Payment Terms</span>
        </a>
        <a className="flex items-center w-full px-2 py-3 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-highest hover:text-primary transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined flex-shrink-0" data-icon="currency_exchange">currency_exchange</span>
          <span className="ml-4 font-label-xs text-label-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Currency Basket</span>
        </a>
        <a className="flex items-center w-full px-2 py-3 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-highest hover:text-primary transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined flex-shrink-0" data-icon="speed">speed</span>
          <span className="ml-4 font-label-xs text-label-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Credit Risk</span>
        </a>
        <a className="flex items-center w-full px-2 py-3 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-highest hover:text-primary transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined flex-shrink-0" data-icon="currency_bitcoin">currency_bitcoin</span>
          <span className="ml-4 font-label-xs text-label-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Crypto Settlement</span>
        </a>
        <a className="flex items-center w-full px-2 py-3 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-highest hover:text-primary transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined flex-shrink-0" data-icon="assessment">assessment</span>
          <span className="ml-4 font-label-xs text-label-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Reports</span>
        </a>
      </div>
      <div className="mt-auto px-2 w-full">
        <a className="flex items-center w-full px-2 py-3 rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container-highest hover:text-primary transition-all duration-200 ease-in-out" href="#">
          <img alt="Finance Manager Profile" className="w-8 h-8 rounded-full border border-outline-variant object-cover flex-shrink-0" data-alt="A sleek, modern corporate portrait of a financial risk manager in low-key studio lighting with teal rim light, conveying institutional authority and precision." src="https://lh3.googleusercontent.com/aida-public/AB6AXuANp2GXvqluu45rSOmuHB3_uwZft6WVmRI0SPFgCRi2hgvlSZbALbzmOpA5nLZDVDWM-PFI8nPyw46smLOmzZNj2ebCyxFGbgXkotv-Y-hDZTm5lPCwQniZ_CVW3-IgsSddC2-77v-xwiHjkBx7wt_0i9KlvSNP5i0ic0z1rYmULISjmtxYUNcK3EXuF8OUHhtY5-ZQNTF8JG49rU7CUCBr2w_uGKgWtnOckhG3CKoyyC7i4UgxMHb2hBLeNZmWKjoM2PugekfzePQ" />
          <span className="ml-4 font-label-xs text-label-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">S. Miller</span>
        </a>
      </div>
    </nav>
  );
}
