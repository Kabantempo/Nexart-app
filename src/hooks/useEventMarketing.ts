import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export interface MediaContact { name: string; email: string; outlet?: string }
export interface Deadline { date: string; task: string }

export interface MarketingPlan {
  press_release: string;
  media_contacts: MediaContact[];
  deadlines_calendar: Deadline[];
}

const EMPTY: MarketingPlan = { press_release: '', media_contacts: [], deadlines_calendar: [] };

/** Plan marketing d'un événement (communiqué, contacts presse, échéances), via l'API du site. */
export function useEventMarketing(eventId: string) {
  const [plan, setPlan] = useState<MarketingPlan>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/events/${eventId}/marketing`);
      const json = await res.json();
      setPlan({
        press_release: json.plan?.press_release ?? '',
        media_contacts: json.plan?.media_contacts ?? [],
        deadlines_calendar: json.plan?.deadlines_calendar ?? [],
      });
      setError(null);
    } catch {
      setError('Impossible de charger le plan marketing.');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const save = async (next: MarketingPlan) => {
    try {
      await siteFetch(`/api/events/${eventId}/marketing`, { method: 'POST', body: JSON.stringify(next) });
      setPlan(next);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Enregistrement impossible.';
    }
  };

  return { plan, loading, error, save, refetch: fetchPlan };
}
