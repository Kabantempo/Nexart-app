import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEvents } from '../../hooks/useEvents';
import { usePublicCreators } from '../../hooks/usePublicCreators';
import { DISCIPLINE_TAGS, Event, PublicCreatorProfile } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

const TYPE_COLORS: Record<string, string> = {
  permanent: '#3B82F6', seasonal: '#F59E0B',
  popup: '#A855F7', salon: '#10B981', fair: '#EF4444',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── EventCard ────────────────────────────────────────────

function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  const accent = TYPE_COLORS[event.event_type] ?? colors.primary;
  return (
    <TouchableOpacity style={[s.eventCard, { borderLeftColor: accent }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.eventDateBadge, { backgroundColor: accent + '18' }]}>
        <Text style={[s.eventDateDay, { color: accent }]}>
          {new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit' })}
        </Text>
        <Text style={[s.eventDateMonth, { color: accent }]}>
          {new Date(event.start_date).toLocaleDateString('fr-FR', { month: 'short' })}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.eventTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={s.eventMeta}>{event.city ?? '—'}  ·  {formatDate(event.start_date)}</Text>
        {event.discipline_tags.length > 0 && (
          <Text style={s.eventTags} numberOfLines={1}>{event.discipline_tags.slice(0, 3).join(' · ')}</Text>
        )}
      </View>
      <View style={[s.eventArrow, { backgroundColor: accent + '15' }]}>
        <Text style={[s.eventArrowText, { color: accent }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── CreatorCard ──────────────────────────────────────────

function CreatorCard({ creator, onPress }: { creator: PublicCreatorProfile; onPress: () => void }) {
  const cover = creator.portfolio_images[0];
  return (
    <TouchableOpacity style={s.creatorCard} onPress={onPress} activeOpacity={0.85}>
      {cover
        ? <Image source={{ uri: cover }} style={s.creatorCover} />
        : <View style={[s.creatorCover, s.creatorCoverPlaceholder]}>
            <Text style={s.creatorCoverInitial}>{creator.full_name[0]?.toUpperCase()}</Text>
          </View>
      }
      <View style={s.creatorInfo}>
        <View style={s.creatorAvatarSmall}>
          {creator.avatar_url
            ? <Image source={{ uri: creator.avatar_url }} style={s.creatorAvatarImg} />
            : <Text style={s.creatorAvatarText}>{creator.full_name[0]?.toUpperCase()}</Text>
          }
        </View>
        <Text style={s.creatorName} numberOfLines={1}>{creator.full_name}</Text>
        <Text style={s.creatorDisciplines} numberOfLines={1}>{creator.disciplines.slice(0, 2).join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Section header ───────────────────────────────────────

function SectionHeader({ title, linkLabel, onLink }: { title: string; linkLabel?: string; onLink?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionAccent} />
      <Text style={s.sectionTitle}>{title}</Text>
      {linkLabel && onLink && (
        <TouchableOpacity onPress={onLink} style={s.sectionLinkBtn}>
          <Text style={s.sectionLink}>{linkLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────

export default function DiscoverHomeScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const [search, setSearch]     = useState('');
  const [discipline, setDiscipline] = useState('');

  const { events, loading: evLoading }     = useEvents({ limit: 8 });
  const { creators, loading: crLoading }   = usePublicCreators({ limit: 10 });

  const filteredEvents = search
    ? events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || (e.city ?? '').toLowerCase().includes(search.toLowerCase()))
    : events;

  return (
    <ScrollView style={s.container} contentContainerStyle={[s.content, { paddingTop: insets.top + spacing.sm }]} showsVerticalScrollIndicator={false}>

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
      </View>

      {/* Discipline chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
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

      {/* Events */}
      <SectionHeader
        title="Prochains marchés"
        linkLabel="Carte →"
        onLink={() => nav.navigate('EventMap')}
      />
      {evLoading
        ? <ActivityIndicator color={colors.primary} style={{ marginBottom: spacing.xl }} />
        : filteredEvents.map(e => (
            <EventCard key={e.id} event={e} onPress={() => nav.navigate('PublicEventDetail', { eventId: e.id })} />
          ))
      }

      {/* Creators */}
      <SectionHeader
        title="Créateurs à découvrir"
        linkLabel="Voir tout"
        onLink={() => nav.navigate('CreatorsList', {})}
      />
      {crLoading
        ? <ActivityIndicator color={colors.primary} />
        : (
          <View style={s.creatorGrid}>
            {creators.map(c => (
              <CreatorCard key={c.id} creator={c} onPress={() => nav.navigate('PublicCreatorProfile', { creatorId: c.id })} />
            ))}
          </View>
        )
      }

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { padding: spacing.xl, paddingTop: spacing.xxl },

  hero:     { marginBottom: spacing.xl },
  logo:     { ...typography.h1, color: colors.primary, fontSize: 38, fontWeight: '700', letterSpacing: -1 },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: 4 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.md,
  },
  searchIconText: { fontSize: 15, color: colors.text.secondary, marginRight: spacing.sm },
  searchInput:    { flex: 1, ...typography.body, color: colors.text.primary, paddingVertical: 14 },

  chipRow:      { gap: spacing.xs, paddingBottom: spacing.lg },
  chip:         { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive:   { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:     { ...typography.caption, color: colors.text.secondary },
  chipTextActive: { color: colors.text.inverse, fontWeight: '700' },

  sectionHeader:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.sm },
  sectionAccent:  { width: 3, height: 16, borderRadius: 2, backgroundColor: colors.primary },
  sectionTitle:   { ...typography.h3, color: colors.text.primary, fontWeight: '600', flex: 1 },
  sectionLinkBtn: { paddingVertical: 4, paddingHorizontal: spacing.sm },
  sectionLink:    { ...typography.caption, color: colors.primary, fontWeight: '600' },

  eventCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl, padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, borderLeftWidth: 3,
    gap: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  eventDateBadge: { width: 44, alignItems: 'center', borderRadius: radius.md, paddingVertical: spacing.xs },
  eventDateDay:   { ...typography.h3, fontWeight: '700', lineHeight: 22 },
  eventDateMonth: { ...typography.caption, textTransform: 'uppercase', fontSize: 10 },
  eventTitle:     { ...typography.label, color: colors.text.primary, fontWeight: '700', marginBottom: 2 },
  eventMeta:      { ...typography.caption, color: colors.text.secondary },
  eventTags:      { ...typography.caption, color: colors.primary, marginTop: 2 },
  eventArrow:     { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventArrowText: { fontSize: 18, fontWeight: '300', marginTop: -1 },

  creatorGrid:             { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  creatorCard:             { width: '47%', backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  creatorCover:            { width: '100%', height: 110 },
  creatorCoverPlaceholder: { backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  creatorCoverInitial:     { fontSize: 32, color: colors.primary + '60' },
  creatorInfo:             { padding: spacing.sm },
  creatorAvatarSmall:      { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary + '25', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  creatorAvatarImg:        { width: 30, height: 30, borderRadius: 15 },
  creatorAvatarText:       { ...typography.caption, color: colors.primary, fontWeight: '700' },
  creatorName:             { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  creatorDisciplines:      { ...typography.caption, color: colors.text.secondary },
});
