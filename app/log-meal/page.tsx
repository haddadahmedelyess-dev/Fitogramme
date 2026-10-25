'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed, Sparkles, Check, AlertCircle,
  Trash2, Edit3, ArrowRight, Info
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Topbar from '@/components/Topbar';
import { AiDisclaimer, LoadingSpinner, EmptyState } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { meals, MealLog, NutritionEstimate } from '@/lib/api';

const DERJA_EXAMPLES = [
  'Klit sahn kafteji fi dar m3a 2 3dham me9liyin w chwaya khobz ch3ir',
  'Bsisa b zit zitouna w 3sal m3a 9ahwa',
  'Couscous bel hout w khodhra m3a salade méchouia',
  'Ojja bel merguez w ka3btin 3dham',
  'Sahn lablabi m3a 3adhma w zit zitouna w hrissa 3arbi',
  'Salade méchouia m3a thon w ka3ba 3adhma maslou9a',
];

export default function LogMealPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mealText, setMealText] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [analyzing, setAnalyzing] = useState(false);
  const [estimate, setEstimate] = useState<NutritionEstimate | null>(null);

  // Editable macros state
  const [cal, setCal] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [history, setHistory] = useState<MealLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
      return;
    }

    loadHistory();
  }, [user, authLoading, router]);

  async function loadHistory() {
    try {
      const data = await meals.list({ limit: 20 });
      setHistory(data);
    } catch (err) {
      console.error('Erreur chargement repas:', err);
    } finally {
      setLoadingHistory(false);
    }
  }

  // Handle AI analysis trigger
  async function handleAnalyze() {
    if (!mealText.trim()) return;
    setAnalyzing(true);
    setFeedback(null);

    try {
      const res = await meals.estimate(mealText);
      setEstimate(res);
      setCal(res.calories ?? 0);
      setProtein(res.protein_g ?? 0);
      setCarbs(res.carbs_g ?? 0);
      setFat(res.fat_g ?? 0);
    } catch {
      setFeedback({
        type: 'error',
        message: 'Impossible de calculer l\'estimation. Vous pouvez saisir les valeurs manuellement.',
      });
    } finally {
      setAnalyzing(false);
    }
  }

  // Handle save meal
  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!mealText.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez décrire votre repas.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const payloadEstimate: NutritionEstimate = {
        calories: Number(cal),
        protein_g: Number(protein),
        carbs_g: Number(carbs),
        fat_g: Number(fat),
        confidence: estimate?.confidence ?? 'medium',
        disclaimer:
          estimate?.disclaimer ??
          'Estimation validée et ajustée par l\'utilisateur.',
      };

      await meals.create({
        text_original: mealText,
        meal_type: mealType,
        ai_estimate: payloadEstimate,
      });

      setFeedback({
        type: 'success',
        message: 'Repas enregistré avec succès ! Vos totaux nutritionnels ont été actualisés.',
      });

      // Reset form
      setMealText('');
      setEstimate(null);
      setCal(0);
      setProtein(0);
      setCarbs(0);
      setFat(0);

      // Refresh list
      loadHistory();
    } catch {
      setFeedback({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement. Veuillez réessayer.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Voulez-vous supprimer ce repas ?')) return;
    try {
      await meals.delete(id);
      setHistory((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert('Impossible de supprimer le repas.');
    }
  }

  return (
    <DashboardLayout>
      <Topbar
        title="Journal des Repas (Derja & Français)"
        subtitle="Saisie naturelle en dialecte tunisien avec estimation IA vérifiable par l'utilisateur."
      />

      <div className="container py-8 space-y-8 animate-fade-in">
        {/* Core Medical/AI Advisory */}
        <div className="alert alert-ai flex items-start gap-3">
          <Info size={20} className="text-amber-400 mt-1 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-white">Estimation nutritionnelle indicative</p>
            <p className="text-muted mt-1">
              Les calculs générés par l&apos;IA pour les plats tunisiens sont des ordres de grandeur
              estimatifs. Vous avez la pleine liberté de corriger les calories et macronutriments ci-dessous
              avant de valider. Ne remplace pas l&apos;avis de votre médecin ou nutritionniste.
            </p>
          </div>
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
            <button
              className="text-xs opacity-75 hover:opacity-100"
              onClick={() => setFeedback(null)}
            >
              Fermer
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--sp-6)' }}>
          {/* Main Form */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>
              Enregistrer un repas
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Meal Type */}
              <div className="form-group">
                <label className="form-label">Type de repas</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-2)' }}>
                  {[
                    { id: 'breakfast', label: 'Petit-déj' },
                    { id: 'lunch', label: 'Déjeuner' },
                    { id: 'dinner', label: 'Dîner' },
                    { id: 'snack', label: 'Collation' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`btn btn-sm ${mealType === t.id ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: '0.8125rem', padding: '6px 4px' }}
                      onClick={() => setMealType(t.id as any)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input text */}
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="mealText" className="form-label mb-0">
                    Description du repas (Derja / FR / عربي)
                  </label>
                  <span className="text-xs text-muted">Support darija tunisienne</span>
                </div>
                <textarea
                  id="mealText"
                  rows={3}
                  className="form-textarea"
                  placeholder="Ex : Klit sahn kafteji m3a 2 3dham me9liyin w chwaya khobz ch3ir..."
                  value={mealText}
                  onChange={(e) => setMealText(e.target.value)}
                  required
                />
              </div>

              {/* Derja Quick Suggestions */}
              <div>
                <p className="text-xs text-muted mb-2 font-medium">Suggestions tunisiennes rapides :</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                  {DERJA_EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setMealText(ex);
                        setEstimate(null);
                      }}
                      className="tag"
                      style={{
                        background: 'var(--clr-surface-2)',
                        border: '1px solid var(--clr-border)',
                        color: 'var(--clr-text)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        textAlign: 'left',
                      }}
                    >
                      {ex.length > 35 ? ex.substring(0, 35) + '…' : ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Analyze trigger */}
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn btn-outline btn-full"
                  onClick={handleAnalyze}
                  disabled={analyzing || !mealText.trim()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)' }}
                >
                  <Sparkles size={16} className="text-amber-400" />
                  {analyzing ? 'Analyse en cours…' : 'Estimer avec l\'IA'}
                </button>
              </div>

              {/* Review & Edit Section */}
              <div
                style={{
                  padding: 'var(--sp-4)',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--clr-surface-2)',
                  border: '1px solid var(--clr-border)',
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1">
                    <Edit3 size={14} /> Vérification &amp; Correction des Macros
                  </span>
                  {estimate && (
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      Confiance {estimate.confidence}
                    </span>
                  )}
                </div>

                {estimate?.disclaimer && (
                  <p className="text-xs text-amber-300/90 mb-4" style={{ fontStyle: 'italic', lineHeight: 1.4 }}>
                    &ldquo;{estimate.disclaimer}&rdquo;
                  </p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-3)' }}>
                  <div className="form-group">
                    <label className="form-label text-xs">Calories (kcal)</label>
                    <input
                      type="number"
                      className="form-input text-sm"
                      value={cal || ''}
                      onChange={(e) => setCal(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Protéines (g)</label>
                    <input
                      type="number"
                      className="form-input text-sm"
                      value={protein || ''}
                      onChange={(e) => setProtein(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Glucides (g)</label>
                    <input
                      type="number"
                      className="form-input text-sm"
                      value={carbs || ''}
                      onChange={(e) => setCarbs(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Lipides (g)</label>
                    <input
                      type="number"
                      className="form-input text-sm"
                      value={fat || ''}
                      onChange={(e) => setFat(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Save */}
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={saving || !mealText.trim()}
              >
                {saving ? 'Enregistrement…' : 'Valider et Enregistrer le Repas'}
              </button>
            </form>
          </div>

          {/* Meals History */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div className="flex justify-between items-center mb-5">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Historique récent</h2>
              <span className="text-xs text-muted">{history.length} repas récents</span>
            </div>

            {loadingHistory ? (
              <LoadingSpinner label="Chargement de l'historique..." />
            ) : history.length === 0 ? (
              <EmptyState
                icon={<UtensilsCrossed size={36} />}
                title="Aucun repas consigné"
                description="Vos repas enregistrés avec leurs détails nutritionnels apparaîtront ici."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', maxHeight: 600, overflowY: 'auto' }}>
                {history.map((meal) => (
                  <div
                    key={meal.id}
                    style={{
                      padding: 'var(--sp-4)',
                      background: 'var(--clr-surface-2)',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--clr-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--sp-2)',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="badge badge-secondary" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                          {meal.meal_type === 'breakfast' ? 'Petit-déjeuner' : meal.meal_type === 'lunch' ? 'Déjeuner' : meal.meal_type === 'dinner' ? 'Dîner' : 'Collation'}
                        </span>
                        <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginTop: 'var(--sp-1)' }}>
                          {meal.text_original}
                        </p>
                        {meal.text_normalized && meal.text_normalized !== meal.text_original && (
                          <p className="text-xs text-muted" style={{ fontStyle: 'italic' }}>
                            {meal.text_normalized}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(meal.id)}
                        className="text-muted hover:text-red-400 p-1"
                        title="Supprimer ce repas"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--clr-border)',
                        paddingTop: 'var(--sp-2)',
                        marginTop: 'var(--sp-1)',
                      }}
                    >
                      <span className="text-xs text-muted">
                        {new Date(meal.logged_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-3">
                        <span style={{ fontWeight: 700, color: 'var(--clr-terra)', fontSize: '0.875rem' }}>
                          {meal.ai_estimate?.calories ?? 0} kcal
                        </span>
                        <span className="text-xs text-muted">
                          P:{meal.ai_estimate?.protein_g ?? 0}g G:{meal.ai_estimate?.carbs_g ?? 0}g L:{meal.ai_estimate?.fat_g ?? 0}g
                        </span>
                      </div>
                    </div>
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
