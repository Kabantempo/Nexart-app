import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export interface Volunteer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface Shift {
  id: string;
  role: string | null;
  date: string | null;
  time: string | null;
  capacity: number;
  assigned: number;
}

export interface NewShift { role: string; date: string; time: string; capacity: number }

const message = (e: unknown) => (e instanceof Error ? e.message : 'Action impossible pour le moment.');

/** Bénévoles et créneaux d'un événement, via l'API du site (réservée à l'organisateur). */
export function useEventVolunteers(eventId: string) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [v, s] = await Promise.all([
        siteFetch(`/api/events/${eventId}/volunteers?limit=200`).then(r => r.json()),
        siteFetch(`/api/events/${eventId}/volunteers/shifts`).then(r => r.json()),
      ]);
      setVolunteers((v.data ?? []) as Volunteer[]);
      setShifts((Array.isArray(s) ? s : []) as Shift[]);
      setError(null);
    } catch {
      setError('Impossible de charger les bénévoles.');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await fetchAll();
      return null;
    } catch (e) {
      return message(e);
    }
  };

  return {
    volunteers,
    shifts,
    loading,
    error,
    addVolunteer: (v: { name: string; email?: string; phone?: string }) =>
      run(() => siteFetch(`/api/events/${eventId}/volunteers`, { method: 'POST', body: JSON.stringify(v) })),
    removeVolunteer: (id: string) =>
      run(() => siteFetch(`/api/events/${eventId}/volunteers/${id}`, { method: 'DELETE' })),
    addShift: (s: NewShift) =>
      run(() => siteFetch(`/api/events/${eventId}/volunteers/shifts`, { method: 'POST', body: JSON.stringify(s) })),
    refetch: fetchAll,
  };
}
