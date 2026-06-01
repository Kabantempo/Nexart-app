import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useCreatorInquiries } from '../../hooks/useVisitorInquiry';
import { colors, spacing, typography, radius } from '../../constants/theme';

// For visitors: shows their sent inquiries
function useVisitorSentInquiries(visitorId: string | undefined) {
  const [inquiries, setInquiries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!visitorId) { setLoading(false); return; }
    const { supabase } = require('../../lib/supabase');
    supabase.from('visitor_inquiries')
      .select('*, creator:profiles!creator_id(id, full_name, avatar_url)')
      .eq('visitor_id', visitorId)
      .order('updated_at', { ascending: false })
      .then(({ data }: any) => { setInquiries(data ?? []); setLoading(false); });
  }, [visitorId]);

  return { inquiries, loading };
}

export default function VisitorMessagesScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const nav = useNavigation<any>();
  const { inquiries, loading } = useVisitorSentInquiries(profile?.id);

  if (loading) return <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;

  return (
    <View style={s.container}>
      <Text style={s.title}>Messages</Text>
      <FlatList
        data={inquiries}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => nav.navigate('Découvrir', { screen: 'PublicCreatorProfile', params: { creatorId: item.creator_id } })}
          >
            <View style={s.cardHeader}>
              <View style={s.avatar}><Text style={s.avatarText}>{item.creator?.full_name?.[0]?.toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.creatorName}>{item.creator?.full_name ?? '—'}</Text>
                <Text style={s.date}>{new Date(item.updated_at).toLocaleDateString('fr-FR')}</Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: item.reply ? '#7A9E8720' : '#8A8A8A20' }]}>
                <Text style={[s.statusText, { color: item.reply ? colors.secondary : colors.text.secondary }]}>
                  {item.reply ? 'Répondu' : 'En attente'}
                </Text>
              </View>
            </View>
            <Text style={s.msgPreview} numberOfLines={2}>{item.message}</Text>
            {item.reply && (
              <View style={s.replyBox}>
                <Text style={s.replyLabel}>Réponse</Text>
                <Text style={s.replyText} numberOfLines={2}>{item.reply}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyTitle}>Aucun message</Text>
            <Text style={s.emptySubtitle}>Contactez des créateurs depuis leur profil</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title:     { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  list:      { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  card:      { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardHeader:{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  avatar:    { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '25', alignItems: 'center', justifyContent: 'center' },
  avatarText:{ ...typography.label, color: colors.primary, fontWeight: '700' },
  creatorName: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  date:        { ...typography.caption, color: colors.text.secondary },
  statusBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  statusText:  { ...typography.caption, fontWeight: '700' },
  msgPreview:  { ...typography.caption, color: colors.text.secondary, lineHeight: 18 },
  replyBox:    { marginTop: spacing.sm, backgroundColor: colors.secondary + '10', borderRadius: radius.sm, padding: spacing.sm, borderLeftWidth: 2, borderColor: colors.secondary },
  replyLabel:  { ...typography.caption, color: colors.secondary, fontWeight: '700', marginBottom: 2 },
  replyText:   { ...typography.caption, color: colors.text.primary },
  empty:       { alignItems: 'center', paddingTop: spacing.xxl },
  emptyTitle:  { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.text.secondary },
});
