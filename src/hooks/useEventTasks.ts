import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export interface EventTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee_id: string | null;
  deadline: string | null;
  profiles?: { full_name: string | null } | null;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Non démarrée',
  in_progress: 'En cours',
  completed: 'Terminée',
};

const message = (e: unknown) => (e instanceof Error ? e.message : 'Action impossible pour le moment.');

/** Tâches partagées d'un événement (collaboration), via l'API du site. */
export function useEventTasks(eventId: string) {
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/events/${eventId}/tasks`);
      const json = await res.json();
      setTasks((json.tasks ?? []) as EventTask[]);
      setError(null);
    } catch {
      setError('Impossible de charger les tâches.');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const run = async (fn: () => Promise<unknown>) => {
    try { await fn(); await fetchList(); return null; } catch (e) { return message(e); }
  };

  return {
    tasks,
    loading,
    error,
    add: (t: { title: string; description?: string; assignee_id?: string; deadline?: string }) =>
      run(() => siteFetch(`/api/events/${eventId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: t.title.trim(),
          description: t.description?.trim() || undefined,
          assignee_id: t.assignee_id || undefined,
          // Le site exige une date-heure ISO.
          deadline: t.deadline ? `${t.deadline}T12:00:00.000Z` : undefined,
        }),
      })),
    setStatus: (id: string, status: TaskStatus) => {
      const previous = tasks;
      setTasks(ts => ts.map(x => (x.id === id ? { ...x, status } : x)));
      return siteFetch(`/api/events/${eventId}/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
        .then(() => null)
        .catch(e => { setTasks(previous); return message(e); });
    },
    remove: (id: string) => run(() => siteFetch(`/api/events/${eventId}/tasks/${id}`, { method: 'DELETE' })),
    refetch: fetchList,
  };
}
