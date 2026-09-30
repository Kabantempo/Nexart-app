import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Notification } from '../types';

/** Notifications in-app — table `notifications` (RLS : uniquement les siennes). */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    setNotifications((data ?? []) as Notification[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id: string) => {
    const now = new Date().toISOString();
    await supabase.from('notifications').update({ read_at: now }).eq('id', id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read_at: now } : n)));
  };

  const markAllRead = async () => {
    if (!userId) return;
    const now = new Date().toISOString();
    await supabase.from('notifications').update({ read_at: now })
      .eq('user_id', userId).is('read_at', null);
    setNotifications(prev => prev.map(n => (n.read_at ? n : { ...n, read_at: now })));
  };

  return {
    notifications,
    unread: notifications.filter(n => n.read_at === null).length,
    loading,
    markRead,
    markAllRead,
    refetch: fetch,
  };
}
