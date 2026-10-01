import { palette } from '../constants/theme';
import { ApplicationStatus, RejectionReason } from '../types';

/**
 * Libellés et couleurs des statuts de candidature.
 * Couvre les 7 valeurs de l'enum `application_status` en base —
 * `awaiting_payment`, `confirmed`, `stand_proposed` et `counter_proposed`
 * viennent du flux stands payants du site.
 */
export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string }
> = {
  pending:           { label: 'En attente',      color: palette.status.pending.text,  bg: palette.status.pending.bg },
  accepted:          { label: 'Acceptée',        color: palette.status.accepted.text, bg: palette.status.accepted.bg },
  refused:           { label: 'Refusée',         color: palette.status.refused.text,  bg: palette.status.refused.bg },
  awaiting_payment:  { label: 'Paiement requis', color: palette.feedback.warning.text, bg: palette.feedback.warning.bg },
  confirmed:         { label: 'Confirmée',       color: palette.status.paid.text,     bg: palette.status.paid.bg },
  stand_proposed:    { label: 'Stand proposé',   color: palette.status.new.text,      bg: palette.status.new.bg },
  counter_proposed:  { label: 'Contre-proposée', color: palette.violet.text,          bg: palette.violet.wash },
};

/** Statuts qui valent « la candidature a abouti » côté créateur. */
export const ACCEPTED_STATUSES: ApplicationStatus[] = ['accepted', 'awaiting_payment', 'confirmed'];

export const APPLICATION_STATUSES = Object.keys(APPLICATION_STATUS_CONFIG) as ApplicationStatus[];

/**
 * Compteurs par statut pour les onglets de filtre.
 * Couvre tous les statuts de l'enum, pas seulement ceux affichés :
 * un statut ajouté en base ne casse plus l'indexation.
 */
export function countByStatus(
  applications: Array<{ status: ApplicationStatus }>,
): Record<ApplicationStatus | 'all', number> {
  const counts = { all: applications.length } as Record<ApplicationStatus | 'all', number>;
  for (const status of APPLICATION_STATUSES) {
    counts[status] = applications.filter(a => a.status === status).length;
  }
  return counts;
}

/**
 * `applications.rejection_reason` est un JSONB `{ reasons: string[] }`.
 * Le site peut en écrire plusieurs ; on les rend en une seule phrase.
 * Tolère les anciennes lignes stockées en texte brut.
 */
export function formatRejectionReason(reason: RejectionReason | string | null | undefined): string | null {
  if (!reason) return null;
  if (typeof reason === 'string') return reason.trim() || null;
  if (!Array.isArray(reason.reasons) || reason.reasons.length === 0) return null;
  return reason.reasons.join(' · ');
}

/** Emballe une saisie libre au format attendu par la base. */
export function toRejectionReason(input: string | string[] | null): RejectionReason | null {
  const reasons = (Array.isArray(input) ? input : [input ?? ''])
    .map(r => r.trim())
    .filter(Boolean);
  return reasons.length ? { reasons } : null;
}
