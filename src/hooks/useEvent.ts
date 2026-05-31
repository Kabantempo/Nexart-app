import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Event } from '../types';

interface EventWithOrganizer extends Event {
  organizer: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    organizer_profile: { organization_name: string } | null;
  };
}

export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<EventWithOrganizer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id (
          id, full_name, avatar_url,
          organizer_profile:organizer_profiles(organization_name)
        )
      `)
      .eq('id', eventId)
      .single();
    if (err) setError(err.message);
    else setEvent(data as EventWithOrganizer);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { event, loading, error };
}

export function useApplicationStatus(eventId: string, userId: string | undefined) {
  const [status, setStatus] = useState<'none' | 'pending' | 'accepted' | 'refused'>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !eventId) { setLoading(false); return; }
    supabase
      .from('applications')
      .select('status')
      .eq('event_id', eventId)
      .eq('creator_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setStatus((data?.status as any) ?? 'none');
        setLoading(false);
      });
  }, [eventId, userId]);

  return { status, loading };
}
