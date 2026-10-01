import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export type ChecklistType = 'salon' | 'popup' | 'other';

export interface ChecklistItem {
  title: string;
  description: string;
  completed?: boolean;
  category?: string;
}

export const CHECKLIST_TYPE_LABELS: Record<ChecklistType, string> = {
  salon: 'Salon',
  popup: 'Pop-up',
  other: 'Autre',
};

const message = (e: unknown) => (e instanceof Error ? e.message : 'Action impossible pour le moment.');

/** Checklist d'organisation d'un événement, via l'API du site (modèles par type d'événement). */
export function useEventChecklist(eventId: string) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [type, setType] = useState<ChecklistType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/events/${eventId}/checklists`);
      const json = await res.json();
      setItems((json.checklist?.items ?? []) as ChecklistItem[]);
      setType((json.checklist?.checklist_type ?? null) as ChecklistType | null);
      setError(null);
    } catch {
      setError('Impossible de charger la checklist.');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const initialize = async (t: ChecklistType) => {
    try {
      await siteFetch(`/api/events/${eventId}/checklists`, { method: 'POST', body: JSON.stringify({ checklist_type: t }) });
      await fetchList();
      return null;
    } catch (e) {
      return message(e);
    }
  };

  /** Mise à jour optimiste, annulée si le serveur refuse. */
  const save = async (next: ChecklistItem[]) => {
    const previous = items;
    setItems(next);
    try {
      await siteFetch(`/api/events/${eventId}/checklists`, { method: 'PATCH', body: JSON.stringify({ items: next }) });
      return null;
    } catch (e) {
      setItems(previous);
      return message(e);
    }
  };

  const done = items.filter(i => i.completed).length;

  return {
    items,
    type,
    exists: type !== null,
    done,
    percent: items.length ? Math.round((done / items.length) * 100) : 0,
    loading,
    error,
    initialize,
    toggle: (index: number) => save(items.map((it, i) => (i === index ? { ...it, completed: !it.completed } : it))),
    add: (title: string) => save([...items, { title: title.trim(), description: '', completed: false }]),
    remove: (index: number) => save(items.filter((_, i) => i !== index)),
    refetch: fetchList,
  };
}
