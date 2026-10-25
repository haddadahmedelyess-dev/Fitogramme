'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList, Users, Apple, HeartPulse,
  TrendingUp, Plus, ChevronRight, AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Topbar from '@/components/Topbar';
import { LoadingSpinner, EmptyState, AiDisclaimer } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { mealPlans, clients, MealPlan, Client } from '@/lib/api';

export default function NutritionistDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [clientList, setClientList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
      return;
    }

    async function load() {
      try {
        const [plansData, clientsData] = await Promise.all([
          mealPlans.list(),
          clients.list(),
        ]);
        setPlans(plansData);
        setClientList(clientsData);
      } catch (err) {
        console.error('Erreur nutritionist dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      load();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <Topbar title="Espace Nutritionniste" subtitle="Chargement..." />
        <div className="container py-8">
          <LoadingSpinner label="Chargement de vos dossiers nutritionnels..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Topbar
        title={`Cabinet de ${user?.full_name ?? 'Dr. Nutrition'}`}
        subtitle="Suivi diététique spécialisé, équilibre des macronutriments et plans nutritionnels adaptés."
      />

      <div className="container py-8 space-y-8 animate-fade-in">
        {/* Advisory */}
        <AiDisclaimer confidence="high" />

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Patients Suivis</span>
              <span style={{ padding: '6px', borderRadius: 'var(--r-sm)', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Users size={18} />
              </span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>{clientList.length}</p>
            <p className="text-xs text-muted mt-1">Dossiers diététiques actifs</p>
          </div>

          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Plans Alimentaires</span>
              <span style={{ padding: '6px', borderRadius: 'var(--r-sm)', background: 'rgba(235, 94, 40, 0.15)', color: 'var(--clr-terra)' }}>
                <ClipboardList size={18} />
              </span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>{plans.length}</p>
            <p className="text-xs text-muted mt-1">Élaborés &amp; personnalisés</p>
          </div>

          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Conformité Diète</span>
              <span style={{ padding: '6px', borderRadius: 'var(--r-sm)', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                <HeartPulse size={18} />
              </span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>88%</p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">Bonne adhérence aux cibles</p>
          </div>
        </div>

        {/* Dual Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-6)' }}>
          {/* Active Plans */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Plans Nutritionnels</h2>
                <p className="text-xs text-muted">Semaines en cours</p>
              </div>
              <Link href="/dashboard/nutritionist/plans" className="btn btn-sm btn-primary">
                <Plus size={14} /> Nouveau Plan
              </Link>
            </div>

            {plans.length === 0 ? (
              <EmptyState
                icon={<ClipboardList size={32} />}
                title="Aucun plan actif"
                description="Concevez des plans alimentaires avec menus tunisiens sains."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {plans.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: 'var(--sp-4)',
                      background: 'var(--clr-surface-2)',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--clr-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                        Plan Semaine du {p.week_start}
                      </p>
                      <p className="text-xs text-muted">
                        {p.days.length} jours configurés • Plats tunisiens équilibrés
                      </p>
                    </div>

                    <Link href="/dashboard/nutritionist/plans" className="btn btn-xs btn-outline">
                      Ouvrir
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patients Monitoring */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Patients Récents</h2>
                <p className="text-xs text-muted">Suivi des habitudes alimentaires</p>
              </div>
              <Link href="/dashboard/nutritionist/clients" className="btn btn-sm btn-outline">
                Voir tous
              </Link>
            </div>

            {clientList.length === 0 ? (
              <EmptyState
                icon={<Users size={32} />}
                title="Aucun patient"
                description="Vos patients apparaîtront ici dès leur inscription."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {clientList.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--sp-3) var(--sp-4)',
                      background: 'var(--clr-surface-2)',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--clr-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: '#fff',
                        }}
                      >
                        {c.full_name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{c.full_name}</p>
                        <p className="text-xs text-muted">{c.goal ?? c.email}</p>
                      </div>
                    </div>

                    <Link href="/dashboard/nutritionist/clients" className="btn btn-xs btn-outline">
                      Dossier
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
