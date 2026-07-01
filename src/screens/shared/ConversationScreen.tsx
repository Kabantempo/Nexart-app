import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MessageStackParams } from '../../navigation/MessageStack';
import { useAuth } from '../../stores/auth';
import { useMessages } from '../../hooks/useMessages';
import { Message } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<MessageStackParams, 'Conversation'>;
  route: RouteProp<MessageStackParams, 'Conversation'>;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function MiniAvatar({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) {
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={s.miniAvatar} />;
  }
  return (
    <View style={s.miniAvatarFallback}>
      <Ionicons name="person" size={13} color={colors.primary} />
    </View>
  );
}

function Bubble({ msg, isOwn, otherAvatarUrl, otherName }: {
  msg: Message; isOwn: boolean; otherAvatarUrl?: string | null; otherName: string;
}) {
  return (
    <View style={[s.bubbleWrap, isOwn && s.bubbleWrapOwn]}>
      {!isOwn && (
        <MiniAvatar avatarUrl={otherAvatarUrl} name={otherName} />
      )}
      <View style={s.bubbleContent}>
        <View style={[s.bubble, isOwn ? s.bubbleOwn : s.bubbleOther]}>
          <Text style={[s.bubbleText, isOwn && s.bubbleTextOwn]}>{msg.content}</Text>
        </View>
        <Text style={[s.bubbleTime, isOwn && s.bubbleTimeOwn]}>
          {formatTime(msg.created_at)}{isOwn && msg.read_at ? '  ✓✓' : ''}
        </Text>
      </View>
    </View>
  );
}

export default function ConversationScreen({ navigation, route }: Props) {
  const { conversationId, eventTitle, otherPartyName, otherPartyId } = route.params;
  const { profile } = useAuth();
  const { messages, loading, sending, sendMessage } = useMessages(conversationId, profile?.id);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    await sendMessage(content, otherPartyId);
  };

  const QUICK_REPLIES = [
    'Bonjour, merci pour votre message !',
    'Je reviens vers vous rapidement.',
    'Votre profil est très intéressant !',
    'Pouvez-vous me donner plus de détails ?',
    'Je vous confirme votre place.',
    'Merci, à bientôt sur le marché !',
  ];

  const withDayHeaders: Array<Message | { type: 'day'; label: string; id: string }> = [];
  let lastDay = '';
  for (const msg of messages) {
    const day = msg.created_at.slice(0, 10);
    if (day !== lastDay) {
      withDayHeaders.push({ type: 'day', label: formatDay(msg.created_at), id: `day-${day}` });
      lastDay = day;
    }
    withDayHeaders.push(msg);
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={s.headerAvatar}>
          <Text style={s.headerAvatarText}>{otherPartyName[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={s.headerInfo}>
          <Text style={s.headerName} numberOfLines={1}>{otherPartyName}</Text>
          <Text style={s.headerEvent} numberOfLines={1}>{eventTitle}</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={withDayHeaders}
          keyExtractor={item => ('id' in item ? item.id : item.id)}
          contentContainerStyle={s.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if ('type' in item && item.type === 'day') {
              return (
                <View style={s.dayHeader}>
                  <Text style={s.dayLabel}>{item.label}</Text>
                </View>
              );
            }
            const msg = item as Message;
            return (
              <Bubble
                msg={msg}
                isOwn={msg.sender_id === profile?.id}
                otherAvatarUrl={(route.params as any).otherPartyAvatarUrl}
                otherName={otherPartyName}
              />
            );
          }}
          ListEmptyComponent={
            <View style={s.emptyChat}>
              <View style={s.emptyChatIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.text.secondary} />
              </View>
              <Text style={s.emptyChatText}>Démarrez la conversation</Text>
              <Text style={s.emptyChatSub}>Partagez les détails de votre stand, posez vos questions…</Text>
            </View>
          }
        />
      )}

      {/* Réponses rapides */}
      {messages.length === 0 && (
        <View>
          <FlatList
            horizontal
            data={QUICK_REPLIES}
            keyExtractor={i => i}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.quickList}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.quickChip} onPress={() => setText(item)} activeOpacity={0.7}>
                <Text style={s.quickChipText} numberOfLines={1}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Votre message…"
          placeholderTextColor={colors.text.secondary + '80'}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!text.trim() || sending) && s.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
          activeOpacity={0.8}
        >
          {sending
            ? <ActivityIndicator color={colors.text.inverse} size="small" />
            : <Text style={s.sendIcon}>↑</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn:         { padding: 4 },
  backText:        { ...typography.h2, color: colors.text.secondary },
  headerAvatar:    { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + '25', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText:{ ...typography.label, color: colors.primary, fontWeight: '700' },
  headerInfo:      { flex: 1 },
  headerName:      { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  headerEvent:     { ...typography.caption, color: colors.primary },

  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messageList: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, flexGrow: 1 },

  dayHeader: { alignItems: 'center', marginVertical: spacing.md },
  dayLabel:  { ...typography.caption, color: colors.text.secondary, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full },

  // Mini avatar next to message
  miniAvatar:         { width: 28, height: 28, borderRadius: 14, marginRight: spacing.xs, marginTop: 2, flexShrink: 0 },
  miniAvatarFallback: { width: 28, height: 28, borderRadius: 14, marginRight: spacing.xs, marginTop: 2, flexShrink: 0, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },

  bubbleWrap:    { marginBottom: spacing.sm, maxWidth: '82%', alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'flex-end' },
  bubbleWrapOwn: { alignSelf: 'flex-end', flexDirection: 'row' },
  bubbleContent: { flex: 1 },
  bubble:        { borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  bubbleOther:   { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 6 },
  bubbleOwn:     { backgroundColor: colors.primary, borderBottomRightRadius: 6,
                   shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  bubbleText:    { ...typography.body, color: colors.text.primary, lineHeight: 20 },
  bubbleTextOwn: { color: colors.text.inverse },
  bubbleTime:    { ...typography.caption, color: colors.text.secondary, marginTop: 3, paddingHorizontal: 2 },
  bubbleTimeOwn: { textAlign: 'right' },

  emptyChat:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: spacing.xl },
  emptyChatIcon:   { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyChatIconText: { fontSize: 24, color: colors.primary },
  emptyChatText:   { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
  emptyChatSub:    { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderTopWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1, ...typography.body, color: colors.text.primary,
    backgroundColor: colors.background, borderRadius: radius.xl,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    borderWidth: 1, borderColor: colors.border, maxHeight: 120,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  sendBtnDisabled: { backgroundColor: colors.border, shadowOpacity: 0 },
  sendIcon:        { ...typography.h3, color: colors.text.inverse, lineHeight: 24 },

  quickList:    { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.xs },
  quickChip: {
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '10', paddingHorizontal: spacing.md, paddingVertical: 7,
    maxWidth: 220,
  },
  quickChipText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});
