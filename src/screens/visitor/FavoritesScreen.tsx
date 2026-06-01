import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useFavorites } from '../../hooks/useFavorites';
import { colors, spacing, typography, radius } from '../../constants/theme';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const nav = useNavigation<any>();
  const { favEvents, favCreators, loading, refetch } = useFavorites(profile?.id);
  const [tab, setTab] = useState<'events' | 'creators'>('events');

  if (loading) return <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;

  return (
    <View style={s.container}>
      <Text style={s.title}>Favoris</Text>
      <View style={s.tabs}>
        {(['events', 'creators'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'events' ? `Marchés (${favEvents.length})` : `Créateurs (${favCreators.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'events' ? (
        <FlatList
          data={favEvents}
          keyExtractor={i => i.event_id}
          onRefresh={refetch}
          refreshing={loading}
          contentContainerStyle={s.list}
          renderItem={({ item }) => {
            const e = item.event;
            return (
              <TouchableOpacity style={s.card} onPress={() => nav.navigate('Découvrir', { screen: 'PublicEventDetail', params: { eventId: item.event_id } })}>
                <Text style={s.cardTitle}>{e?.title ?? '—'}</Text>
                <Text style={s.cardMeta}>{e?.city} · {e?.start_date ? new Date(e.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : ''}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={s.empty}>Aucun marché sauvegardé</Text>}
        />
      ) : (
        <FlatList
          data={favCreators}
          keyExtractor={i => i.creator_id}
          onRefresh={refetch}
          refreshing={loading}
          contentContainerStyle={s.list}
          renderItem={({ item }) => {
            const c = item.creator;
            const cp = Array.isArray(c?.creator_profile) ? c.creator_profile[0] : c?.creator_profile;
            return (
              <TouchableOpacity style={s.card} onPress={() => nav.navigate('Découvrir', { screen: 'PublicCreatorProfile', params: { creatorId: item.creator_id } })}>
                <Text style={s.cardTitle}>{c?.full_name ?? '—'}</Text>
                <Text style={s.cardMeta}>{(cp?.disciplines ?? []).slice(0, 2).join(' · ')}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={s.empty}>Aucun créateur sauvegardé</Text>}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title:     { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  tabs:      { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.md },
  tab:       { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText:   { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  tabTextActive: { color: colors.text.inverse, fontWeight: '700' },
  list:      { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  card:      { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardTitle: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  cardMeta:  { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  empty:     { ...typography.body, color: colors.text.secondary, textAlign: 'center', paddingTop: spacing.xxl },
});
