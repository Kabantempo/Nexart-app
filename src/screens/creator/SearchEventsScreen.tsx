import React, { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, ScrollView,
  Image, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MarketStackParams } from '../../navigation/MarketStack';
import { supabase } from '../../lib/supabase';
import { Event, EventType, DISCIPLINE_TAGS } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = { navigation: StackNavigationProp<MarketStackParams, 'EventList'> };
type BudgetPreset = 'all' | 'free' | 'under50' | '50to150' | 'over150';
type DatePreset   = 'all' | 'weekend' | 'month' | 'soon';


const FRENCH_REGIONS = [
  'Auvergne-Rhône-Alpes','Bourgogne-Franche-Comté','Bretagne',
  'Centre-Val de Loire','Corse','Grand Est','Hauts-de-France',
  'Île-de-France','Normandie','Nouvelle-Aquitaine','Occitanie',
  'Pays de la Loire',"Provence-Alpes-Côte d'Azur",
];

const BUDGET_OPTIONS: { label: string; short: string; value: BudgetPreset }[] = [
  { label: 'Tous les budgets', short: 'Budget',   value: 'all' },
  { label: 'Gratuit',          short: 'Gratuit',  value: 'free' },
  { label: 'Moins de 50 €',   short: '< 50 €',   value: 'under50' },
  { label: '50 – 150 €',       short: '50–150 €', value: '50to150' },
  { label: 'Plus de 150 €',   short: '> 150 €',  value: 'over150' },
];

const DATE_OPTIONS: { label: string; short: string; value: DatePreset }[] = [
  { label: 'Toutes les dates', short: 'Date',         value: 'all' },
  { label: 'Ce week-end',      short: 'Ce week-end',  value: 'weekend' },
  { label: 'Ce mois-ci',       short: 'Ce mois',      value: 'month' },
  { label: 'Prochainement',    short: 'Bientôt',      value: 'soon' },
];

const EVENT_TYPES: { label: string; icon: string; value: EventType | 'all' }[] = [
  { label: 'Tous',       icon: '✦', value: 'all' },
  { label: 'Pop-up',     icon: '⚡', value: 'popup' },
  { label: 'Salon',      icon: '🏛', value: 'salon' },
  { label: 'Foire',      icon: '🎪', value: 'fair' },
  { label: 'Permanent',  icon: '🏠', value: 'permanent' },
  { label: 'Saisonnier', icon: '🌿', value: 'seasonal' },
];

const TYPE_CONFIG: Record<string, { color: string; gradient: [string, string] }> = {
  permanent:  { color: '#3B82F6', gradient: ['#1D4ED8', '#3B82F6'] },
  seasonal:   { color: '#F59E0B', gradient: ['#D97706', '#FBBF24'] },
  popup:      { color: '#A855F7', gradient: ['#7C3AED', '#A855F7'] },
  salon:      { color: '#10B981', gradient: ['#059669', '#10B981'] },
  fair:       { color: '#EF4444', gradient: ['#DC2626', '#F87171'] },
};

const DEFAULT_CONFIG = { color: colors.primary, gradient: ['#4F46E5', '#6366F1'] as [string, string] };

function toIso(d: Date) { return d.toISOString().split('T')[0]; }

