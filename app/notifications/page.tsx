'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, CheckCheck, Dumbbell, UtensilsCrossed,
  Info, MessageSquare, CheckCircle2
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Topbar from '@/components/Topbar';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { notifications, Notification } from '@/lib/api';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [notifList, setNotifList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
      return;
    }

    loadNotifs();
  }, [user, authLoading, router]);

  async function loadNotifs() {
    try {
      const data = await notifications.list();
      setNotifList(data);
    } catch (err) {
      console.error('Erreur notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await notifications.markRead(id);
      setNotifList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await notifications.markAllRead();
      setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  }

  const unreadCount = notifList.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <Topbar
        title="Centre de Notifications"
        subtitle="Mises à jour sur vos repas, programmes d'entraînement et messages de vos professionnels."
      />

      <div className="container py-8 space-y-6 animate-fade-in" style={{ maxWidth: 840 }}>
        <div className="flex justify-between items-center">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Vos alertes {unreadCount > 0 && <span className="badge badge-primary">{unreadCount} non lues</span>}
            </h2>
          </div>
          {unreadCount > 0 && (
            <button
              className="btn btn-outline btn-sm flex items-center gap-2"
              onClick={handleMarkAllRead}
            >
              <CheckCheck size={16} /> Tout marquer comme lu
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label="Chargement des notifications..." />
        ) : notifList.length === 0 ? (
          <EmptyState
            icon={<Bell size={36} />}
            title="Aucune notification"
            description="Vous êtes à jour ! Aucune nouvelle notification pour le moment."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {notifList.map((notif) => {
              const Icon =
                notif.type === 'workout'
                  ? Dumbbell
                  : notif.type === 'meal'
                  ? UtensilsCrossed
                  : notif.type === 'message'
                  ? MessageSquare
                  : Info;

              return (
                <div
                  key={notif.id}
                  style={{
                    padding: 'var(--sp-4)',
                    background: notif.read ? 'var(--clr-surface-2)' : 'var(--clr-surface-3)',
                    borderRadius: 'var(--r-md)',
                    border: notif.read ? '1px solid var(--clr-border)' : '1px solid var(--clr-terra)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--sp-4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--r-sm)',
                      background: notif.read ? 'var(--clr-surface-1)' : 'rgba(235, 94, 40, 0.2)',
                      color: notif.read ? 'var(--clr-muted)' : 'var(--clr-terra)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div className="flex justify-between items-center mb-1">
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: notif.read ? 'var(--clr-text)' : '#fff' }}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-muted">
                        {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted" style={{ lineHeight: 1.5 }}>
                      {notif.body}
                    </p>
                  </div>

                  {!notif.read && (
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => handleMarkRead(notif.id)}
                      title="Marquer comme lu"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
