import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  message: string;
  status: 'draft' | 'sent' | string;
  created_at: string | null;
  sent_at: string | null;
}

export interface SendResult {
  error: string | null;
  sent: number;
}

const message = (e: unknown) => (e instanceof Error ? e.message : 'Action impossible pour le moment.');

/**
 * Campagnes e-mail d'un événement, via l'API du site. L'envoi (PATCH) part vers
 * les exposants approuvés et n'est pas annulable.
 */
export function useEventCampaigns(eventId: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/events/${eventId}/campaigns?limit=100`);
      const json = await res.json();
      setCampaigns((json.data ?? []) as Campaign[]);
      setError(null);
    } catch {
      setError('Impossible de charger les campagnes.');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const create = async (title: string, subject: string, body: string) => {
    try {
      await siteFetch(`/api/events/${eventId}/campaigns`, {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), subject: subject.trim(), message: body.trim() }),
      });
      await fetchList();
      return null;
    } catch (e) {
      return message(e);
    }
  };

  /** Le site répond 200 avec `error` et `sent: 0` quand aucun exposant approuvé n'a d'e-mail. */
  const send = async (campaignId: string): Promise<SendResult> => {
    try {
      const res = await siteFetch(`/api/events/${eventId}/campaigns`, {
        method: 'PATCH',
        body: JSON.stringify({ campaign_id: campaignId }),
      });
      const json = await res.json();
      await fetchList();
      return { error: json.error ?? null, sent: Number(json.sent ?? 0) };
    } catch (e) {
      return { error: message(e), sent: 0 };
    }
  };

  return { campaigns, loading, error, create, send, refetch: fetchList };
}