function getDateRange(p: DatePreset) {
  if (p === 'all') return null;
  const t = new Date();
  if (p === 'weekend') {
    const day = t.getDay();
    const sat = new Date(t); sat.setDate(t.getDate() + ((6 - day + 7) % 7 || 7));
    const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
    return { from: toIso(sat), to: toIso(sun) };
  }
  if (p === 'month') {
    return { from: toIso(t), to: toIso(new Date(t.getFullYear(), t.getMonth() + 1, 0)) };
  }
  const in30 = new Date(t); in30.setDate(t.getDate() + 30);
  return { from: toIso(t), to: toIso(in30) };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function isNew(d: string) {
  return (Date.now() - new Date(d).getTime()) < 7 * 24 * 3600 * 1000;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  const cfg = TYPE_CONFIG[event.event_type] ?? DEFAULT_CONFIG;
  const multiDay = event.start_date !== event.end_date;

  return (
    <TouchableOpacity style={card.wrap} onPress={onPress} activeOpacity={0.92}>
      {/* Header visuel */}
      <View style={card.header}>
        {event.cover_image ? (
          <Image source={{ uri: event.cover_image }} style={card.coverImg} resizeMode="cover" />
        ) : (
          <View style={[card.gradient, { backgroundColor: cfg.color }]}>
            <View style={card.gradientOverlay} />
            <Text style={card.gradientLabel}>{event.title.slice(0, 2).toUpperCase()}</Text>
          </View>
        )}

        {/* Badges header */}
        <View style={card.headerBadges}>
          <View style={[card.typeBadge, { backgroundColor: cfg.color }]}>
            <Text style={card.typeBadgeText}>{event.event_type.toUpperCase()}</Text>
          </View>
          {event.stand_price != null && (
            <View style={card.priceBadge}>
              <Text style={card.priceBadgeText}>
                {event.stand_price === 0 ? 'Gratuit' : `${event.stand_price} €`}
              </Text>
            </View>
          )}
          {isNew(event.created_at) && (
            <View style={card.newBadge}><Text style={card.newBadgeText}>NEW</Text></View>
          )}
        </View>
      </View>

      {/* Body */}
      <View style={card.body}>
        <Text style={card.title} numberOfLines={2}>{event.title}</Text>

        <View style={card.metaRow}>
          <View style={card.metaItem}>
            <Ionicons name="location-outline" size={12} color={colors.text.secondary} />
            <Text style={card.metaText} numberOfLines={1}>{event.city ?? '—'}</Text>
          </View>
          <View style={card.metaDot} />
          <View style={card.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={colors.text.secondary} />
            <Text style={card.metaText}>
              {formatDate(event.start_date)}
              {multiDay ? ` → ${formatDate(event.end_date)}` : ''}
            </Text>
          </View>
        </View>

        {event.discipline_tags.length > 0 && (
          <View style={card.tagRow}>
            {event.discipline_tags.slice(0, 3).map(t => (
              <View key={t} style={card.tag}>
                <Text style={card.tagText}>{t}</Text>
              </View>
            ))}
            {event.discipline_tags.length > 3 && (
              <Text style={card.tagMore}>+{event.discipline_tags.length - 3}</Text>
            )}
          </View>
        )}

        <View style={card.footer}>
          <View style={card.standsRow}>
            <Ionicons name="grid-outline" size={12} color={colors.text.secondary} />
            <Text style={card.standsText}>{event.stand_count ?? '—'} stands</Text>
          </View>
          <View style={[card.cta, { backgroundColor: cfg.color + '18' }]}>
            <Text style={[card.ctaText, { color: cfg.color }]}>Postuler</Text>
            <Ionicons name="arrow-forward" size={12} color={cfg.color} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const CARD_H = 100;
const card = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  header:        { height: CARD_H, overflow: 'hidden' },
  coverImg:      { width: '100%', height: '100%' },
  gradient:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  gradientLabel:   { fontSize: 32, fontWeight: '800', color: 'rgba(255,255,255,0.35)', letterSpacing: 4 },
  headerBadges:  { position: 'absolute', top: spacing.sm, left: spacing.sm, right: spacing.sm, flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  typeBadge:     { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  typeBadgeText: { ...typography.caption, color: '#fff', fontWeight: '800', fontSize: 9, letterSpacing: 0.8 },
  priceBadge:    { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.55)' },
  priceBadgeText:{ ...typography.caption, color: '#fff', fontWeight: '700' },
  newBadge:      { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, backgroundColor: '#F59E0B' },
  newBadgeText:  { ...typography.caption, color: '#fff', fontWeight: '800', fontSize: 9, letterSpacing: 0.8 },

  body:     { padding: spacing.md },
  title:    { ...typography.h3, color: colors.text.primary, fontWeight: '700', marginBottom: spacing.xs },
  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  metaDot:  { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.border },
  metaText: { ...typography.caption, color: colors.text.secondary, flex: 1 },
  tagRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  tag:      { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, backgroundColor: colors.background },
  tagText:  { ...typography.caption, color: colors.text.secondary, fontSize: 11 },
  tagMore:  { ...typography.caption, color: colors.text.secondary, alignSelf: 'center' },
  footer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  standsRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  standsText: { ...typography.caption, color: colors.text.secondary },
  cta:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full },
  ctaText:    { ...typography.caption, fontWeight: '700' },
});

// ─── Active filter chip ───────────────────────────────────────────────────────

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <TouchableOpacity style={fc.chip} onPress={onRemove} activeOpacity={0.8}>
      <Text style={fc.chipText} numberOfLines={1}>{label}</Text>
      <Ionicons name="close" size={11} color={colors.primary} />
    </TouchableOpacity>
  );
}

const fc = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary + '15',
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.primary + '40',
    paddingHorizontal: spacing.sm, paddingVertical: 5,
  },
  chipText: { ...typography.caption, color: colors.primary, fontWeight: '600', maxWidth: 120 },
});

