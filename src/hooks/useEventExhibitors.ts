import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';
import { supabase } from '../lib/supabase';

export interface Exhibitor {
  id: string;
  exhibitor_id: string;
  status: string;
  submitted_at: string;
  proposed_stand: { size: string; price: number; note?: string } | null;
  stripe_payment_id: string | null;
  profiles: { full_name: string | null; email: string | null };
  /** Réponses au formulaire personnalisé, indexées par nom de champ. */
  answers: Record<string, unknown>;
}

export interface AnswerField { field_name: string; field_label: string }

/** Valeur d'une réponse telle qu'on l'affiche (case à cocher : Oui / Non). */
export const formatAnswer = (v: unknown): string =>
  typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : v === undefined || v === null ? '' : String(v);

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
  const [fields, setFields] = useState<AnswerField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/events/${eventId}/exhibitors`);
      const json = await res.json();
      // Champs et réponses : lecture directe, réservée à l'organisateur par les règles d'accès.
      const [f, r] = await Promise.all([
        supabase.from('event_exhibitor_fields').select('field_name, field_label').eq('event_id', eventId).order('field_order', { ascending: true }),
        supabase.from('event_exhibitor_responses').select('exhibitor_id, response_data').eq('event_id', eventId),
      ]);
      const byExhibitor = new Map<string, Record<string, unknown>>(
        (r.data ?? []).map((x: any) => [x.exhibitor_id as string, (x.response_data ?? {}) as Record<string, unknown>]),
      );
      setFields((f.data ?? []) as AnswerField[]);
      setExhibitors(((json.exhibitors ?? []) as Omit<Exhibitor, 'answers'>[]).map(e => ({ ...e, answers: byExhibitor.get(e.exhibitor_id) ?? {} })));
      setError(null);
    } catch {
      setError('Impossible de charger les exposants.');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  /** CSV de la liste telle qu'affichée à l'écran. */
  const toCsv = () => {
    const header = ['Nom', 'Email', 'Statut', 'Stand', 'Prix du stand', 'Candidature', ...fields.map(f => f.field_label)];
    const rows = exhibitors.map(e => [
      e.profiles.full_name,
      e.profiles.email,
      EXHIBITOR_STATUS_LABELS[e.status] ?? e.status,
      e.proposed_stand?.size ?? '',
      e.proposed_stand?.price ?? '',
      new Date(e.submitted_at).toISOString().slice(0, 10),
      ...fields.map(f => formatAnswer(e.answers[f.field_name])),
    ].map(csvCell).join(','));
    return [header.map(csvCell).join(','), ...rows].join('\n');
  };

  return { exhibitors, fields, loading, error, toCsv, refetch: fetchList };
}
