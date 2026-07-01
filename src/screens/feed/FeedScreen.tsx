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
import { AppHeader } from '../../components/ui/AppHeader';
import { MarketCard } from '../../components/ui/MarketCard';
import { CreatorCard } from '../../components/ui/CreatorCard';
import { CreationCard } from '../../components/ui/CreationCard';
import { colors, spacing, typography, radius } from '../../constants/theme';

const today     = new Date();
const inDays    = (d: string, n: number) => new Date(d) <= new Date(today.getTime() + n * 86400000);
const isOngoing = (e: any) => new Date(e.start_date) <= today && new Date(e.end_date) >= today;
const isSoon    = (e: any) => !isOngoing(e) && inDays(e.start_date, 14);
const isUpcoming= (e: any) => !isOngoing(e) && !isSoon(e) && new Date(e.start_date) > today;

function eventToMarketCard(event: any, onPress: () => void) {
  const dateStr = new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const subtitle = `${event.city ?? '—'} · ${dateStr}`;
  const coverImage = event.cover_image ?? (event.media ?? [])[0] ?? null;
  const discount = event.stand_price === 0 ? 'Gratuit' : null;
  return {
    id:            event.id,
    imageUrl:      coverImage,
    title:         event.title,
    subtitle,
    rating:        event.rating ?? 0,
    price:         event.stand_price ?? null,
    discountLabel: discount ?? undefined,
    onPress,
  };
}

// ─── Section header ───────────────────────────────────────

function SectionTitle({ icon, title, count, onSeeAll, onMap }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string; count?: number; onSeeAll?: () => void; onMap?: () => void;
}) {
  return (
    <View style={s.sectionHead}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={s.sectionTitle}>{title}</Text>
      {count !== undefined && count > 0 && (
        <View style={s.countBadge}><Text style={s.countText}>{count}</Text></View>
      )}
      <View style={s.sectionActions}>
        {onMap && (
          <TouchableOpacity onPress={onMap} style={s.mapBtn}>
            <Ionicons name="map-outline" size={13} color={colors.primary} />
            <Text style={s.mapBtnText}>Carte</Text>
          </TouchableOpacity>
        )}
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} style={s.seeAll}>
            <Text style={s.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Horizontal event row ─────────────────────────────────

function EventRow({ events, onPressEvent, isCreator = false }: { events: any[]; onPressEvent: (id: string) => void; isCreator?: boolean }) {
  const { width: W } = useWindowDimensions();
  const cardWidth = Math.min(W * 0.60, 220);
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
        <MarketCard
          {...eventToMarketCard(item, () => onPressEvent(item.id))}
          variant={isCreator ? 'creator' : 'visitor'}
        />
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
              <Text style={s.greetText}>Bonjour {firstName}</Text>
            </View>
          ) : null}

          {/* ── En cours ── */}
          {ongoing.length > 0 && (
            <View style={s.section}>
              <SectionTitle
                icon="radio-button-on" title="En cours" count={ongoing.length}
                onMap={() => nav.navigate('Découvrir', { screen: 'EventMap' })}
              />
              <EventRow events={ongoing} onPressEvent={goEvent} isCreator={isCreator} />
            </View>
          )}

          {/* ── Cette semaine ── */}
          {soon.length > 0 && (
            <View style={s.section}>
              <SectionTitle
                icon="time-outline" title="Cette semaine" count={soon.length}
                onMap={() => nav.navigate('Découvrir', { screen: 'EventMap' })}
              />
              <EventRow events={soon} onPressEvent={goEvent} isCreator={isCreator} />
            </View>
          )}

          {/* ── À venir ── */}
          {upcoming.length > 0 && (
            <View style={s.section}>
              <SectionTitle
                icon="calendar-outline" title="À venir" count={upcoming.length}
                onSeeAll={() => nav.navigate('Marchés')}
                onMap={() => nav.navigate('Découvrir', { screen: 'EventMap' })}
              />
              <EventRow events={upcoming} onPressEvent={goEvent} isCreator={isCreator} />
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
                  <MarketCard
                    id={item.id}
                    imageUrl={(item.portfolio_images ?? [])[0] ?? item.avatar_url ?? null}
                    title={item.full_name}
                    subtitle={`${item.disciplines?.[0] ?? 'Créateur'} · ${item.city ?? '—'}`}
                    rating={0}
                    discountLabel={item.siret_verified ? 'SIRET ✓' : undefined}
                    onPress={() => nav.navigate('Découvrir', { screen: 'PublicCreatorProfile', params: { creatorId: item.id } })}
                  />
                )}
              />
            </View>
          )}

          {/* ── Nouvelles créations ── */}
          {posts.length > 0 && (
            <View style={s.section}>
              <SectionTitle
                icon="color-palette-outline"
                title="Nouvelles créations"
                onSeeAll={() => nav.navigate('Découvrir', { screen: 'CreatorsList', params: {} })}
              />
              <FlatList
                horizontal
                data={posts}
                keyExtractor={p => p.id}
                showsHorizontalScrollIndicator={false}
                snapToInterval={Math.min(200, 200) + spacing.md}
                decelerationRate="fast"
                contentContainerStyle={s.hRow}
                ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                renderItem={({ item }) => <CreationCard post={item} />}
              />
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
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  mapBtn:       { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  mapBtnText:   { ...typography.caption, color: colors.primary, fontWeight: '600', fontSize: 11 },
  seeAll:       { paddingHorizontal: spacing.xs },
  seeAllText:   { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },

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
