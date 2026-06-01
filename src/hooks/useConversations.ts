import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE, DEMO_CONVERSATIONS } from '../lib/demoData';

export interface ConversationSummary {
  id: string;
  event_id: string;
  creator_id: string;
  organizer_id: string;
  created_at: string;
  event: { id: string; title: string } | null;
  creator: { id: string; full_name: string; avatar_url: string | null } | null;
  organizer: { id: string; full_name: string; avatar_url: string | null } | null;
  last_message: { content: string; created_at: string; sender_id: string } | null;
  unread_count: number;
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    // ── Mode démo : affiche instantanément sans Supabase ─────────────────────
    if (DEMO_MODE) {
      setConversations(DEMO_CONVERSATIONS as unknown as ConversationSummary[]);
      setLoading(false);
      return;
    }

    const { data: convs } = await supabase
      .from('conversations')
      .select(`
        id, event_id, creator_id, organizer_id, created_at,
        event:events(id, title),
        creator:profiles!creator_id(id, full_name, avatar_url),
        organizer:profiles!organizer_id(id, full_name, avatar_url)
      `)
      .or(`creator_id.eq.${userId},organizer_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (!convs?.length) {
      if (DEMO_MODE) setConversations(DEMO_CONVERSATIONS as unknown as ConversationSummary[]);
      else setConversations([]);
      setLoading(false); return;
    }

    // Fetch last message per conversation
    const ids = convs.map(c => c.id);
    const { data: msgs } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at, sender_id, read_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: false });

    const lastMsg: Record<string, any> = {};
    const unread: Record<string, number> = {};
    for (const m of msgs ?? []) {
      if (!lastMsg[m.conversation_id]) lastMsg[m.conversation_id] = m;
      if (m.sender_id !== userId && !m.read_at) {
        unread[m.conversation_id] = (unread[m.conversation_id] ?? 0) + 1;
      }
    }

    const result = (convs as any[]).map(c => ({
      ...c,
      last_message: lastMsg[c.id] ?? null,
      unread_count: unread[c.id] ?? 0,
    }));

    // Sort by last message date
    result.sort((a, b) => {
      const ta = a.last_message?.created_at ?? a.created_at;
      const tb = b.last_message?.created_at ?? b.created_at;
      return tb.localeCompare(ta);
    });

    setConversations(result as ConversationSummary[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { conversations, loading, refetch: fetch };
}

export async function getOrCreateConversation(
  eventId: string,
  creatorId: string,
  organizerId: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('event_id', eventId)
    .eq('creator_id', creatorId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from('conversations')
    .insert({ event_id: eventId, creator_id: creatorId, organizer_id: organizerId })
    .select('id')
    .single();

  return created?.id ?? null;
}
