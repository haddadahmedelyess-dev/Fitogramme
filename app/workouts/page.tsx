'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dumbbell, Plus, Calendar, Clock, CheckCircle2,
  ChevronRight, Award, UserCheck, Play, ArrowLeft, Filter
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Topbar from '@/components/Topbar';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { workouts, clients, WorkoutProgram, WorkoutSession, Client } from '@/lib/api';

export default function WorkoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [programList, setProgramList] = useState<WorkoutProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Coach creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clientList, setClientList] = useState<Client[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [newWeeks, setNewWeeks] = useState(4);
  const [newSessionsPerWeek, setNewSessionsPerWeek] = useState(3);
  const [creating, setCreating] = useState(false);

  // Completed exercises tracking in demo session
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
      return;
    }

    async function load() {
      try {
        const progs = await workouts.programs.list();
        setProgramList(progs);
        if (progs.length > 0) {
          selectProgram(progs[0]);
        }
        if (user?.role === 'coach') {
          const cls = await clients.list();
          setClientList(cls);
        }
      } catch (err) {
        console.error('Erreur chargement workouts:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      load();
    }
  }, [user, authLoading, router]);

  async function selectProgram(prog: WorkoutProgram) {
    setSelectedProgram(prog);
    setLoadingSessions(true);
    try {
      const sess = await workouts.sessions.list(prog.id);
      setSessions(sess);
    } catch (err) {
      console.error('Erreur sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function handleCreateProgram(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);

    try {
      const created = await workouts.programs.create({
        title: newTitle,
        description: newDesc,
        coach_id: user?.id ?? 'coach-1',
        difficulty: newDifficulty,
        duration_weeks: Number(newWeeks),
        sessions_per_week: Number(newSessionsPerWeek),
        status: 'active',
      });

      setProgramList([created, ...programList]);
      selectProgram(created);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
    } catch (err) {
      alert('Erreur lors de la création du programme.');
    } finally {
      setCreating(false);
    }
  }

  const toggleExercise = (exId: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exId]: !prev[exId],
    }));
  };

  const isCoach = user?.role === 'coach';

  return (
    <DashboardLayout>
      <Topbar
        title={isCoach ? 'Gestion des Programmes Sportifs' : 'Mes Entraînements & Séances'}
        subtitle={
          isCoach
            ? 'Concevez, assignez et suivez les plans d\'entraînement pour vos athlètes.'
            : 'Consultez les séances planifiées par votre coach et cochez vos séries effectuées.'
        }
      />

      <div className="container py-8 space-y-8 animate-fade-in">
        {/* Action Bar for Coach */}
        {isCoach && (
          <div className="flex justify-between items-center bg-surface-2 p-4 rounded-xl border border-border">
            <div>
              <p className="font-semibold text-white">Espace Création Coach</p>
              <p className="text-xs text-muted">Créez un nouveau bloc de progression adapté à vos clients.</p>
            </div>
            <button
              className="btn btn-primary btn-sm flex items-center gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> Nouveau Programme
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-6)' }}>
          {/* Programs Sidebar List */}
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>
              Programmes disponibles
            </h2>

            {loading ? (
              <LoadingSpinner label="Chargement des programmes..." />
            ) : programList.length === 0 ? (
              <EmptyState
                icon={<Dumbbell size={32} />}
                title="Aucun programme"
                description={isCoach ? "Créez votre premier programme sportif." : "Aucun programme n'a encore été créé."}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {programList.map((prog) => {
                  const isSelected = selectedProgram?.id === prog.id;
                  return (
                    <button
                      key={prog.id}
                      onClick={() => selectProgram(prog)}
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
                      <div className="flex justify-between items-center mb-1">
                        <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                          {prog.difficulty}
                        </span>
                        <span className="text-xs text-muted">{prog.duration_weeks} sem.</span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: isSelected ? 'var(--clr-terra-2)' : 'var(--clr-text)' }}>
                        {prog.title}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {prog.sessions_per_week} séances / semaine
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Program Details & Sessions */}
          <div className="card" style={{ padding: 'var(--sp-6)', gridColumn: 'span 2' }}>
            {selectedProgram ? (
              <div>
                {/* Header */}
                <div style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>
                      Niveau {selectedProgram.difficulty}
                    </span>
                    <span className="badge badge-primary">Statut: {selectedProgram.status}</span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
                    {selectedProgram.title}
                  </h2>
                  <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
                    {selectedProgram.description}
                  </p>
                  <div className="flex gap-6 mt-4 text-xs text-muted">
                    <span>Durée totale : <strong>{selectedProgram.duration_weeks} semaines</strong></span>
                    <span>Fréquence : <strong>{selectedProgram.sessions_per_week} séances / semaine</strong></span>
                  </div>
                </div>

                {/* Sessions list */}
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>
                  Séances d&apos;entraînement
                </h3>

                {loadingSessions ? (
                  <LoadingSpinner label="Chargement des séances..." />
                ) : sessions.length === 0 ? (
                  <EmptyState
                    icon={<Calendar size={32} />}
                    title="Aucune séance détaillée"
                    description="Les exercices pour ce programme apparaîtront ici."
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        style={{
                          background: 'var(--clr-surface-2)',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid var(--clr-border)',
                          padding: 'var(--sp-5)',
                        }}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <span className="text-xs font-semibold text-muted uppercase">
                              Semaine {sess.week} • Jour {sess.day}
                            </span>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '2px' }}>
                              {sess.title}
                            </h4>
                          </div>
                          <span className="badge badge-secondary">{sess.exercises.length} exercices</span>
                        </div>

                        {/* Exercise Table */}
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--clr-border)', color: 'var(--clr-muted)', textAlign: 'left' }}>
                                <th style={{ padding: '8px 12px' }}>Statut</th>
                                <th style={{ padding: '8px 12px' }}>Exercice</th>
                                <th style={{ padding: '8px 12px' }}>Séries</th>
                                <th style={{ padding: '8px 12px' }}>Répétitions</th>
                                <th style={{ padding: '8px 12px' }}>Repos</th>
                                <th style={{ padding: '8px 12px' }}>Consignes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sess.exercises.map((ex) => {
                                const isDone = !!completedExercises[ex.id];
                                return (
                                  <tr
                                    key={ex.id}
                                    style={{
                                      borderBottom: '1px solid var(--clr-border)',
                                      background: isDone ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                                    }}
                                  >
                                    <td style={{ padding: '10px 12px' }}>
                                      <button
                                        type="button"
                                        onClick={() => toggleExercise(ex.id)}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          color: isDone ? '#22c55e' : 'var(--clr-muted)',
                                        }}
                                        title={isDone ? 'Marquer non fait' : 'Marquer comme validé'}
                                      >
                                        <CheckCircle2 size={18} />
                                      </button>
                                    </td>
                                    <td style={{ padding: '10px 12px', fontWeight: 600, color: isDone ? 'var(--clr-muted)' : 'var(--clr-text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                                      {ex.name}
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>{ex.sets}</td>
                                    <td style={{ padding: '10px 12px' }}>{ex.reps ?? '-'}</td>
                                    <td style={{ padding: '10px 12px' }}>{ex.rest_sec}s</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--clr-muted)', fontSize: '0.8125rem' }}>
                                      {ex.notes ?? 'Standard'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Dumbbell size={36} />}
                title="Sélectionnez un programme"
                description="Choisissez un programme dans la liste de gauche pour voir ses séances et exercices."
              />
            )}
          </div>
        </div>

        {/* Create Program Modal for Coach */}
        {showCreateModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--sp-4)',
              zIndex: 1000,
            }}
          >
            <div className="card animate-scale-in" style={{ maxWidth: 540, width: '100%', padding: 'var(--sp-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>
                Nouveau Programme d&apos;Entraînement
              </h2>
              <form onSubmit={handleCreateProgram} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Titre du programme</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex : Force & Hypertrophie 4 semaines"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Objectifs</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Objectifs, intensité, indications pour l'athlète..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-3)' }}>
                  <div className="form-group">
                    <label className="form-label text-xs">Difficulté</label>
                    <select
                      className="form-select text-sm"
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value as any)}
                    >
                      <option value="beginner">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Durée (semaines)</label>
                    <input
                      type="number"
                      className="form-input text-sm"
                      value={newWeeks}
                      min={1}
                      max={52}
                      onChange={(e) => setNewWeeks(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Séances / sem.</label>
                    <input
                      type="number"
                      className="form-input text-sm"
                      value={newSessionsPerWeek}
                      min={1}
                      max={7}
                      onChange={(e) => setNewSessionsPerWeek(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--clr-border)' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={creating}
                  >
                    {creating ? 'Création…' : 'Créer le programme'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
