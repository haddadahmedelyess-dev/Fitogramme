'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Dumbbell, Award, Plus, Calendar,
  ArrowRight, Activity, TrendingUp, CheckCircle2, ChevronRight
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Topbar from '@/components/Topbar';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { clients, workouts, Client, WorkoutProgram } from '@/lib/api';

export default function CoachDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [clientList, setClientList] = useState<Client[]>([]);
  const [programList, setProgramList] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
      return;
    }

    async function load() {
      try {
        const [cls, progs] = await Promise.all([
          clients.list(),
          workouts.programs.list(),
        ]);
        setClientList(cls);
        setProgramList(progs);
      } catch (err) {
        console.error('Erreur coach dashboard:', err);
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
        <Topbar title="Tableau de bord Coach" subtitle="Chargement..." />
        <div className="container py-8">
          <LoadingSpinner label="Chargement de votre espace coach..." />
        </div>
      </DashboardLayout>
    );
  }

  const activeProgramsCount = programList.filter((p) => p.status === 'active').length;

  return (
    <DashboardLayout>
      <Topbar
        title={`Bienvenue, ${user?.full_name ?? 'Coach'} !`}
        subtitle="Supervisez vos athlètes, programmes d'entraînement et objectifs physiques."
      />

      <div className="container py-8 space-y-8 animate-fade-in">
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Athlètes Actifs</span>
              <span style={{ padding: '6px', borderRadius: 'var(--r-sm)', background: 'rgba(235, 94, 40, 0.15)', color: 'var(--clr-terra)' }}>
                <Users size={18} />
              </span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>{clientList.length}</p>
            <p className="text-xs text-muted mt-1">Suivis personnalisés en cours</p>
          </div>

          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Programmes Actifs</span>
              <span style={{ padding: '6px', borderRadius: 'var(--r-sm)', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                <Dumbbell size={18} />
              </span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>{activeProgramsCount}</p>
            <p className="text-xs text-muted mt-1">Sur {programList.length} créés au total</p>
          </div>

          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Assiduité Athlètes</span>
              <span style={{ padding: '6px', borderRadius: 'var(--r-sm)', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Activity size={18} />
              </span>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>92%</p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">↑ +4% cette semaine</p>
          </div>
        </div>

        {/* Clients and Programs Grids */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-6)' }}>
          {/* Athletes List */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Mes Athlètes</h2>
                <p className="text-xs text-muted">Profils et progression</p>
              </div>
              <Link href="/dashboard/coach/clients" className="btn btn-sm btn-outline">
                Voir tous ({clientList.length})
              </Link>
            </div>

            {clientList.length === 0 ? (
              <EmptyState
                icon={<Users size={32} />}
                title="Aucun athlète rattaché"
                description="Invitez ou rattachez vos clients pour suivre leurs entraînements."
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
                          background: 'linear-gradient(135deg, var(--clr-terra), var(--clr-terra-2))',
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

                    <Link
                      href="/dashboard/coach/clients"
                      className="btn btn-xs btn-outline"
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      Détails <ChevronRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Programs Overview */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Programmes Récents</h2>
                <p className="text-xs text-muted">Créations d&apos;entraînements</p>
              </div>
              <Link href="/workouts" className="btn btn-sm btn-primary">
                <Plus size={14} /> Nouveau
              </Link>
            </div>

            {programList.length === 0 ? (
              <EmptyState
                icon={<Dumbbell size={32} />}
                title="Aucun programme"
                description="Créez des routines personnalisées pour vos athlètes."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {programList.slice(0, 4).map((prog) => (
                  <div
                    key={prog.id}
                    style={{
                      padding: 'var(--sp-3) var(--sp-4)',
                      background: 'var(--clr-surface-2)',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--clr-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                          {prog.difficulty}
                        </span>
                        <span className="text-xs text-muted">{prog.duration_weeks} sem.</span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{prog.title}</p>
                    </div>

                    <Link href="/workouts" className="btn btn-xs btn-outline">
                      Gérer
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
