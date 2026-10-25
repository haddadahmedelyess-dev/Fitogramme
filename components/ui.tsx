import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in" role="status">
      <div className="empty-state-icon" aria-hidden="true">
        {icon ?? <AlertCircle size={32} />}
      </div>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {action}
    </div>
  );
}

export function LoadingSpinner({ size = 'md', label = 'Chargement…' }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const cls = size === 'lg' ? 'spinner spinner-lg' : 'spinner';
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6" role="status" aria-label={label}>
      <div className={cls} aria-hidden="true" />
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="loading-screen" role="status" aria-label="Chargement de la page">
      <div className="sidebar-logo-mark" style={{ width: 52, height: 52, fontSize: '1.4rem', borderRadius: 12, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,var(--clr-terra),var(--clr-terra-2))' }}>
        FG
      </div>
      <div className="spinner spinner-lg" aria-hidden="true" />
      <p className="text-sm text-muted">FitoGramme…</p>
    </div>
  );
}

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="alert alert-error animate-scale-in" role="alert">
      <AlertCircle size={20} aria-hidden="true" />
      <div style={{ flex: 1 }}>
        <p className="font-medium">Une erreur s&apos;est produite</p>
        <p className="text-sm mt-2">{message}</p>
      </div>
      {onRetry && (
        <button className="btn btn-sm btn-outline" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}

interface AiDisclaimerProps {
  confidence?: 'low' | 'medium' | 'high';
}

export function AiDisclaimer({ confidence }: AiDisclaimerProps) {
  const label =
    confidence === 'high' ? 'confiance élevée'
    : confidence === 'medium' ? 'confiance modérée'
    : 'confiance faible';

  return (
    <div className="alert alert-ai" role="note" aria-label="Avertissement IA">
      <span className="ai-badge">✦ IA</span>
      <div>
        <p className="text-sm font-medium">Estimation IA — {label}</p>
        <p className="text-sm text-muted mt-2">
          Ces valeurs nutritionnelles sont des estimations générées automatiquement.
          Elles peuvent être inexactes. Vérifiez auprès d&apos;un professionnel de santé avant
          de prendre des décisions médicales ou nutritionnelles.
        </p>
      </div>
    </div>
  );
}
