import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Message } from '../types';
import { getPushTokenForUser, sendPushNotification } from './usePushNotifications';
import { DEMO_MODE, DEMO_MESSAGES } from '../lib/demoData';

const isDemo = (convId: string) => DEMO_MODE && convId.startsWith('demo-conv-');

export function useMessages(conversationId: string | undefined, currentUserId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    // ── Mode démo : charge instantanément sans Supabase ──────────────────────
    if (isDemo(conversationId)) {
      setMessages((DEMO_MESSAGES[conversationId] ?? []) as Message[]);
      setLoading(false);
      return;
    }

    // ── Mode réel ─────────────────────────────────────────────────────────────
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  }, [conversationId]);

  const markRead = useCallback(async () => {
    if (!conversationId || !currentUserId || isDemo(conversationId)) return;
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .is('read_at', null);
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages().then(markRead);

    // Pas de Realtime sur les conversations démo
    if (isDemo(conversationId)) return;

    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => {
          const incoming = payload.new as Message;
          if (prev.find(m => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
        if ((payload.new as Message).sender_id !== currentUserId) {
          supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', (payload.new as Message).id);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, currentUserId, fetchMessages, markRead]);

  const sendMessage = async (content: string, otherPartyId?: string): Promise<boolean> => {
    if (!conversationId || !currentUserId || !content.trim()) return false;
    setSending(true);

    // ── Mode démo : ajoute le message localement ──────────────────────────────
    if (isDemo(conversationId)) {
      const fakeMsg: Message = {
        id:              `demo-sent-${Date.now()}`,
        conversation_id: conversationId,
        sender_id:       currentUserId,
        content:         content.trim(),
        read_at:         null,
        created_at:      new Date().toISOString(),
      };
      setMessages(prev => [...prev, fakeMsg]);
      setSending(false);
      return true;
    }

    // ── Mode réel ─────────────────────────────────────────────────────────────
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id:       currentUserId,
      content:         content.trim(),
    });
    if (!error && otherPartyId) {
      getPushTokenForUser(otherPartyId).then(token => {
        if (token) sendPushNotification(token, '💬 Nouveau message', content.trim().slice(0, 80));
      });
    }
    setSending(false);
    return !error;
  };

  return { messages, loading, sending, sendMessage };
}
