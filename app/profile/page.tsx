'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon, Mail, Globe, Lock, Shield,
  Check, AlertCircle, LogOut
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Topbar from '@/components/Topbar';
import { useAuth } from '@/lib/auth-context';
import { profile } from '@/lib/api';

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [language, setLanguage] = useState<'fr' | 'ar' | 'derja'>('derja');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
      return;
    }

    if (user) {
      setFullName(user.full_name || '');
      setLanguage(user.language || 'derja');
    }
  }, [user, authLoading, router]);

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      await profile.update({ full_name: fullName, language });
      setProfileMsg({ type: 'success', text: 'Profil mis à jour avec succès !' });
    } catch {
      setProfileMsg({ type: 'error', text: 'Impossible de mettre à jour le profil.' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setChangingPass(true);
    setPassMsg(null);

    try {
      await profile.changePassword(oldPassword, newPassword);
      setPassMsg({ type: 'success', text: 'Mot de passe modifié avec succès !' });
      setOldPassword('');
      setNewPassword('');
    } catch {
      setPassMsg({ type: 'error', text: 'Erreur lors du changement de mot de passe.' });
    } finally {
      setChangingPass(false);
    }
  }

  const roleLabel =
    user?.role === 'coach'
      ? 'Coach Sportif'
      : user?.role === 'nutritionist'
      ? 'Nutritionniste Professionnel'
      : 'Client Athlète';

  return (
    <DashboardLayout>
      <Topbar
        title="Paramètres & Profil"
        subtitle="Gérez votre identité, vos préférences linguistiques (Derja / Français / العربية) et votre sécurité."
      />

      <div className="container py-8 space-y-8 animate-fade-in" style={{ maxWidth: 800 }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--clr-terra), var(--clr-terra-2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'FG'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.full_name}</h2>
              <p className="text-sm text-muted">{user?.email}</p>
              <span className="badge badge-primary mt-2" style={{ textTransform: 'capitalize' }}>
                <Shield size={12} className="mr-1" /> {roleLabel}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Informations personnelles</h3>

            {profileMsg && (
              <div className={`alert ${profileMsg.type === 'success' ? 'alert-success' : 'alert-error'} flex items-center gap-2`}>
                {profileMsg.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="fullname" className="form-label">Nom complet</label>
              <input
                id="fullname"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                className="form-input opacity-75 cursor-not-allowed"
                value={user?.email || ''}
                disabled
              />
              <p className="form-hint">L&apos;adresse e-mail sert d&apos;identifiant de connexion sécurisé.</p>
            </div>

            <div className="form-group">
              <label htmlFor="language" className="form-label flex items-center gap-2">
                <Globe size={16} /> Langue préférée pour la saisie &amp; l&apos;interface
              </label>
              <select
                id="language"
                className="form-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
              >
                <option value="derja">Tunisian Derja — الدارجة التونسية (Recommandé)</option>
                <option value="fr">Français</option>
                <option value="ar">العربية الفصحى</option>
              </select>
              <p className="form-hint">
                Optimise la reconnaissance IA pour les plats et ingrédients typiques de Tunisie.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
            >
              {savingProfile ? 'Enregistrement…' : 'Mettre à jour le profil'}
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>
            Sécurité &amp; Mot de passe
          </h3>

          {passMsg && (
            <div className={`alert ${passMsg.type === 'success' ? 'alert-success' : 'alert-error'} flex items-center gap-2 mb-4`}>
              {passMsg.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="form-group">
              <label htmlFor="oldPass" className="form-label">Mot de passe actuel</label>
              <input
                id="oldPass"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPass" className="form-label">Nouveau mot de passe</label>
              <input
                id="newPass"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="form-hint">Au moins 8 caractères.</p>
            </div>

            <button
              type="submit"
              className="btn btn-outline"
              disabled={changingPass || !oldPassword || !newPassword}
            >
              {changingPass ? 'Changement…' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>

        {/* Logout Action */}
        <div className="card" style={{ padding: 'var(--sp-6)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-white">Déconnexion de session</p>
              <p className="text-xs text-muted">Terminer la session active sur cet appareil.</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.replace('/auth');
              }}
              className="btn btn-sm"
              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <LogOut size={16} className="mr-1 inline" /> Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
