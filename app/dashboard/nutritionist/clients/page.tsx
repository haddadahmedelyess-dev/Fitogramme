'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, UtensilsCrossed, Apple, HeartPulse,
  Mail, Calendar, CheckCircle2, ChevronRight, MessageSquare
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Topbar from '@/components/Topbar';
import { LoadingSpinner, EmptyState, AiDisclaimer } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { clients, Client, MealLog } from '@/lib/api';

export default function NutritionistClientsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [clientList, setClientList] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientMeals, setClientMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [adviceNote, setAdviceNote] = useState('');
  const [noteSent, setNoteSent] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
      return;
    }

    async function load() {
      try {
        const cls = await clients.list();
        setClientList(cls);
        if (cls.length > 0) {
          selectClient(cls[0]);
        }
      } catch (err) {
        console.error('Erreur patients:', err);
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
    setNoteSent(false);
    try {
      const mealsData = await clients.meals(client.id);
      setClientMeals(mealsData);
    } catch (err) {
      console.error('Erreur repas client:', err);
    } finally {
      setLoadingMeals(false);
    }
  }

  function handleSendNote() {
    if (!adviceNote.trim()) return;
    setNoteSent(true);
    setTimeout(() => {
      setAdviceNote('');
      setNoteSent(false);
    }, 3000);
  }

  return (
    <DashboardLayout>
      <Topbar
        title="Dossiers Diététiques des Patients"
        subtitle="Contrôlez les journaux alimentaires, l'équilibre calorique et transmettez des recommandations cliniques."
      />

      <div className="container py-8 space-y-8 animate-fade-in">
        <AiDisclaimer confidence="high" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-6)' }}>
          {/* Patient list */}
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>
              Patients Suivis ({clientList.length})
            </h2>

            {loading ? (
              <LoadingSpinner label="Chargement des patients..." />
            ) : clientList.length === 0 ? (
              <EmptyState
                icon={<Users size={32} />}
                title="Aucun patient"
                description="Votre liste de patients apparaîtra ici."
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

          {/* Patient details & journal */}
          <div className="card" style={{ padding: 'var(--sp-6)', gridColumn: 'span 2' }}>
            {selectedClient ? (
              <div>
                {/* Header */}
                <div style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {selectedClient.full_name}
                      </h2>
                      <p className="text-xs text-muted flex items-center gap-2 mt-1">
                        <Mail size={13} /> {selectedClient.email} • Inscrit le {new Date(selectedClient.joined_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className="badge badge-primary">Dossier Nutritionnel</span>
                  </div>

                  <div style={{ background: 'var(--clr-surface-2)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--r-md)', marginTop: 'var(--sp-3)' }}>
                    <p className="text-xs text-muted uppercase font-semibold">Objectif métabolique &amp; santé :</p>
                    <p className="text-sm font-medium mt-1">{selectedClient.goal ?? 'Rééquilibrage alimentaire général'}</p>
                  </div>
                </div>

                {/* Dietary feedback sender */}
                <div style={{ background: 'var(--clr-surface-2)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', marginBottom: 'var(--sp-6)', border: '1px solid var(--clr-border)' }}>
                  <p className="text-xs font-semibold uppercase text-muted mb-2 flex items-center gap-2">
                    <MessageSquare size={14} /> Envoyer une recommandation nutritionnelle
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="form-input text-sm"
                      placeholder="Ex : Réduire l'huile d'olive dans le kafteji à 1 cuillère, privilégier le pain d'orge..."
                      value={adviceNote}
                      onChange={(e) => setAdviceNote(e.target.value)}
                    />
                    <button
                      className="btn btn-primary btn-sm flex-shrink-0"
                      onClick={handleSendNote}
                      disabled={!adviceNote.trim()}
                    >
                      Transmettre
                    </button>
                  </div>
                  {noteSent && (
                    <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                      <CheckCircle2 size={13} /> Recommandation envoyée au dossier du patient !
                    </p>
                  )}
                </div>

                {/* Meals */}
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <UtensilsCrossed size={18} className="text-amber-400" />
                  Journal alimentaire détaillé du patient
                </h3>

                {loadingMeals ? (
                  <LoadingSpinner label="Chargement des données diététiques..." />
                ) : clientMeals.length === 0 ? (
                  <EmptyState
                    icon={<UtensilsCrossed size={32} />}
                    title="Aucun repas consigné"
                    description="Le patient n'a pas encore enregistré de repas."
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
                            <span>Diagnostic IA : {meal.ai_estimate.disclaimer}</span>
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                              Fiabilité {meal.ai_estimate.confidence}
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
                title="Sélectionnez un patient"
                description="Choisissez un patient dans la liste de gauche pour analyser son journal."
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
