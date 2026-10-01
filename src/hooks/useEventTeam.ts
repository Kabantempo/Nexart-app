import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export type TeamRole = 'co_organizer' | 'volunteer';

export interface TeamMember {
  id: string;
  user_id: string | null;
  role: string;
  joined_at: string | null;
  profiles?: { username: string | null; full_name: string | null; avatar_url: string | null } | null;
}

export const TEAM_ROLE_LABELS: Record<string, string> = {
  co_organizer: 'Co-organisateur',
  volunteer: 'Bénévole',
  admin: 'Administrateur',
  member: 'Membre',
  viewer: 'Lecture seule',
};

const message = (e: unknown) => (e instanceof Error ? e.message : 'Action impossible pour le moment.');

/** Équipe d'un événement, via l'API du site : l'invitation se fait par @pseudo. */
export function useEventTeam(eventId: string) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/events/${eventId}/team`);
      const json = await res.json();
      setMembers((Array.isArray(json) ? json : []) as TeamMember[]);
      setError(null);
    } catch {
      setError("Impossible de charger l'équipe.");
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await fetchList();
      return null;
    } catch (e) {
      return message(e);
    }
  };

  return {
    members,
    loading,
    error,
    invite: (username: string, role: TeamRole) =>
      run(() => siteFetch(`/api/events/${eventId}/team/invite`, {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), role }),
      })),
    remove: (memberId: string) =>
      run(() => siteFetch(`/api/events/${eventId}/team/${memberId}`, { method: 'DELETE' })),
    refetch: fetchList,
  };
}
