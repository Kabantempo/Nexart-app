import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, ActivityIndicator, Image,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../stores/auth';
import { useEvents } from '../../hooks/useEvents';
import { usePublicCreators } from '../../hooks/usePublicCreators';
import { usePosts } from '../../hooks/usePosts';
import { useFollowedCreators } from '../../hooks/useFollow';
import PostCard from '../../components/PostCard';
import { SwipeCard, CardStat } from '../../components/ui/SwipeCard';
import { AppHeader } from '../../components/ui/AppHeader';
import { colors, spacing, typography, radius } from '../../constants/theme';

const TYPE_COLORS: Record<string, string> = {
  permanent: '#3B82F6', seasonal: '#F59E0B',
  popup: '#A855F7', salon: '#10B981', fair: '#EF4444',
};

const today     = new Date();
const inDays    = (d: string, n: number) => new Date(d) <= new Date(today.getTime() + n * 86400000);
const isOngoing = (e: any) => new Date(e.start_date) <= today && new Date(e.end_date) >= today;
const isSoon    = (e: any) => !isOngoing(e) && inDays(e.start_date, 14);
const isUpcoming= (e: any) => !isOngoing(e) && !isSoon(e) && new Date(e.start_date) > today;

function toCardProps(event: any, onPress: () => void) {
  const accent = TYPE_COLORS[event.event_type] ?? colors.primary;
  const stats: CardStat[] = [
    { icon: 'location-outline', label: event.city ?? '—' },
    { icon: 'calendar-outline', label: new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) },
    { icon: 'grid-outline',     label: `${event.stand_count ?? '?'} stands` },
  ];
  const images = event.cover_image
    ? [event.cover_image, ...(event.media ?? []).slice(0, 2)]
    : (event.media ?? []).slice(0, 3);
  return {
    title: event.title, subtitle: event.event_type,
    images: images.length ? images : ['', '', ''],
    stats, description: event.description ?? (event.discipline_tags ?? []).slice(0, 4).join(', '),
    accent, onPress,
  };
}

// ─── Section header ───────────────────────────────────────

