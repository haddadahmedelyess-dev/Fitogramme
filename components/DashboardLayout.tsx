'use client';

import { type ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        {children}
      </main>
    </div>
  );
}
