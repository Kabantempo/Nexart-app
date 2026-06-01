import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEvents } from '../../hooks/useEvents';
import { usePublicCreators } from '../../hooks/usePublicCreators';
import { DISCIPLINE_TAGS, Event, PublicCreatorProfile } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { SwipeCard, CardStat } from '../../components/ui/SwipeCard';
import { HorizontalCardList } from '../../components/ui/HorizontalCardList';

const TYPE_COLORS: Record<string, string> = {
  permanent: '#3B82F6', seasonal: '#F59E0B',
  popup: '#A855F7', salon: '#10B981', fair: '#EF4444',
};

const TYPE_LABELS: Record<string, string> = {
  permanent: 'Permanent', seasonal: 'Saisonnier',
  popup: 'Pop-up', salon: 'Salon', fair: 'Foire',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function eventToCardProps(event: Event, onPress: () => void) {
  const accent = TYPE_COLORS[event.event_type] ?? colors.primary;
  const stats: CardStat[] = [
    { icon: 'location-outline',  label: event.city ?? '—' },
    { icon: 'calendar-outline',  label: formatDate(event.start_date) },
    { icon: 'grid-outline',      label: `${event.stand_count} stands` },
  ];
  if (event.stand_price != null) {
    stats.push({
      icon: 'pricetag-outline',
      label: event.stand_price === 0 ? 'Gratuit' : `${event.stand_price} €`,
    });
  }
  const images = event.cover_image
    ? [event.cover_image, ...(event.media ?? []).slice(0, 2)]
    : (event.media ?? []).slice(0, 3);

  return {
    title:       event.title,
    subtitle:    TYPE_LABELS[event.event_type],
    images:      images.length > 0 ? images : ['', '', ''],
    stats,
    description: event.description ?? event.discipline_tags.join(', '),
    accent,
    onPress,
  };
}

function creatorToCardProps(creator: PublicCreatorProfile, onPress: () => void) {
  const stats: CardStat[] = [
    { icon: 'location-outline', label: creator.city ?? '—' },
    { icon: 'brush-outline',    label: creator.disciplines.slice(0, 2).join(', ') || '—' },
  ];
  if (creator.siret_verified)    stats.push({ icon: 'checkmark-circle-outline', label: 'SIRET' });
  if (creator.insurance_verified) stats.push({ icon: 'shield-checkmark-outline', label: 'Assuré' });

  const images = [
    creator.avatar_url ?? '',
    ...(creator.portfolio_images ?? []).slice(0, 2),
  ];

  return {
    title:       creator.full_name,
    subtitle:    creator.disciplines[0] ?? 'Créateur',
    images,
    stats,
    description: creator.bio ?? creator.disciplines.join(' · '),
    accent:      colors.secondary,
    onPress,
  };
}

export default function DiscoverHomeScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const [search, setSearch]         = useState('');
  const [discipline, setDiscipline] = useState('');

  const { events, loading: evLoading }   = useEvents({ limit: 10 });
  const { creators, loading: crLoading } = usePublicCreators({ limit: 8 });

  const filteredEvents = search
    ? events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.city ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : events;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[s.content, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.hero}>
        <Text style={s.logo}>Nexart</Text>
        <Text style={s.subtitle}>Marchés artisanaux & créateurs indépendants</Text>
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Text style={s.searchIconText}>◎</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Ville, marché, discipline…"
          placeholderTextColor={colors.text.secondary + '80'}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={s.clearBtn}>
            <Text style={s.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Discipline chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipRow}
      >
        {DISCIPLINE_TAGS.slice(0, 12).map(tag => (
          <TouchableOpacity
            key={tag}
            style={[s.chip, discipline === tag && s.chipActive]}
            onPress={() => {
              setDiscipline(p => p === tag ? '' : tag);
              nav.navigate('CreatorsList', { discipline: tag });
            }}
          >
            <Text style={[s.chipText, discipline === tag && s.chipTextActive]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Événements — swipe horizontal */}
      {evLoading ? (
        <View style={s.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={s.loadingText}>Chargement des marchés…</Text>
        </View>
      ) : (
        <HorizontalCardList
          title="Prochains marchés"
          seeAllLabel="Carte →"
          onSeeAll={() => nav.navigate('EventMap')}
          data={filteredEvents}
          keyExtractor={e => e.id}
          emptyText="Aucun marché disponible"
          renderCard={(event) => (
            <SwipeCard
              {...eventToCardProps(event, () => nav.navigate('PublicEventDetail', { eventId: event.id }))}
            />
          )}
        />
      )}

      {/* Créateurs — swipe horizontal */}
      {crLoading ? (
        <View style={s.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={s.loadingText}>Chargement des créateurs…</Text>
        </View>
      ) : (
        <HorizontalCardList
          title="Créateurs à découvrir"
          seeAllLabel="Voir tout"
          onSeeAll={() => nav.navigate('CreatorsList', {})}
          data={creators}
          keyExtractor={c => c.id}
          emptyText="Aucun créateur trouvé"
          renderCard={(creator) => (
            <SwipeCard
              {...creatorToCardProps(creator, () => nav.navigate('PublicCreatorProfile', { creatorId: creator.id }))}
            />
          )}
        />
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { paddingBottom: spacing.xxl },

  hero:     { marginBottom: spacing.xl, paddingHorizontal: spacing.xl },
  logo:     { ...typography.h1, color: colors.primary, fontSize: 38, fontWeight: '700', letterSpacing: -1 },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: 4 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xl,
  },
  searchIconText: { fontSize: 15, color: colors.text.secondary, marginRight: spacing.sm },
  searchInput:    { flex: 1, ...typography.body, color: colors.text.primary, paddingVertical: 14 },
  clearBtn:       { padding: spacing.sm },
  clearText:      { color: colors.text.secondary, fontSize: 14 },

  chipRow:      { gap: spacing.xs, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
  chip:         { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive:   { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:     { ...typography.caption, color: colors.text.secondary },
  chipTextActive: { color: colors.text.inverse, fontWeight: '700' },

  loadingRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  loadingText: { ...typography.body, color: colors.text.secondary },
});