function SectionTitle({ icon, title, count, onSeeAll }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string; count?: number; onSeeAll?: () => void;
}) {
  return (
    <View style={s.sectionHead}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={s.sectionTitle}>{title}</Text>
      {count !== undefined && count > 0 && (
        <View style={s.countBadge}><Text style={s.countText}>{count}</Text></View>
      )}
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={s.seeAll}>
          <Text style={s.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Horizontal event row ─────────────────────────────────

function EventRow({ events, onPressEvent }: { events: any[]; onPressEvent: (id: string) => void }) {
  const { width: W } = useWindowDimensions();
  const cardWidth = Math.min(W * 0.78, 300);
  if (!events.length) return null;
  return (
    <FlatList
      horizontal
      data={events}
      keyExtractor={e => e.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + spacing.md}
      decelerationRate="fast"
      contentContainerStyle={s.hRow}
      ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
      renderItem={({ item }) => (
        <SwipeCard {...toCardProps(item, () => onPressEvent(item.id))} />
      )}
    />
  );
}

// ─── Creator recommendation card ─────────────────────────

function CreatorChip({ creator, onPress }: { creator: any; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.creatorChip} onPress={onPress} activeOpacity={0.85}>
      {creator.avatar_url ? (
        <Image source={{ uri: creator.avatar_url }} style={s.creatorAvatar} />
      ) : (
        <View style={s.creatorAvatarFallback}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </View>
      )}
      <Text style={s.creatorName} numberOfLines={1}>{creator.full_name}</Text>
      <Text style={s.creatorDiscipline} numberOfLines={1}>
        {(creator.disciplines ?? []).slice(0, 1).join(', ') || '—'}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────

export default function FeedScreen() {
  const nav         = useNavigation<any>();
  const { profile } = useAuth();
  const followedIds = useFollowedCreators(profile?.id);
  const isCreator   = profile?.role === 'creator';
  const firstName   = profile?.full_name?.split(' ')[0] ?? '';

  const { events, loading: evLoad }    = useEvents({ limit: 20 });
  const { creators, loading: crLoad }  = usePublicCreators({ limit: 10 });
  const { posts, loading: postsLoad }  = usePosts({ limit: 20 });

  const ongoing  = useMemo(() => events.filter(isOngoing),  [events]);
  const soon     = useMemo(() => events.filter(isSoon),     [events]);
  const upcoming = useMemo(() => events.filter(isUpcoming), [events]);

  // Créateurs recommandés : ceux suivis d'abord, puis les autres
  const recommended = useMemo(() => [
    ...creators.filter(c => followedIds.includes(c.id)),
    ...creators.filter(c => !followedIds.includes(c.id)),
  ], [creators, followedIds]);

  const goEvent = (id: string) =>
    nav.navigate('Découvrir', { screen: 'PublicEventDetail', params: { eventId: id } });

  const loading = evLoad && crLoad && postsLoad;

  return (
    <View style={s.container}>
      <AppHeader
        showFavorites={!isCreator}
        showCreate={isCreator}
        onCreatePress={() => nav.navigate('CreatePost')}
      />

      {loading ? (
        <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Salutation */}
          {firstName ? (
            <View style={s.greeting}>
              <Text style={s.greetText}>Bonjour {firstName} 👋</Text>
            </View>
          ) : null}

          {/* ── En cours ── */}
          {ongoing.length > 0 && (
            <View style={s.section}>
              <SectionTitle icon="radio-button-on" title="En cours" count={ongoing.length} />
              <EventRow events={ongoing} onPressEvent={goEvent} />
            </View>
          )}

          {/* ── Cette semaine ── */}
          {soon.length > 0 && (
            <View style={s.section}>
              <SectionTitle icon="time-outline" title="Cette semaine" count={soon.length} />
              <EventRow events={soon} onPressEvent={goEvent} />
            </View>
          )}

          {/* ── À venir ── */}
          {upcoming.length > 0 && (
            <View style={s.section}>
              <SectionTitle
                icon="calendar-outline"
                title="À venir"
                count={upcoming.length}
                onSeeAll={() => nav.navigate('Marchés')}
              />
              <EventRow events={upcoming} onPressEvent={goEvent} />
            </View>
          )}

          {/* ── Artistes pour vous ── */}
          {recommended.length > 0 && (
            <View style={s.section}>
              <SectionTitle
                icon="sparkles-outline"
                title="Artistes pour vous"
                onSeeAll={() => nav.navigate('Découvrir', { screen: 'CreatorsList', params: {} })}
              />
              <FlatList
                horizontal
                data={recommended}
                keyExtractor={c => c.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.hRow}
                ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
                renderItem={({ item }) => (
                  <CreatorChip
                    creator={item}
                    onPress={() => nav.navigate('Découvrir', { screen: 'PublicCreatorProfile', params: { creatorId: item.id } })}
                  />
                )}
              />
            </View>
          )}

          {/* ── Posts des créateurs suivis ── */}
          {posts.length > 0 && (
            <View style={s.section}>
              <SectionTitle icon="newspaper-outline" title="Actualités" />
              {posts.map(post => <PostCard key={post.id} post={post} />)}
            </View>
          )}

          {/* Empty state si rien */}
          {!ongoing.length && !soon.length && !upcoming.length && !posts.length && (
            <View style={s.empty}>
              <View style={s.emptyIcon}><Ionicons name="sparkles-outline" size={28} color={colors.primary} /></View>
              <Text style={s.emptyTitle}>Votre fil est vide</Text>
              <Text style={s.emptySubtitle}>Découvrez des créateurs et des marchés pour personnaliser votre fil.</Text>
              <TouchableOpacity style={s.discoverBtn} onPress={() => nav.navigate('Découvrir')}>
                <Text style={s.discoverBtnText}>Explorer →</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:    { paddingBottom: spacing.xxl },

  greeting:  { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  greetText: { ...typography.h3, color: colors.text.primary, fontWeight: '700' },

  section:     { marginBottom: spacing.lg },
  sectionHead: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.xl, marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.label, color: colors.text.primary, fontWeight: '700', flex: 1 },
  countBadge:   { backgroundColor: colors.primary + '18', borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 2 },
  countText:    { ...typography.caption, color: colors.primary, fontWeight: '700', fontSize: 11 },
  seeAll:       { paddingHorizontal: spacing.xs },
  seeAllText:   { ...typography.caption, color: colors.primary, fontWeight: '600' },

  hRow: { paddingHorizontal: spacing.xl },

  // Creator chip
  creatorChip: {
    width: 96,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  creatorAvatar:         { width: 52, height: 52, borderRadius: 26, marginBottom: spacing.xs },
  creatorAvatarFallback: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },
  creatorName:       { ...typography.caption, color: colors.text.primary, fontWeight: '700', textAlign: 'center' },
  creatorDiscipline: { ...typography.caption, color: colors.text.secondary, textAlign: 'center', fontSize: 10 },

  // Empty
  empty:          { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyIcon:      { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary + '12', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyTitle:     { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
  emptySubtitle:  { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  discoverBtn:    { backgroundColor: colors.primary, borderRadius: radius.xl, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  discoverBtnText:{ ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
