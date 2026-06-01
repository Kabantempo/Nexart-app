import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useFeed, FeedItem } from '../../hooks/useFeed';
import { useFollowedCreators } from '../../hooks/useFollow';
import PostCard from '../../components/PostCard';
import { colors, spacing, typography, radius } from '../../constants/theme';

function EventFeedCard({ event }: { event: any }) {
  const nav = useNavigation<any>();
  return (
    <TouchableOpacity
      style={s.eventCard}
      onPress={() => nav.navigate('Découvrir', { screen: 'PublicEventDetail', params: { eventId: event.id } })}
      activeOpacity={0.8}
    >
      <View style={s.eventTag}><Text style={s.eventTagText}>Marché à venir</Text></View>
      <Text style={s.eventTitle} numberOfLines={2}>{event.title}</Text>
      <Text style={s.eventMeta}>
        📍 {event.city ?? '—'}  ·  {new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
      </Text>
      {event.discipline_tags?.length > 0 && (
        <Text style={s.eventDisciplines}>{event.discipline_tags.slice(0, 3).join(' · ')}</Text>
      )}
      <Text style={s.eventCta}>Voir le marché →</Text>
    </TouchableOpacity>
  );
}

function renderItem({ item }: { item: FeedItem }) {
  if (item.type === 'post')  return <PostCard post={item.data} />;
  if (item.type === 'event') return <EventFeedCard event={item.data} />;
  return null;
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const nav = useNavigation<any>();
  const followedIds = useFollowedCreators(profile?.id);
  const { items, loading, refetch } = useFeed({
    userId:      profile?.id,
    followedIds,
  });

  const isCreator = profile?.role === 'creator';

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.logo}>Nexart</Text>
        {isCreator && (
          <TouchableOpacity style={s.createBtn} onPress={() => nav.navigate('CreatePost')}>
            <Text style={s.createBtnText}>+ Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => `${item.type}-${item.type === 'post' ? item.data.id : item.data.id}-${i}`}
          renderItem={renderItem}
          onRefresh={refetch}
          refreshing={loading}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyTitle}>Votre fil est vide</Text>
              <Text style={s.emptySubtitle}>
                {isCreator
                  ? 'Suivez des créateurs pour voir leurs posts ici, ou créez votre premier post.'
                  : 'Suivez des créateurs depuis leur profil pour voir leur actualité ici.'}
              </Text>
              <TouchableOpacity
                style={s.discoverBtn}
                onPress={() => nav.navigate('Découvrir', { screen: 'CreatorsList', params: {} })}
              >
                <Text style={s.discoverBtnText}>Découvrir des créateurs →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.md, borderBottomWidth: 1, borderColor: colors.border },
  logo:      { ...typography.h2, color: colors.primary },
  createBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 7 },
  createBtnText: { ...typography.caption, color: colors.text.inverse, fontWeight: '700' },

  eventCard: { backgroundColor: colors.surface, margin: spacing.xl, marginBottom: 0, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.secondary + '40', borderLeftWidth: 3, borderLeftColor: colors.secondary },
  eventTag:  { backgroundColor: colors.secondary + '20', borderRadius: radius.sm, alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, marginBottom: spacing.xs },
  eventTagText: { ...typography.caption, color: colors.secondary, fontWeight: '700', fontSize: 10 },
  eventTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  eventMeta:  { ...typography.caption, color: colors.text.secondary, marginBottom: 2 },
  eventDisciplines: { ...typography.caption, color: colors.primary, marginBottom: spacing.sm },
  eventCta:   { ...typography.caption, color: colors.secondary, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyTitle:    { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
  emptySubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  discoverBtn:   { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  discoverBtnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
