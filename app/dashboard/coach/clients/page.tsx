'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Dumbbell, UtensilsCrossed, CheckCircle2,
  Calendar, Mail, Award, ChevronRight, ArrowLeft
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Topbar from '@/components/Topbar';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { clients, workouts, Client, MealLog, WorkoutProgram } from '@/lib/api';

export default function CoachClientsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [clientList, setClientList] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientMeals, setClientMeals] = useState<MealLog[]>([]);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignedProgramId, setAssignedProgramId] = useState('');

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
        setPrograms(progs);
        if (cls.length > 0) {
          selectClient(cls[0]);
        }
      } catch (err) {
        console.error('Erreur chargement clients:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      load();
    }
  }, [user, authLoading, router]);

  async function selectClient(client: Client) {
    setSelectedClient(client);
    setLoadingMeals(true);
    try {
      const mealsData = await clients.meals(client.id);
      setClientMeals(mealsData);
    } catch (err) {
      console.error('Erreur chargement repas client:', err);
    } finally {
      setLoadingMeals(false);
    }
  }

  async function handleAssignProgram() {
    if (!selectedClient || !assignedProgramId) return;
    setAssigning(true);
    try {
      await workouts.programs.assign(assignedProgramId, selectedClient.id);
      alert(`Programme assigné avec succès à ${selectedClient.full_name} !`);
    } catch {
      alert('Erreur lors de l\'assignation du programme.');
    } finally {
      setAssigning(false);
    }
  }

  return (
    <DashboardLayout>
      <Topbar
        title="Gestion & Suivi des Athlètes"
        subtitle="Consultez l'historique nutritionnel de vos clients et assignez leurs programmes sportifs."
      />

      <div className="container py-8 space-y-8 animate-fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-6)' }}>
          {/* Client List */}
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>
              Athlètes ({clientList.length})
            </h2>

            {loading ? (
              <LoadingSpinner label="Chargement des athlètes..." />
            ) : clientList.length === 0 ? (
              <EmptyState
                icon={<Users size={32} />}
                title="Aucun athlète"
                description="Vous n'avez pas encore d'athlète assigné."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {clientList.map((client) => {
                  const isSelected = selectedClient?.id === client.id;
                  return (
                    <button
                      key={client.id}
                      onClick={() => selectClient(client)}
                      style={{
                        padding: 'var(--sp-3) var(--sp-4)',
                        borderRadius: 'var(--r-md)',
                        textAlign: 'left',
                        background: isSelected ? 'var(--clr-surface-3)' : 'var(--clr-surface-2)',
                        border: isSelected ? '1px solid var(--clr-terra)' : '1px solid var(--clr-border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: isSelected ? 'var(--clr-terra)' : 'var(--clr-surface-1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            color: '#fff',
                          }}
                        >
                          {client.full_name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: isSelected ? 'var(--clr-terra-2)' : 'var(--clr-text)' }}>
                            {client.full_name}
                          </p>
                          <p className="text-xs text-muted">{client.email}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Client Detail & Meals */}
          <div className="card" style={{ padding: 'var(--sp-6)', gridColumn: 'span 2' }}>
            {selectedClient ? (
              <div>
                {/* Profile Header */}
                <div style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {selectedClient.full_name}
                      </h2>
                      <p className="text-xs text-muted flex items-center gap-2 mt-1">
                        <Mail size={13} /> {selectedClient.email} • Membre depuis {new Date(selectedClient.joined_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className="badge badge-primary">Athlète Actif</span>
                  </div>

                  <div style={{ background: 'var(--clr-surface-2)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--r-md)', marginTop: 'var(--sp-3)' }}>
                    <p className="text-xs text-muted uppercase font-semibold">Objectif sportif déclaré :</p>
                    <p className="text-sm font-medium mt-1">{selectedClient.goal ?? 'Non spécifié'}</p>
                  </div>

                  {/* Assign Program Widget */}
                  <div style={{ marginTop: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                    <select
                      className="form-select text-sm"
                      style={{ maxWidth: 320 }}
                      value={assignedProgramId}
                      onChange={(e) => setAssignedProgramId(e.target.value)}
                    >
                      <option value="">Sélectionner un programme à assigner...</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.duration_weeks} sem.)
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleAssignProgram}
                      disabled={assigning || !assignedProgramId}
                    >
                      {assigning ? 'Assignation…' : 'Assigner'}
                    </button>
                  </div>
                </div>

                {/* Athlete's Recent Nutrition Log */}
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <UtensilsCrossed size={18} className="text-amber-400" />
                  Journal alimentaire de l&apos;athlète (Derja & Français)
                </h3>

                {loadingMeals ? (
                  <LoadingSpinner label="Chargement du journal..." />
                ) : clientMeals.length === 0 ? (
                  <EmptyState
                    icon={<UtensilsCrossed size={32} />}
                    title="Aucun repas enregistré"
                    description="Cet athlète n'a pas encore enregistré de repas récents."
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                    {clientMeals.map((meal) => (
                      <div
                        key={meal.id}
                        style={{
                          padding: 'var(--sp-4)',
                          background: 'var(--clr-surface-2)',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid var(--clr-border)',
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="badge badge-secondary" style={{ fontSize: '0.6875rem', textTransform: 'capitalize' }}>
                              {meal.meal_type}
                            </span>
                            <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginTop: 'var(--sp-1)' }}>
                              {meal.text_original}
                            </p>
                            {meal.text_normalized && (
                              <p className="text-xs text-muted">{meal.text_normalized}</p>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 700, color: 'var(--clr-terra)', fontSize: '0.9375rem' }}>
                              {meal.ai_estimate?.calories ?? 0} kcal
                            </span>
                            <p className="text-xs text-muted">
                              P: {meal.ai_estimate?.protein_g ?? 0}g | G: {meal.ai_estimate?.carbs_g ?? 0}g | L: {meal.ai_estimate?.fat_g ?? 0}g
                            </p>
                          </div>
                        </div>

                        {meal.ai_estimate?.disclaimer && (
                          <div className="text-xs text-muted pt-2 border-t border-border flex items-center justify-between">
                            <span>Remarque IA: {meal.ai_estimate.disclaimer}</span>
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                              {meal.ai_estimate.confidence}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Users size={36} />}
                title="Sélectionnez un athlète"
                description="Choisissez un athlète dans la colonne de gauche pour voir ses détails."
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
