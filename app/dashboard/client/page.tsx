'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UtensilsCrossed, Dumbbell, Flame, Plus,
  TrendingUp, Calendar, ChevronRight, Sparkles, CheckCircle2
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Topbar from '@/components/Topbar';
import { EmptyState, LoadingSpinner, AiDisclaimer } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { meals, workouts, MealLog, WorkoutProgram } from '@/lib/api';

export default function ClientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mealList, setMealList] = useState<MealLog[]>([]);
  const [activeProgram, setActiveProgram] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
      return;
    }

    async function loadData() {
      try {
        const [mealsData, programsData] = await Promise.all([
          meals.list({ limit: 10 }),
          workouts.programs.list(),
        ]);
        setMealList(mealsData);
        const active = programsData.find((p) => p.status === 'active') ?? programsData[0] ?? null;
        setActiveProgram(active);
      } catch (err) {
        console.error('Erreur chargement dashboard client:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <Topbar title="Tableau de bord" subtitle="Chargement de vos données..." />
        <div className="container py-8">
          <LoadingSpinner label="Chargement de votre journée..." />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate daily totals
  const totalCalories = mealList.reduce((acc, m) => acc + (m.ai_estimate?.calories ?? 0), 0);
  const totalProtein = mealList.reduce((acc, m) => acc + (m.ai_estimate?.protein_g ?? 0), 0);
  const totalCarbs = mealList.reduce((acc, m) => acc + (m.ai_estimate?.carbs_g ?? 0), 0);
  const totalFat = mealList.reduce((acc, m) => acc + (m.ai_estimate?.fat_g ?? 0), 0);

  const calorieTarget = 2200;
  const calPercent = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));

  return (
    <DashboardLayout>
      <Topbar
        title={`Marhba, ${user?.full_name?.split(' ')[0] ?? 'Athlète'} !`}
        subtitle="Suivi de vos repas tunisiens, objectifs et entraînement du jour."
      />

      <div className="container py-8 space-y-8 animate-fade-in">
        {/* AI Disclaimer Banner */}
        <AiDisclaimer confidence="medium" />

        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-4)' }}>
          {/* Calorie Card */}
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Calories du jour</span>
              <span style={{ padding: '6px', borderRadius: 'var(--r-sm)', background: 'rgba(235, 94, 40, 0.15)', color: 'var(--clr-terra)' }}>
                <Flame size={18} />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span style={{ fontSize: '2rem', fontWeight: 700 }}>{totalCalories}</span>
              <span className="text-muted text-sm">/ {calorieTarget} kcal</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 8, background: 'var(--clr-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${calPercent}%`,
                  background: 'linear-gradient(90deg, var(--clr-terra), var(--clr-terra-2))',
                  borderRadius: 99,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <p className="text-xs text-muted mt-2">{calPercent}% de votre cible journalière</p>
          </div>

          {/* Macros Card */}
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Macronutriments</span>
              <span style={{ padding: '6px', borderRadius: 'var(--r-sm)', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <TrendingUp size={18} />
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-2)', textAlign: 'center' }}>
              <div style={{ background: 'var(--clr-surface-2)', padding: 'var(--sp-2)', borderRadius: 'var(--r-sm)' }}>
                <p className="text-xs text-muted">Protéines</p>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#38bdf8' }}>{totalProtein}g</p>
                <p className="text-xs text-muted">Cible: 140g</p>
              </div>
              <div style={{ background: 'var(--clr-surface-2)', padding: 'var(--sp-2)', borderRadius: 'var(--r-sm)' }}>
                <p className="text-xs text-muted">Glucides</p>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fbbf24' }}>{totalCarbs}g</p>
                <p className="text-xs text-muted">Cible: 220g</p>
              </div>
              <div style={{ background: 'var(--clr-surface-2)', padding: 'var(--sp-2)', borderRadius: 'var(--r-sm)' }}>
                <p className="text-xs text-muted">Lipides</p>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f87171' }}>{totalFat}g</p>
                <p className="text-xs text-muted">Cible: 70g</p>
              </div>
            </div>
          </div>

          {/* Quick Log Action */}
          <div className="card" style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, var(--clr-surface), var(--clr-surface-2))', border: '1px solid var(--clr-border)' }}>
            <div>
              <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--clr-terra)' }}>
                <Sparkles size={18} />
                <span className="text-xs font-semibold uppercase tracking-wider">Journal Rapide</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--sp-1)' }}>
                Qu&apos;avez-vous mangé ?
              </h3>
              <p className="text-xs text-muted">
                Écrivez en darija tunisienne (ex: <em>&quot;Klit bsisa b zit zitouna&quot;</em>) ou en français.
              </p>
            </div>
            <Link
              href="/log-meal"
              className="btn btn-primary btn-sm"
              style={{ marginTop: 'var(--sp-4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)' }}
            >
              <Plus size={16} /> Enregistrer un repas
            </Link>
          </div>
        </div>

        {/* Main Grid: Meals of Today & Workouts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-6)' }}>
          {/* Recent Meals Section */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Repas enregistrés aujourd&apos;hui</h2>
                <p className="text-xs text-muted">Estimations IA ajustables et historique</p>
              </div>
              <Link href="/log-meal" className="btn btn-sm btn-outline">
                Voir tout
              </Link>
            </div>

            {mealList.length === 0 ? (
              <EmptyState
                icon={<UtensilsCrossed size={36} />}
                title="Aucun repas enregistré aujourd'hui"
                description="Commencez votre journée en enregistrant votre petit-déjeuner en darija ou en français."
                action={
                  <Link href="/log-meal" className="btn btn-primary btn-sm mt-3">
                    Ajouter un repas
                  </Link>
                }
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {mealList.slice(0, 5).map((meal) => (
                  <div
                    key={meal.id}
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
                      <span
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 'var(--r-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(235, 94, 40, 0.1)',
                          color: 'var(--clr-terra)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}
                      >
                        {meal.meal_type === 'breakfast' ? 'PD' : meal.meal_type === 'lunch' ? 'DJ' : meal.meal_type === 'dinner' ? 'DN' : 'SN'}
                      </span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{meal.text_original}</p>
                        <p className="text-xs text-muted">
                          {meal.text_normalized && meal.text_normalized !== meal.text_original ? `${meal.text_normalized} • ` : ''}
                          {new Date(meal.logged_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--clr-terra)' }}>
                        {meal.ai_estimate?.calories ?? 0} kcal
                      </p>
                      <p className="text-xs text-muted">
                        P: {meal.ai_estimate?.protein_g ?? 0}g | G: {meal.ai_estimate?.carbs_g ?? 0}g | L: {meal.ai_estimate?.fat_g ?? 0}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workout & Coaching Section */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Programme Sportif</h2>
                <p className="text-xs text-muted">Suivi personnalisé par votre coach</p>
              </div>
              <Link href="/workouts" className="btn btn-sm btn-outline">
                Voir séances
              </Link>
            </div>

            {activeProgram ? (
              <div>
                <div
                  style={{
                    padding: 'var(--sp-4)',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--clr-surface-2)',
                    border: '1px solid var(--clr-border)',
                    marginBottom: 'var(--sp-4)',
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge badge-primary">{activeProgram.difficulty}</span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar size={13} /> {activeProgram.duration_weeks} semaines
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
                    {activeProgram.title}
                  </h3>
                  <p className="text-sm text-muted" style={{ lineHeight: 1.5, marginBottom: 'var(--sp-4)' }}>
                    {activeProgram.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted pt-3" style={{ borderTop: '1px solid var(--clr-border)' }}>
                    <span>Fréquence : {activeProgram.sessions_per_week} séances / semaine</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 size={14} /> En cours
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--clr-border)' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ padding: 8, borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Prochaine séance : Haut du corps</p>
                      <p className="text-xs text-muted">Développé couché, tractions, développé militaire</p>
                    </div>
                  </div>
                  <Link href="/workouts" className="btn btn-xs btn-outline">
                    Démarrer
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Dumbbell size={36} />}
                title="Aucun programme assigné"
                description="Votre coach sportif n'a pas encore assigné de programme d'entraînement actif."
                action={
                  <Link href="/workouts" className="btn btn-outline btn-sm mt-3">
                    Explorer les programmes
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
