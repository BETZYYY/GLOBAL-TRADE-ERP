import React from 'react';

export default function Header() {
  return (
    <header className="h-14 fixed top-0 right-0 left-sidebar_width_collapsed w-[calc(100%-56px)] border-b border-outline-variant dark:border-outline-variant bg-surface-container dark:bg-surface-container flex justify-between items-center px-gutter z-40">
      <div className="flex items-center">
        <span className="font-body text-body text-on-surface-variant">Transactions / <span className="text-primary font-semibold">Payment Transactions</span></span>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-80 p-2 rounded-full hover:bg-surface-variant/50">
          <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
        </button>
      </div>
    </header>
  );
}