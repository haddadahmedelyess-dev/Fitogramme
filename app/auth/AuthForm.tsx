'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, UserCheck, Salad, AlertCircle } from 'lucide-react';
import { useAuth, ApiError } from '@/lib/auth-context';
import type { Role } from '@/lib/api';

const roleOptions: { value: Role; label: string; emoji: string; desc: string }[] = [
  { value: 'client',       label: 'Client',           emoji: '🏃', desc: 'Je suis suivi par un coach/nutritionniste' },
  { value: 'coach',        label: 'Coach Sportif',    emoji: '💪', desc: 'Je gère des clients et des programmes' },
  { value: 'nutritionist', label: 'Nutritionniste',   emoji: '🥗', desc: 'Je crée des plans alimentaires' },
];

export default function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, register, user, loading: authLoading } = useAuth();

  const [mode, setMode]           = useState<'login' | 'register'>(
    params.get('mode') === 'register' ? 'register' : 'login',
  );
  const [role, setRole]           = useState<Role>(
    (params.get('role') as Role) ?? 'client',
  );
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const dest =
        user.role === 'coach' ? '/dashboard/coach'
        : user.role === 'nutritionist' ? '/dashboard/nutritionist'
        : '/dashboard/client';
      router.replace(dest);
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        if (!fullName.trim()) { setError('Veuillez entrer votre nom complet.'); setLoading(false); return; }
        await register({ email, password, full_name: fullName, role });
      }
      // AuthProvider useEffect will redirect
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Une erreur inattendue s\'est produite. Vérifiez votre connexion.');
      }
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="auth-layout">
      {/* ── Brand panel (desktop only) ── */}
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', justifyContent: 'center', marginBottom: 'var(--sp-8)' }}>
            <div className="hero-logo-mark" aria-hidden="true">FG</div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>FitoGramme</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--sp-4)', lineHeight: 1.2 }}>
            Coaching &amp; Nutrition<br />
            <span style={{ color: 'var(--clr-terra-2)' }}>intelligents</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: 340, lineHeight: 1.7 }}>
            Journalisez vos repas en darija ou en français,
            suivez vos programmes d&apos;entraînement et bénéficiez
            d&apos;un suivi personnalisé par vos professionnels de santé.
          </p>
          <div style={{ marginTop: 'var(--sp-10)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', textAlign: 'left' }}>
            {[
              'Journal repas en darija / français / عربي',
              'Estimations IA — corrigées par votre équipe',
              'Programmes d\'entraînement personnalisés',
            ].map((txt) => (
              <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', color: 'rgba(255,255,255,0.75)', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--clr-terra-2)', flexShrink: 0 }}>✓</span>
                {txt}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="auth-panel">
        <form
          className="auth-form animate-fade-in"
          onSubmit={handleSubmit}
          aria-label={mode === 'login' ? 'Formulaire de connexion' : 'Formulaire d\'inscription'}
          noValidate
        >
          {/* Logo (mobile) */}
          <div className="flex items-center gap-3 mb-6" style={{ display: 'none' /* shown via CSS @media */ }}>
            <div className="hero-logo-mark" aria-hidden="true">FG</div>
            <span className="font-bold text-xl">FitoGramme</span>
          </div>

          <h1 className="auth-form-title">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="auth-form-sub">
            {mode === 'login'
              ? 'Bienvenue ! Entrez vos identifiants pour continuer.'
              : 'Rejoignez FitoGramme et commencez votre suivi.'}
          </p>

          {/* Error */}
          {error && (
            <div className="alert alert-error mb-6" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Role picker (register only) */}
          {mode === 'register' && (
            <div className="form-group mb-6">
              <label className="form-label" id="role-label">Votre rôle</label>
              <div className="role-grid" role="radiogroup" aria-labelledby="role-label">
                {roleOptions.map(({ value, label, emoji }) => (
                  <div
                    key={value}
                    className={`role-card${role === value ? ' selected' : ''}`}
                    onClick={() => setRole(value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setRole(value); }}
                    role="radio"
                    aria-checked={role === value}
                    tabIndex={0}
                  >
                    <div className="role-icon" aria-hidden="true">{emoji}</div>
                    <span className="role-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full name */}
          {mode === 'register' && (
            <div className="form-group mb-4">
              <label htmlFor="full-name" className="form-label">Nom complet</label>
              <input
                id="full-name"
                type="text"
                className="form-input"
                placeholder="Ahmed Ben Ali"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          {/* Email */}
          <div className="form-group mb-4">
            <label htmlFor="email" className="form-label">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="ahmed@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>

          {/* Password */}
          <div className="form-group mb-6">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              {mode === 'login' && (
                <a href="#" className="text-sm" style={{ color: 'var(--clr-terra)' }}>
                  Mot de passe oublié ?
                </a>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-muted)' }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === 'register' && (
              <p className="form-hint">Au moins 8 caractères.</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <><span className="spinner" aria-hidden="true" style={{ width: 18, height: 18, borderWidth: 2 }} /> Chargement…</>
            ) : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>

          {/* Quick Demo Logins */}
          <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-4)', background: 'var(--clr-surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)' }}>
            <p className="text-xs font-semibold text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Accès Démo Rapide (1-clic)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-2)' }}>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.75rem', padding: '6px 8px' }}
                onClick={() => {
                  setEmail('client@fitogramme.tn');
                  setPassword('demo1234');
                  login({ email: 'client@fitogramme.tn', password: 'demo1234' });
                }}
              >
                Client
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.75rem', padding: '6px 8px' }}
                onClick={() => {
                  setEmail('coach@fitogramme.tn');
                  setPassword('demo1234');
                  login({ email: 'coach@fitogramme.tn', password: 'demo1234' });
                }}
              >
                Coach
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ fontSize: '0.75rem', padding: '6px 8px' }}
                onClick={() => {
                  setEmail('nutri@fitogramme.tn');
                  setPassword('demo1234');
                  login({ email: 'nutri@fitogramme.tn', password: 'demo1234' });
                }}
              >
                Nutritionniste
              </button>
            </div>
          </div>

          {/* Switch mode */}
          <div className="divider-text">ou</div>
          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--clr-muted)' }}>
            {mode === 'login' ? (
              <>Pas encore de compte ?{' '}
                <button type="button" className="font-semibold" style={{ color: 'var(--clr-terra)' }} onClick={() => { setMode('register'); setError(''); }}>
                  S&apos;inscrire
                </button>
              </>
            ) : (
              <>Déjà inscrit ?{' '}
                <button type="button" className="font-semibold" style={{ color: 'var(--clr-terra)' }} onClick={() => { setMode('login'); setError(''); }}>
                  Se connecter
                </button>
              </>
            )}
          </p>

          <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 'var(--sp-6)' }}>
            <Link href="/" style={{ color: 'var(--clr-muted)' }}>← Retour à l&apos;accueil</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
