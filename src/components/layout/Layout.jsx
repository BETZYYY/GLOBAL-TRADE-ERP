import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="font-body text-body text-[#d6e3ff] bg-brand-midnight-base min-h-screen flex antialiased">
      <Sidebar />
      <main className="ml-sidebar_width_collapsed flex-1 flex flex-col min-h-screen relative w-[calc(100%-56px)]">
        <Header />
        {children}
      </main>
    </div>
  );
}
