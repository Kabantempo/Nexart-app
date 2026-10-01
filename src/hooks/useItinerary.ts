import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export interface ItineraryEntry {
  id: string;
  label: string;
  region: string | null;
  city: string | null;
  start_date: string;
  end_date: string;
  is_public: boolean;
}

export interface NewEntry {
  label: string;
  region: string;
  city: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
}

const message = (e: unknown) => (e instanceof Error ? e.message : 'Action impossible pour le moment.');

/** Carnet de route d'un créateur (étapes à venir), via l'API du site. Une étape publique prévient les abonnés de la région. */
export function useItinerary(creatorId: string | undefined) {
  const [entries, setEntries] = useState<ItineraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!creatorId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await siteFetch(`/api/itinerary?creator_id=${creatorId}`);
      const json = await res.json();
      setEntries((json.itinerary ?? []) as ItineraryEntry[]);
      setError(null);
    } catch {
      setError('Impossible de charger votre carnet de route.');
    }
    setLoading(false);
  }, [creatorId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const add = async (e: NewEntry) => {
    try {
      await siteFetch('/api/itinerary', {
        method: 'POST',
        body: JSON.stringify({
          label: e.label.trim(),
          region: e.region.trim() || undefined,
          city: e.city.trim() || undefined,
          start_date: e.start_date,
          end_date: e.end_date,
          is_public: e.is_public,
        }),
      });
      await fetchList();
      return null;
    } catch (err) {
      return message(err);
    }
  };

  const remove = async (id: string) => {
    try {
      await siteFetch(`/api/itinerary?id=${id}`, { method: 'DELETE' });
      await fetchList();
      return null;
    } catch (err) {
      return message(err);
    }
  };

  return { entries, loading, error, add, remove, refetch: fetchList };
}
