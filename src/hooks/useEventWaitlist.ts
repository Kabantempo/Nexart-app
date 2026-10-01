import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export interface WaitlistEntry {
  id: string;
  position: number;
  status: 'waiting' | 'promoted' | 'cancelled';
  created_at: string;
  profiles?: { id: string; full_name: string | null; avatar_url: string | null; email?: string | null } | null;
}

/**
 * Liste d'attente d'un événement. Passe par l'API du site : la promotion envoie
 * la notification, le push et l'e-mail, et renumérote la file.
 */
export function useEventWaitlist(eventId: string) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/events/${eventId}/waitlist`);
      const json = await res.json();
      setEntries((json.waitlist ?? []) as WaitlistEntry[]);
      setError(null);
    } catch {
      setError('Impossible de charger la liste d’attente.');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const act = async (id: string, method: 'PATCH' | 'DELETE') => {
    setBusyId(id);
    try {
      await siteFetch(`/api/events/${eventId}/waitlist`, {
        method,
        body: JSON.stringify({ waitlist_id: id }),
      });
      await fetchList();
      return null;
    } catch {
      return 'Action impossible pour le moment.';
    } finally {
      setBusyId(null);
    }
  };

  return {
    entries,
    waiting: entries.filter(e => e.status === 'waiting'),
    promoted: entries.filter(e => e.status === 'promoted'),
    loading,
    error,
    busyId,
    promote: (id: string) => act(id, 'PATCH'),
    remove: (id: string) => act(id, 'DELETE'),
    refetch: fetchList,
  };
}
