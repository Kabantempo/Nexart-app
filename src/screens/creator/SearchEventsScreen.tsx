import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MarketStackParams } from '../../navigation/MarketStack';
import { supabase } from '../../lib/supabase';
import { Event, EventType, DISCIPLINE_TAGS } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = { navigation: StackNavigationProp<MarketStackParams, 'EventList'> };

const EVENT_TYPES: { label: string; value: EventType | 'all' }[] = [
  { label: 'Tous',        value: 'all' },
  { label: 'Pop-up',      value: 'popup' },
  { label: 'Salon',       value: 'salon' },
  { label: 'Foire',       value: 'fair' },
  { label: 'Permanent',   value: 'permanent' },
  { label: 'Saisonnier',  value: 'seasonal' },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── Event card ───────────────────────────────────────────────────────────────

function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{event.event_type}</Text>
        </View>
        {event.stand_price != null && (
          <Text style={styles.price}>
            {event.stand_price === 0 ? 'Gratuit' : `${event.stand_price} €`}
          </Text>
        )}
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>

      <Text style={styles.cardMeta}>
        📍 {event.city ?? '—'}
        {'  ·  '}
        🗓 {formatDate(event.start_date)}
        {event.start_date !== event.end_date ? ` → ${formatDate(event.end_date)}` : ''}
      </Text>

      {event.discipline_tags.length > 0 && (
        <View style={styles.tagRow}>
          {event.discipline_tags.slice(0, 4).map(t => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
          {event.discipline_tags.length > 4 && (
            <Text style={styles.tagMore}>+{event.discipline_tags.length - 4}</Text>
          )}
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.stands}>{event.stand_count} stands</Text>
        <Text style={styles.cardCta}>Voir →</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Discipline filter modal ──────────────────────────────────────────────────

function DisciplineFilterSheet({
  selected,
  onChange,
  onClose,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState(selected);

  const toggle = (tag: string) => {
    if (local.includes(tag)) setLocal(local.filter(t => t !== tag));
    else setLocal([...local, tag]);
  };

  return (
    <View style={sheet.overlay}>
      <View style={sheet.panel}>
        <Text style={sheet.title}>Filtrer par discipline</Text>
        <ScrollView contentContainerStyle={sheet.tagWrap}>
          {DISCIPLINE_TAGS.map(t => {
            const active = local.includes(t);
            return (
              <TouchableOpacity
                key={t}
                style={[sheet.tag, active && sheet.tagActive]}
                onPress={() => toggle(t)}
              >
                <Text style={[sheet.tagText, active && sheet.tagTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={sheet.actions}>
          <TouchableOpacity style={sheet.btnReset} onPress={() => { setLocal([]); onChange([]); onClose(); }}>
            <Text style={sheet.btnResetText}>Réinitialiser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sheet.btnApply} onPress={() => { onChange(local); onClose(); }}>
            <Text style={sheet.btnApplyText}>Appliquer ({local.length})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const sheet = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', zIndex: 100,
  },
  panel: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    padding: spacing.xl, maxHeight: '75%',
  },
  title: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingBottom: spacing.lg },
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { ...typography.caption, color: colors.text.secondary },
  tagTextActive: { color: colors.text.inverse, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btnReset: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  btnResetText: { ...typography.label, color: colors.text.secondary },
  btnApply: { flex: 2, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' },
  btnApplyText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SearchEventsScreen({ navigation }: Props) {
  const [search, setSearch]           = useState('');
  const [eventType, setEventType]     = useState<EventType | 'all'>('all');
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [showDisciplines, setShowDisciplines] = useState(false);

  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('start_date', { ascending: true })
      .limit(50);

    if (search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%`);
    }
    if (eventType !== 'all') {
      query = query.eq('event_type', eventType);
    }
    if (disciplines.length > 0) {
      query = query.overlaps('discipline_tags', disciplines);
    }

    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setEvents(data ?? []);
    setLoading(false);
  }, [search, eventType, disciplines]);

  useEffect(() => {
    const t = setTimeout(fetchEvents, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchEvents, search]);

  const disciplineLabel = disciplines.length > 0
    ? `Disciplines (${disciplines.length})`
    : 'Disciplines';

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Ville, nom du marché…"
          placeholderTextColor={colors.text.secondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeRow}
      >
        {EVENT_TYPES.map(t => (
          <TouchableOpacity
            key={t.value}
            style={[styles.chip, eventType === t.value && styles.chipActive]}
            onPress={() => setEventType(t.value)}
          >
            <Text style={[styles.chipText, eventType === t.value && styles.chipTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.chip, disciplines.length > 0 && styles.chipActive]}
          onPress={() => setShowDisciplines(true)}
        >
          <Text style={[styles.chipText, disciplines.length > 0 && styles.chipTextActive]}>
            {disciplineLabel}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Erreur : {error}</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={e => e.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>Aucun marché trouvé</Text>
              <Text style={styles.emptySubtitle}>Essayez d'élargir vos filtres</Text>
            </View>
          }
        />
      )}

      {/* Discipline filter sheet */}
      {showDisciplines && (
        <DisciplineFilterSheet
          selected={disciplines}
          onChange={setDisciplines}
          onClose={() => setShowDisciplines(false)}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, marginHorizontal: spacing.xl,
    borderRadius: radius.lg, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: colors.text.primary, paddingVertical: spacing.md },
  clearBtn: { color: colors.text.secondary, fontSize: 16, paddingLeft: spacing.sm },

  typeRow: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  chipTextActive: { color: colors.text.inverse, fontWeight: '700' },

  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  typeBadge: {
    backgroundColor: colors.primary + '20', borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  typeBadgeText: { ...typography.caption, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  price: { ...typography.label, color: colors.secondary, fontWeight: '700' },
  cardTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  cardMeta: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  tagText: { ...typography.caption, color: colors.text.secondary },
  tagMore: { ...typography.caption, color: colors.text.secondary, alignSelf: 'center' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  stands: { ...typography.caption, color: colors.text.secondary },
  cardCta: { ...typography.label, color: colors.primary, fontWeight: '600' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl },
  errorText: { ...typography.body, color: colors.error },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.text.secondary },
});
