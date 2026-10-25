'use client';

import { Bell, Search } from 'lucide-react';
import Link from 'next/link';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="topbar" role="banner">
      {/* Left: hamburger (rendered by Sidebar) + title */}
      <div className="flex items-center gap-4">
        {/* The hamburger button is rendered by <Sidebar> and floated here via CSS */}
        <div id="sidebar-toggle-slot" aria-hidden="true" />
        <div>
          <h1 className="topbar-title">{title}</h1>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="topbar-actions">
        <Link
          href="/notifications"
          className="btn btn-ghost"
          aria-label="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={20} />
          {/* Unread dot – wired to real data in the notifications page */}
          <span
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--clr-terra)',
              border: '2px solid #fff',
            }}
            aria-label="Nouvelles notifications"
          />
        </Link>
      </div>
    </header>
  );
}
