import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  ScrollView, ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useGeoEvents, DEFAULT_FILTERS, MapFilters, GeoEvent } from '../../hooks/useGeoEvents';
import { DISCIPLINE_TAGS, EventType } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_H } = Dimensions.get('window');

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  permanent: '#3B82F6',
  seasonal:  '#F59E0B',
  popup:     '#A855F7',
  salon:     '#10B981',
  fair:      '#EF4444',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  permanent: 'Permanent',
  seasonal:  'Saisonnier',
  popup:     'Pop-up',
  salon:     'Salon',
  fair:      'Foire',
};

const RADIUS_OPTIONS = [
  { label: '10 km',   value: 10 },
  { label: '30 km',   value: 30 },
  { label: '50 km',   value: 50 },
  { label: '100 km',  value: 100 },
  { label: 'France',  value: null },
];

const PRICE_OPTIONS = [
  { label: 'Tous',    value: null },
  { label: 'Gratuit', value: 0 },
  { label: '< 50 €',  value: 50 },
  { label: '< 100 €', value: 100 },
];

const DATE_OPTIONS = [
  { label: 'Tous',       value: null },
  { label: '7 jours',    value: 7 },
  { label: 'Ce mois',    value: 30 },
  { label: '3 mois',     value: 90 },
];

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters,
  onChange,
  onClose,
  userPos,
}: {
  filters: MapFilters;
  onChange: (f: MapFilters) => void;
  onClose: () => void;
  userPos: { lat: number; lng: number } | null;
}) {
  const [local, setLocal] = useState(filters);
  const set = (patch: Partial<MapFilters>) => setLocal(p => ({ ...p, ...patch }));

  const apply = () => { onChange({ ...local, userLat: userPos?.lat, userLng: userPos?.lng }); onClose(); };

  const toggleDiscipline = (d: string) =>
    set({ disciplines: local.disciplines.includes(d) ? local.disciplines.filter(x => x !== d) : [...local.disciplines, d] });

  return (
    <View style={f.panel}>
      <View style={f.handle} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={f.sectionTitle}>Distance</Text>
        {!userPos && <Text style={f.warning}>Activez la géolocalisation pour filtrer par distance</Text>}
        <View style={f.optRow}>
          {RADIUS_OPTIONS.map(o => (
            <TouchableOpacity
              key={String(o.value)}
              style={[f.chip, local.radiusKm === o.value && f.chipActive, !userPos && o.value !== null && f.chipDisabled]}
              onPress={() => userPos || o.value === null ? set({ radiusKm: o.value }) : null}
            >
              <Text style={[f.chipText, local.radiusKm === o.value && f.chipTextActive]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={f.sectionTitle}>Prix du stand</Text>
        <View style={f.optRow}>
          {PRICE_OPTIONS.map(o => (
            <TouchableOpacity key={String(o.value)} style={[f.chip, local.maxPrice === o.value && f.chipActive]} onPress={() => set({ maxPrice: o.value })}>
              <Text style={[f.chipText, local.maxPrice === o.value && f.chipTextActive]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={f.sectionTitle}>Période</Text>
        <View style={f.optRow}>
          {DATE_OPTIONS.map(o => (
            <TouchableOpacity key={String(o.value)} style={[f.chip, local.daysAhead === o.value && f.chipActive]} onPress={() => set({ daysAhead: o.value })}>
              <Text style={[f.chipText, local.daysAhead === o.value && f.chipTextActive]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={f.sectionTitle}>Disciplines ({local.disciplines.length})</Text>
        <View style={f.tagWrap}>
          {DISCIPLINE_TAGS.map(d => (
            <TouchableOpacity key={d} style={[f.tag, local.disciplines.includes(d) && f.tagActive]} onPress={() => toggleDiscipline(d)}>
              <Text style={[f.tagText, local.disciplines.includes(d) && f.tagTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={f.actions}>
          <TouchableOpacity style={f.resetBtn} onPress={() => setLocal(DEFAULT_FILTERS)}>
            <Text style={f.resetText}>Réinitialiser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={f.applyBtn} onPress={apply}>
            <Text style={f.applyText}>Appliquer</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

// ─── Event preview card ────────────────────────────────────────────────────────

function EventPreviewCard({ event, onClose, onView }: { event: GeoEvent; onClose: () => void; onView: () => void }) {
  const typeColor = EVENT_TYPE_COLORS[event.event_type] ?? colors.primary;
  return (
    <View style={p.card}>
      <TouchableOpacity style={p.closeBtn} onPress={onClose}><Text style={p.closeBtnText}>✕</Text></TouchableOpacity>
      <View style={[p.typeDot, { backgroundColor: typeColor }]} />
      <Text style={p.type}>{EVENT_TYPE_LABELS[event.event_type]}</Text>
      <Text style={p.title} numberOfLines={2}>{event.title}</Text>
      <Text style={p.meta}>📍 {event.city ?? '—'}  ·  {new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</Text>
      {event.stand_price != null && (
        <Text style={p.price}>{event.stand_price === 0 ? 'Gratuit' : `Stand : ${event.stand_price} €`}</Text>
      )}
      {event.discipline_tags.length > 0 && (
        <Text style={p.tags}>{event.discipline_tags.slice(0, 3).join(' · ')}</Text>
      )}
      <TouchableOpacity style={p.viewBtn} onPress={onView}>
        <Text style={p.viewBtnText}>Voir la fiche →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  const types = Object.entries(EVENT_TYPE_LABELS) as [EventType, string][];
  return (
    <View style={l.box}>
      {types.map(([type, label]) => (
        <View key={type} style={l.row}>
          <View style={[l.dot, { backgroundColor: EVENT_TYPE_COLORS[type] }]} />
          <Text style={l.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EventMapScreen() {
  const nav = useNavigation<any>();
  const [filters, setFilters]     = useState<MapFilters>(DEFAULT_FILTERS);
  const [userPos, setUserPos]     = useState<{ lat: number; lng: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected]   = useState<GeoEvent | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const { events, loading }       = useGeoEvents(filters);
  const filterAnim                = useRef(new Animated.Value(0)).current;

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserPos({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  const toggleFilters = (open: boolean) => {
    setShowFilters(open);
    Animated.spring(filterAnim, { toValue: open ? 1 : 0, useNativeDriver: false }).start();
  };

  const activeFilterCount = [
    filters.radiusKm !== null,
    filters.maxPrice !== null,
    filters.daysAhead !== null,
    filters.disciplines.length > 0,
  ].filter(Boolean).length;

  // Platform-specific map content
  const MapContent = Platform.OS === 'web' ? WebMap : NativeMap;

  return (
    <View style={s.container}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>{loading ? 'Chargement…' : `${events.length} marchés`}</Text>
        <View style={s.topActions}>
          <TouchableOpacity style={s.iconBtn} onPress={() => setShowLegend(v => !v)}>
            <Text style={s.iconBtnText}>⚬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.filterBtn, activeFilterCount > 0 && s.filterBtnActive]} onPress={() => toggleFilters(true)}>
            <Text style={[s.filterBtnText, activeFilterCount > 0 && s.filterBtnTextActive]}>
              Filtres{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading
        ? <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
        : <MapContent events={events} userPos={userPos} onSelect={setSelected} />
      }

      {/* Legend */}
      {showLegend && <Legend />}

      {/* Selected event preview */}
      {selected && (
        <EventPreviewCard
          event={selected}
          onClose={() => setSelected(null)}
          onView={() => { setSelected(null); nav.navigate('PublicEventDetail', { eventId: selected.id }); }}
        />
      )}

      {/* Filter panel */}
      {showFilters && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity style={s.overlay} onPress={() => toggleFilters(false)} />
          <FilterPanel filters={filters} onChange={setFilters} onClose={() => toggleFilters(false)} userPos={userPos} />
        </View>
      )}
    </View>
  );
}

// ─── Native map ───────────────────────────────────────────────────────────────

function NativeMap({ events, userPos, onSelect }: { events: GeoEvent[]; userPos: { lat: number; lng: number } | null; onSelect: (e: GeoEvent) => void }) {
  if (Platform.OS === 'web') return null;
  const MapView = require('react-native-maps').default;
  const { Marker, Circle } = require('react-native-maps');

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={{ latitude: 46.6, longitude: 2.3, latitudeDelta: 9, longitudeDelta: 9 }}
      showsUserLocation={!!userPos}
    >
      {events.map(e => (
        <Marker
          key={e.id}
          coordinate={{ latitude: e.lat, longitude: e.lng }}
          pinColor={EVENT_TYPE_COLORS[e.event_type] ?? colors.primary}
          onPress={() => onSelect(e)}
        />
      ))}
    </MapView>
  );
}

// ─── Web map (react-leaflet) ──────────────────────────────────────────────────

function WebMap({ events, userPos, onSelect }: { events: GeoEvent[]; userPos: { lat: number; lng: number } | null; onSelect: (e: GeoEvent) => void }) {
  const [ready, setReady] = useState(false);
  const MapComponents = useRef<any>(null);

  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('react-leaflet').then(RL => {
      MapComponents.current = RL;
      setReady(true);
    });
  }, []);

  if (!ready || !MapComponents.current) {
    return <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = MapComponents.current;
  const center = userPos ? [userPos.lat, userPos.lng] : [46.6, 2.3];

  return (
    <MapContainer
      center={center}
      zoom={userPos ? 10 : 5}
      style={{ flex: 1, width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap'
      />
      {events.map(e => (
        <CircleMarker
          key={e.id}
          center={[e.lat, e.lng]}
          radius={10}
          pathOptions={{ color: EVENT_TYPE_COLORS[e.event_type] ?? colors.primary, fillOpacity: 0.85, fillColor: EVENT_TYPE_COLORS[e.event_type] ?? colors.primary }}
          eventHandlers={{ click: () => onSelect(e) }}
        >
          <Popup>
            <Text style={{ fontWeight: 'bold' }}>{e.title}</Text>
            <Text>{e.city} · {new Date(e.start_date).toLocaleDateString('fr-FR')}</Text>
          </Popup>
        </CircleMarker>
      ))}
      {userPos && (
        <CircleMarker
          center={[userPos.lat, userPos.lng]}
          radius={8}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 1 }}
        />
      )}
    </MapContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
    backgroundColor: colors.surface + 'EE', gap: spacing.sm,
  },
  backBtn:  { padding: spacing.sm },
  backText: { ...typography.h2, color: colors.text.secondary },
  topTitle: { ...typography.label, color: colors.text.primary, flex: 1 },
  topActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  iconBtn:     { padding: spacing.sm },
  iconBtnText: { fontSize: 20 },
  filterBtn:     { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterBtnText:   { ...typography.caption, color: colors.text.secondary, fontWeight: '600' },
  filterBtnTextActive: { color: colors.text.inverse },
  overlay:   { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
});

const f = StyleSheet.create({
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
    backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    padding: spacing.xl, maxHeight: SCREEN_H * 0.75,
  },
  handle:       { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  sectionTitle: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm, marginTop: spacing.lg },
  warning:      { ...typography.caption, color: colors.error, marginBottom: spacing.sm },
  optRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip:         { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive:   { backgroundColor: colors.primary, borderColor: colors.primary },
  chipDisabled: { opacity: 0.4 },
  chipText:     { ...typography.caption, color: colors.text.secondary },
  chipTextActive:{ color: colors.text.inverse, fontWeight: '700' },
  tagWrap:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag:          { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  tagActive:    { backgroundColor: colors.primary + '20', borderColor: colors.primary },
  tagText:      { ...typography.caption, color: colors.text.secondary },
  tagTextActive:{ color: colors.primary, fontWeight: '600' },
  actions:      { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  resetBtn:     { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  resetText:    { ...typography.label, color: colors.text.secondary },
  applyBtn:     { flex: 2, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' },
  applyText:    { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});

const p = StyleSheet.create({
  card: { position: 'absolute', bottom: spacing.xxl, left: spacing.xl, right: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  closeBtn:     { position: 'absolute', top: spacing.md, right: spacing.md, padding: 4 },
  closeBtnText: { color: colors.text.secondary, fontSize: 16 },
  typeDot:      { width: 10, height: 10, borderRadius: 5, marginBottom: spacing.xs },
  type:         { ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  title:        { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  meta:         { ...typography.caption, color: colors.text.secondary, marginBottom: 2 },
  price:        { ...typography.caption, color: colors.secondary, fontWeight: '600', marginBottom: 2 },
  tags:         { ...typography.caption, color: colors.primary, marginBottom: spacing.md },
  viewBtn:      { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  viewBtnText:  { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});

const l = StyleSheet.create({
  box:   { position: 'absolute', top: 90, right: spacing.lg, backgroundColor: colors.surface + 'EE', borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  row:   { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 3 },
  dot:   { width: 10, height: 10, borderRadius: 5 },
  label: { ...typography.caption, color: colors.text.primary },
});
