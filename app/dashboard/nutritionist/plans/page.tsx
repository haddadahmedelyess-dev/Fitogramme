'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, Plus, Calendar, Check,
  Apple, Utensils, Flame, ChevronRight, AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Topbar from '@/components/Topbar';
import { LoadingSpinner, EmptyState, AiDisclaimer } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { mealPlans, MealPlan, MealPlanDay } from '@/lib/api';

export default function NutritionistPlansPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal create state
  const [showModal, setShowModal] = useState(false);
  const [weekStart, setWeekStart] = useState('2026-10-26');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
      return;
    }

    async function load() {
      try {
        const data = await mealPlans.list();
        setPlans(data);
        if (data.length > 0) {
          setSelectedPlan(data[0]);
        }
      } catch (err) {
        console.error('Erreur plans:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      load();
    }
  }, [user, authLoading, router]);

  async function handleCreatePlan(e: FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const defaultDays: MealPlanDay[] = [
        {
          day: 1,
          meals: [
            { meal_type: 'Petit-déjeuner', description: 'Bsisa d\'orge (60g), huile d\'olive extra vierge, 1 c.à.c miel, café noir', calories_target: 400 },
            { meal_type: 'Déjeuner', description: 'Couscous complet à l\'orge (dchicha) avec dorade grillée et courgettes/carottes vapeur', calories_target: 650 },
            { meal_type: 'Collation', description: 'Yaourt grec nature, 3 dattes Deglet Nour et 10 amandes fraîches', calories_target: 250 },
            { meal_type: 'Dîner', description: 'Salade tunisienne aux concombres et tomates, blanc de poulet mariné au curcuma (150g)', calories_target: 450 },
          ],
        },
        {
          day: 2,
          meals: [
            { meal_type: 'Petit-déjeuner', description: 'Omelette 3 œufs aux herbes, 1 tranche de pain d\'orge, 5 olives', calories_target: 420 },
            { meal_type: 'Déjeuner', description: 'Ojja aux crevettes avec tomates fraîches, ail et piment doux, pain d\'orge', calories_target: 580 },
            { meal_type: 'Collation', description: 'Pomme verte et poignée de noix', calories_target: 200 },
            { meal_type: 'Dîner', description: 'Soupe de lentilles corail (chorba 3das) et salade méchouia avec 1 boîte de thon au naturel', calories_target: 440 },
          ],
        },
      ];

      const created = await mealPlans.create({
        nutritionist_id: user?.id ?? 'nutri-1',
        client_id: 'user-client-1',
        week_start: weekStart,
        days: defaultDays,
      });

      setPlans([created, ...plans]);
      setSelectedPlan(created);
      setShowModal(false);
    } catch {
      alert('Erreur lors de la création du plan.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <DashboardLayout>
      <Topbar
        title="Plans Nutritionnels &amp; Régimes"
        subtitle="Conception de programmes alimentaires personnalisés, équilibrés et adaptés à la gastronomie tunisienne."
      />

      <div className="container py-8 space-y-8 animate-fade-in">
        <AiDisclaimer confidence="high" />

        <div className="flex justify-between items-center bg-surface-2 p-4 rounded-xl border border-border">
          <div>
            <p className="font-semibold text-white">Élaboration de Menus Personnalisés</p>
            <p className="text-xs text-muted">
              Définissez les repas par jour, types et cibles caloriques.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm flex items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Nouveau Plan Hebdomadaire
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-6)' }}>
          {/* Plan selector */}
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>
              Plans enregistrés
            </h2>

            {loading ? (
              <LoadingSpinner label="Chargement des plans..." />
            ) : plans.length === 0 ? (
              <EmptyState
                icon={<ClipboardList size={32} />}
                title="Aucun plan"
                description="Créez votre premier plan nutritionnel."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {plans.map((p) => {
                  const isSelected = selectedPlan?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlan(p)}
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
                          Semaine du {p.week_start}
                        </span>
                        <span className="text-xs text-muted">{p.days.length} jours</span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: isSelected ? 'var(--clr-terra-2)' : 'var(--clr-text)' }}>
                        Menu Méditerranéen &amp; Tunisien
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plan Details & Day by Day */}
          <div className="card" style={{ padding: 'var(--sp-6)', gridColumn: 'span 2' }}>
            {selectedPlan ? (
              <div>
                <div style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge badge-primary">Semaine débutant le {selectedPlan.week_start}</span>
                    <span className="text-xs text-muted">Établi par le nutritionniste</span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    Plan Alimentaire Équilibré
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    Repas riches en fibres (dchicha, pain d&apos;orge), protéines maigres (poisson de Méditerranée, œufs) et graisses saines (huile d&apos;olive tunisienne).
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
                  {selectedPlan.days.map((d) => (
                    <div
                      key={d.day}
                      style={{
                        background: 'var(--clr-surface-2)',
                        borderRadius: 'var(--r-md)',
                        border: '1px solid var(--clr-border)',
                        padding: 'var(--sp-5)',
                      }}
                    >
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--sp-3)', color: 'var(--clr-terra-2)' }}>
                        Jour {d.day}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                        {d.meals.map((m, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: 'var(--sp-3)',
                              background: 'var(--clr-surface-1)',
                              borderRadius: 'var(--r-sm)',
                              border: '1px solid var(--clr-border)',
                            }}
                          >
                            <div>
                              <span className="badge badge-secondary" style={{ fontSize: '0.6875rem' }}>
                                {m.meal_type}
                              </span>
                              <p style={{ fontWeight: 500, fontSize: '0.9375rem', marginTop: 'var(--sp-1)' }}>
                                {m.description}
                              </p>
                            </div>
                            {m.calories_target && (
                              <span style={{ fontWeight: 700, color: 'var(--clr-terra)', fontSize: '0.875rem', flexShrink: 0, marginLeft: 16 }}>
                                ~{m.calories_target} kcal
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<ClipboardList size={36} />}
                title="Sélectionnez un plan"
                description="Choisissez un plan alimentaire dans la liste pour consulter les détails."
              />
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
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
            <div className="card animate-scale-in" style={{ maxWidth: 480, width: '100%', padding: 'var(--sp-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>
                Nouveau Plan Nutritionnel
              </h2>
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Date de début de la semaine</label>
                  <input
                    type="date"
                    className="form-input"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={creating}
                  >
                    {creating ? 'Génération…' : 'Créer avec modèles équilibrés'}
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
