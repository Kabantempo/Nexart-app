import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export interface Exhibitor {
  id: string;
  exhibitor_id: string;
  status: string;
  submitted_at: string;
  proposed_stand: { size: string; price: number; note?: string } | null;
  stripe_payment_id: string | null;
  profiles: { full_name: string | null; email: string | null };
}

export const EXHIBITOR_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  approved: 'Accepté',
  rejected: 'Refusé',
  confirmed: 'Confirmé',
  awaiting_payment: 'Paiement attendu',
  stand_proposed: 'Stand proposé',
  counter_proposed: 'Contre-proposition',
};

const csvCell = (v: unknown) => {
  const s = String(v ?? '');
  // Préfixe anti-injection de formule, comme l'export du site.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** Exposants d'un événement : candidatures enrichies de l'e-mail, via l'API du site. */
export function useEventExhibitors(eventId: string) {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/events/${eventId}/exhibitors`);
      const json = await res.json();
      setExhibitors((json.exhibitors ?? []) as Exhibitor[]);
      setError(null);
    } catch {
      setError('Impossible de charger les exposants.');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  /** CSV de la liste telle qu'affichée à l'écran. */
  const toCsv = () => {
    const header = ['Nom', 'Email', 'Statut', 'Stand', 'Prix du stand', 'Candidature'];
    const rows = exhibitors.map(e => [
      e.profiles.full_name,
      e.profiles.email,
      EXHIBITOR_STATUS_LABELS[e.status] ?? e.status,
      e.proposed_stand?.size ?? '',
      e.proposed_stand?.price ?? '',
      new Date(e.submitted_at).toISOString().slice(0, 10),
    ].map(csvCell).join(','));
    return [header.map(csvCell).join(','), ...rows].join('\n');
  };

  return { exhibitors, loading, error, toCsv, refetch: fetchList };
}
