import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Brain, Utensils, Dumbbell, Users, ArrowRight,
  CheckCircle, Star, Globe,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'FitoGramme — Coaching Sportif & Nutrition Intelligente',
  description:
    'Plateforme d\'assistance IA pour coachs, nutritionnistes et clients. Journalisez vos repas en darija, suivez vos entraînements et recevez des recommandations personnalisées.',
};

const features = [
  {
    icon: Utensils,
    color: 'feature-icon-terra',
    title: 'Journal repas en darija',
    desc: 'Saisissez vos repas dans votre langue — français, arabe ou darija tunisienne. Notre IA comprend le contexte local.',
  },
  {
    icon: Brain,
    color: 'feature-icon-teal',
    title: 'Estimations nutritionnelles',
    desc: 'L\'IA propose des estimations de calories et macros. Ces valeurs sont indicatives — votre nutritionniste vérifie et corrige.',
  },
  {
    icon: Dumbbell,
    color: 'feature-icon-terra',
    title: 'Programmes d\'entraînement',
    desc: 'Vos coachs créent et assignent des programmes personnalisés. Suivez votre progression séance par séance.',
  },
  {
    icon: Users,
    color: 'feature-icon-navy',
    title: 'Trois rôles, une plateforme',
    desc: 'Client, coach ou nutritionniste — chaque rôle dispose de son tableau de bord adapté à ses besoins.',
  },
  {
    icon: Globe,
    color: 'feature-icon-teal',
    title: 'Support multilingue & RTL',
    desc: 'Interface disponible en français et arabe avec support natif de l\'écriture de droite à gauche.',
  },
  {
    icon: CheckCircle,
    color: 'feature-icon-terra',
    title: 'Suivi en temps réel',
    desc: 'Notifications, historique de repas, statistiques d\'entraînement et messagerie entre coach et client.',
  },
];

const roles = [
  {
    emoji: '🏃',
    title: 'Client',
    desc: 'Loggez vos repas, suivez vos workouts, recevez les conseils de votre équipe.',
    href: '/auth?mode=register&role=client',
    color: 'var(--clr-terra)',
  },
  {
    emoji: '💪',
    title: 'Coach Sportif',
    desc: 'Gérez vos clients, créez des programmes et suivez leur progression.',
    href: '/auth?mode=register&role=coach',
    color: 'var(--clr-teal)',
  },
  {
    emoji: '🥗',
    title: 'Nutritionniste',
    desc: 'Élaborez des plans alimentaires personnalisés et analysez les journaux de vos clients.',
    href: '/auth?mode=register&role=nutritionist',
    color: 'var(--clr-navy)',
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero" aria-labelledby="hero-heading">
        {/* Nav */}
        <nav className="hero-nav" aria-label="Navigation principale">
          <div className="hero-logo">
            <div className="hero-logo-mark" aria-hidden="true">FG</div>
            <span className="hero-logo-name">FitoGramme</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth?mode=login" className="btn btn-ghost" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Connexion
            </Link>
            <Link href="/auth?mode=register" className="btn btn-primary">
              Commencer
            </Link>
          </div>
        </nav>

        {/* Body */}
        <div className="hero-body">
          <div className="animate-fade-in" style={{ maxWidth: 720 }}>
            <div className="flex justify-center mb-6">
              <span className="badge badge-terra" style={{ fontSize: '0.8125rem', padding: '0.3rem 0.9rem' }}>
                ✦ Darija • Français • عربي
              </span>
            </div>
            <h1 id="hero-heading" className="hero-headline">
              Coaching &amp; nutrition{' '}
              <span className="hero-headline-accent">intelligents</span>
              <br />pour la Tunisie
            </h1>
            <p className="hero-sub">
              FitoGramme connecte coachs, nutritionnistes et clients dans une plateforme unifiée.
              Journalisez vos repas en darija, suivez vos entraînements et recevez des recommandations
              personnalisées assistées par l&apos;IA.
            </p>
            <div className="hero-cta-group">
              <Link href="/auth?mode=register" className="btn btn-primary btn-lg">
                Créer un compte gratuit <ArrowRight size={18} />
              </Link>
              <Link href="/auth?mode=login" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}>
                Se connecter
              </Link>
            </div>
            <p style={{ marginTop: 'var(--sp-5)', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
              Les estimations nutritionnelles sont générées par IA à titre indicatif uniquement.
            </p>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ textAlign: 'center', paddingBottom: 'var(--sp-8)', opacity: 0.4, fontSize: '1.25rem' }} aria-hidden="true">
          ↓
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="hero-features" aria-labelledby="features-heading">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
            <h2 id="features-heading" className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
              Tout ce dont votre équipe a besoin
            </h2>
            <p className="text-muted text-lg mt-4">
              Un outil pensé pour le contexte tunisien, de la langue aux habitudes alimentaires.
            </p>
          </div>
          <div className="feature-grid stagger">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <article key={title} className="feature-card animate-fade-in">
                <div className={`feature-icon ${color}`} aria-hidden="true">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: 'var(--sp-20) 0', background: 'var(--clr-cream-2)' }} aria-labelledby="roles-heading">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
            <h2 id="roles-heading" className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
              Quel est votre rôle ?
            </h2>
            <p className="text-muted text-lg mt-4">
              Choisissez votre profil pour accéder aux fonctionnalités adaptées.
            </p>
          </div>
          <div className="grid grid-3 gap-6">
            {roles.map(({ emoji, title, desc, href, color }) => (
              <Link key={title} href={href} className="feature-card" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-4)' }} aria-hidden="true">
                  {emoji}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color }}>{title}</h3>
                <p className="text-muted mb-4">{desc}</p>
                <span className="btn btn-outline btn-sm">
                  Commencer <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--clr-navy)', color: 'rgba(255,255,255,0.6)', padding: 'var(--sp-10) 0', textAlign: 'center' }}>
        <div className="container">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="sidebar-logo-mark" style={{ background: 'linear-gradient(135deg,var(--clr-terra),var(--clr-terra-2))' }} aria-hidden="true">FG</div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>FitoGramme</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto' }}>
            Les analyses et estimations nutritionnelles fournies par l&apos;IA sont à titre indicatif uniquement.
            Consultez un professionnel de santé pour tout conseil médical ou nutritionnel.
          </p>
          <p className="text-xs" style={{ marginTop: 'var(--sp-6)', color: 'rgba(255,255,255,0.25)' }}>
            © 2026 FitoGramme. Tous droits réservés.
          </p>
        </div>
      </footer>
    </>
  );
}