// ─── Filters bottom sheet ─────────────────────────────────────────────────────

interface FilterValues {
  disciplines: string[];
  region: string | null;
  budget: BudgetPreset;
  date: DatePreset;
}

function FiltersSheet({
  visible, values, onApply, onClose,
}: {
  visible: boolean;
  values: FilterValues;
  onApply: (v: FilterValues) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<FilterValues>(values);
  const set = <K extends keyof FilterValues>(k: K, v: FilterValues[K]) =>
    setLocal(p => ({ ...p, [k]: v }));

  const toggleDisc = (t: string) =>
    set('disciplines', local.disciplines.includes(t)
      ? local.disciplines.filter(d => d !== t)
      : [...local.disciplines, t]);

  const reset = () => setLocal({ disciplines: [], region: null, budget: 'all', date: 'all' });

  const activeCount = [
    local.disciplines.length > 0,
    local.region !== null,
    local.budget !== 'all',
    local.date !== 'all',
  ].filter(Boolean).length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={fs.overlay}>
        <TouchableOpacity style={fs.backdrop} onPress={onClose} />
        <View style={fs.panel}>
          <View style={fs.handle} />

          {/* Header */}
          <View style={fs.header}>
            <Text style={fs.title}>Filtres</Text>
            <TouchableOpacity onPress={reset}>
              <Text style={fs.resetAll}>Tout effacer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>

            {/* ── Date ── */}
            <Text style={fs.sectionTitle}>📅  Date</Text>
            <View style={fs.pillRow}>
              {DATE_OPTIONS.map(o => (
                <TouchableOpacity
                  key={o.value}
                  style={[fs.pill, local.date === o.value && fs.pillActive]}
                  onPress={() => set('date', o.value)}
                >
                  <Text style={[fs.pillText, local.date === o.value && fs.pillTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Budget ── */}
            <Text style={fs.sectionTitle}>💰  Budget stand</Text>
            <View style={fs.pillRow}>
              {BUDGET_OPTIONS.map(o => (
                <TouchableOpacity
                  key={o.value}
                  style={[fs.pill, local.budget === o.value && fs.pillActive]}
                  onPress={() => set('budget', o.value)}
                >
                  <Text style={[fs.pillText, local.budget === o.value && fs.pillTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Région ── */}
            <Text style={fs.sectionTitle}>📍  Région</Text>
            <View style={fs.pillRow}>
              <TouchableOpacity
                style={[fs.pill, local.region === null && fs.pillActive]}
                onPress={() => set('region', null)}
              >
                <Text style={[fs.pillText, local.region === null && fs.pillTextActive]}>Toutes</Text>
              </TouchableOpacity>
              {FRENCH_REGIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[fs.pill, local.region === r && fs.pillActive]}
                  onPress={() => set('region', r)}
                >
                  <Text style={[fs.pillText, local.region === r && fs.pillTextActive]} numberOfLines={1}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Disciplines ── */}
            <Text style={fs.sectionTitle}>🎨  Disciplines</Text>
            <View style={fs.pillRow}>
              {DISCIPLINE_TAGS.map(t => {
                const active = local.disciplines.includes(t);
                return (
                  <TouchableOpacity
                    key={t}
                    style={[fs.pill, active && fs.pillActivePurple]}
                    onPress={() => toggleDisc(t)}
                  >
                    <Text style={[fs.pillText, active && fs.pillTextActive]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          </ScrollView>

          {/* Apply button */}
          <TouchableOpacity
            style={[fs.applyBtn, activeCount === 0 && { opacity: 0.6 }]}
            onPress={() => { onApply(local); onClose(); }}
          >
            <Text style={fs.applyBtnText}>
              {activeCount > 0 ? `Appliquer (${activeCount} filtre${activeCount > 1 ? 's' : ''})` : 'Appliquer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const fs = StyleSheet.create({
  overlay:   { flex: 1 },
  backdrop:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.xl, maxHeight: '88%',
  },
  handle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title:     { ...typography.h3, color: colors.text.primary, fontWeight: '700' },
  resetAll:  { ...typography.caption, color: colors.error, fontWeight: '600' },

  sectionTitle: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11, marginBottom: spacing.sm, marginTop: spacing.lg },
  pillRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pillActive:       { backgroundColor: colors.primary, borderColor: colors.primary },
  pillActivePurple: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  pillText:         { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  pillTextActive:   { color: '#fff', fontWeight: '700' },

  applyBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    padding: spacing.md + 2, alignItems: 'center', marginTop: spacing.lg,
  },
  applyBtnText: { ...typography.label, color: '#fff', fontWeight: '700', fontSize: 15 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SearchEventsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [search,    setSearch]    = useState('');
  const [eventType, setEventType] = useState<EventType | 'all'>('all');
  const [filters,   setFilters]   = useState<FilterValues>({
    disciplines: [], region: null, budget: 'all', date: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [events,   setEvents]   = useState<Event[]>([]);
  const [loading,  setLoading]  = useState(true);

  const activeCount = [
    filters.disciplines.length > 0,
    filters.region !== null,
    filters.budget !== 'all',
    filters.date !== 'all',
  ].filter(Boolean).length;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('events').select('*')
      .eq('status', 'published')
      .order('start_date', { ascending: true })
      .limit(100);

    if (search.trim())              q = q.or(`title.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%,region.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    if (eventType !== 'all')        q = q.eq('event_type', eventType);
    if (filters.disciplines.length) q = q.overlaps('discipline_tags', filters.disciplines);
    if (filters.region)             q = q.eq('region', filters.region);

    if (filters.budget === 'free')     q = q.or('stand_price.is.null,stand_price.eq.0');
    else if (filters.budget === 'under50')  q = q.lte('stand_price', 50).not('stand_price', 'is', null);
    else if (filters.budget === '50to150')  q = q.gte('stand_price', 50).lte('stand_price', 150);
    else if (filters.budget === 'over150')  q = q.gt('stand_price', 150);

    const range = getDateRange(filters.date);
    if (range) q = q.lte('start_date', range.to).gte('end_date', range.from);

    const { data } = await q;
    setEvents(data ?? []);
    setLoading(false);
  }, [search, eventType, filters]);

  useEffect(() => {
    const t = setTimeout(fetchEvents, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchEvents, search]);

  const removeFilter = (k: keyof FilterValues) =>
    setFilters(p => ({ ...p, [k]: k === 'disciplines' ? [] : k === 'region' ? null : 'all' }));

  return (
    <View style={[s.container, { paddingTop: insets.top + spacing.sm }]}>

      {/* Search + Filter button */}
      <View style={s.topRow}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.text.secondary} />
          <TextInput
            style={s.searchInput}
            placeholder="Ville, nom du marché…"
            placeholderTextColor={colors.text.secondary + '80'}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[s.filterBtn, activeCount > 0 && s.filterBtnActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={16} color={activeCount > 0 ? '#fff' : colors.text.primary} />
          {activeCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{activeCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Type chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeRow}>
        {EVENT_TYPES.map(t => (
          <TouchableOpacity
            key={t.value}
            style={[s.typeChip, eventType === t.value && s.typeChipActive]}
            onPress={() => setEventType(t.value)}
          >
            <Text style={s.typeChipIcon}>{t.icon}</Text>
            <Text style={[s.typeChipText, eventType === t.value && s.typeChipTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.activeRow}>
          {filters.disciplines.length > 0 && (
            <ActiveChip
              label={`Disciplines (${filters.disciplines.length})`}
              onRemove={() => removeFilter('disciplines')}
            />
          )}
          {filters.region && (
            <ActiveChip label={filters.region} onRemove={() => removeFilter('region')} />
          )}
          {filters.budget !== 'all' && (
            <ActiveChip
              label={BUDGET_OPTIONS.find(o => o.value === filters.budget)!.short}
              onRemove={() => removeFilter('budget')}
            />
          )}
          {filters.date !== 'all' && (
            <ActiveChip
              label={DATE_OPTIONS.find(o => o.value === filters.date)!.short}
              onRemove={() => removeFilter('date')}
            />
          )}
          <TouchableOpacity
            style={s.clearAll}
            onPress={() => setFilters({ disciplines: [], region: null, budget: 'all', date: 'all' })}
          >
            <Text style={s.clearAllText}>Tout effacer</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Count */}
      {!loading && (
        <Text style={s.count}>
          {events.length} marché{events.length !== 1 ? 's' : ''}
        </Text>
      )}

      {/* List */}
      {loading ? (
        <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={e => e.id}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })} />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="search-outline" size={40} color={colors.border} />
              <Text style={s.emptyTitle}>Aucun marché trouvé</Text>
              <Text style={s.emptySub}>Élargissez vos filtres ou changez de région</Text>
              {activeCount > 0 && (
                <TouchableOpacity
                  style={s.emptyReset}
                  onPress={() => setFilters({ disciplines: [], region: null, budget: 'all', date: 'all' })}
                >
                  <Text style={s.emptyResetText}>Réinitialiser les filtres</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <FiltersSheet
        visible={showFilters}
        values={filters}
        onApply={setFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  topRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.xl,
    paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  searchInput:  { flex: 1, ...typography.body, color: colors.text.primary, paddingVertical: 13 },
  filterBtn: {
    width: 46, height: 46, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive:  { backgroundColor: colors.primary, borderColor: colors.primary },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  typeRow: { paddingHorizontal: spacing.xl, gap: spacing.xs, paddingBottom: spacing.sm },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipIcon:       { fontSize: 13 },
  typeChipText:       { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  typeChipTextActive: { color: '#fff', fontWeight: '700' },

  activeRow: { paddingHorizontal: spacing.xl, gap: spacing.xs, paddingBottom: spacing.sm },
  clearAll: {
    paddingHorizontal: spacing.sm, paddingVertical: 5,
    borderRadius: radius.full,
  },
  clearAllText: { ...typography.caption, color: colors.error, fontWeight: '600' },

  count:   { ...typography.caption, color: colors.text.secondary, paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  list:    { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl },

  empty:      { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.xs },
  emptySub:   { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  emptyReset: { marginTop: spacing.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.primary },
  emptyResetText: { ...typography.label, color: colors.primary, fontWeight: '600' },
});
