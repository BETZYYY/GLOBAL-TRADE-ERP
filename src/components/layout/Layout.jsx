import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="font-body text-body text-[#d6e3ff] bg-[#0F1B2D] min-h-screen flex antialiased">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen relative" style={{ marginLeft: '56px', width: 'calc(100% - 56px)' }}>
        <Header />
        {children || <Outlet />}
      </main>
    </div>
  );
}
