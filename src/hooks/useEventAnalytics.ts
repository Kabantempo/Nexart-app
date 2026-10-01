import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export interface EventStats {
  totalApplications: number;
  acceptedCount: number;
  pendingCount: number;
  refusedCount: number;
  fillRate: number;
  totalStands: number;
  acceptanceRate: number;
}

/** Statistiques de candidatures d'un événement, calculées par l'API du site. */
export function useEventAnalytics(eventId: string) {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/events/${eventId}/analytics`);
      setStats((await res.json()) as EventStats);
      setError(null);
    } catch {
      setError('Impossible de charger les statistiques.');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
