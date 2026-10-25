'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, UtensilsCrossed, Dumbbell, Users, ClipboardList,
  Bell, Settings, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// ── Nav items per role ─────────────────────────────────────────────────────────

const clientNav = [
  { label: 'Tableau de bord', href: '/dashboard/client', icon: LayoutDashboard },
  { label: 'Journal repas', href: '/log-meal', icon: UtensilsCrossed },
  { label: 'Entraînements', href: '/workouts', icon: Dumbbell },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Profil', href: '/profile', icon: Settings },
];

const coachNav = [
  { label: 'Tableau de bord', href: '/dashboard/coach', icon: LayoutDashboard },
  { label: 'Mes clients', href: '/dashboard/coach/clients', icon: Users },
  { label: 'Programmes', href: '/workouts', icon: Dumbbell },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Profil', href: '/profile', icon: Settings },
];

const nutritionistNav = [
  { label: 'Tableau de bord', href: '/dashboard/nutritionist', icon: LayoutDashboard },
  { label: 'Plans alimentaires', href: '/dashboard/nutritionist/plans', icon: ClipboardList },
  { label: 'Mes clients', href: '/dashboard/nutritionist/clients', icon: Users },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Profil', href: '/profile', icon: Settings },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const navItems =
    user?.role === 'coach'
      ? coachNav
      : user?.role === 'nutritionist'
      ? nutritionistNav
      : clientNav;

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Trap focus inside sidebar on mobile when open
  useEffect(() => {
    if (open) {
      sidebarRef.current?.focus();
    }
  }, [open]);

  // Close on Escape
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') setOpen(false);
  };

  const roleLabel =
    user?.role === 'coach'
      ? 'Coach Sportif'
      : user?.role === 'nutritionist'
      ? 'Nutritionniste'
      : 'Client';

  return (
    <>
      {/* Mobile hamburger — lives in topbar, rendered here as a portal-like button */}
      <button
        id="sidebar-toggle"
        className="hamburger"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="app-sidebar"
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        ref={sidebarRef}
        className={`sidebar${open ? ' open' : ''}`}
        role="navigation"
        aria-label="Navigation principale"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark" aria-hidden="true">FG</div>
          <div>
            <div className="sidebar-app-name">FitoGramme</div>
            <div className="sidebar-app-tagline">Coach &amp; Nutrition</div>
          </div>
          {/* Close btn for mobile */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Menu principal">
          <p className="nav-section-label">Menu</p>
          <ul>
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`nav-item${active ? ' active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                    {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-md avatar-terra" aria-hidden="true">
              {getInitials(user?.full_name ?? 'U')}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar-user-name truncate">{user?.full_name}</div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={logout}
              aria-label="Se déconnecter"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
