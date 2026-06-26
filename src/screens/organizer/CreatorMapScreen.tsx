import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useGeoCreators } from '../../hooks/useGeoCreators';
import { DISCIPLINE_TAGS } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

const RADIUS_OPTIONS = [10, 20, 50, 100];

function NativeCreatorMap({ creators, centerLat, centerLng, radiusKm, onSelect }: any) {
  if (Platform.OS === 'web') return null;
  const MapView = require('react-native-maps').default;
  const { Marker, Circle } = require('react-native-maps');

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={{ latitude: centerLat, longitude: centerLng, latitudeDelta: radiusKm / 50, longitudeDelta: radiusKm / 50 }}
    >
      {/* Event center */}
      <Marker coordinate={{ latitude: centerLat, longitude: centerLng }} pinColor="gold" />
      <Circle center={{ latitude: centerLat, longitude: centerLng }} radius={radiusKm * 1000} strokeColor={colors.primary + '80'} fillColor={colors.primary + '10'} />
      {creators.map((c: any) => (
        <Marker
          key={c.id}
          coordinate={{ latitude: c.lat, longitude: c.lng }}
          pinColor={colors.secondary}
          onPress={() => onSelect(c)}
        />
      ))}
    </MapView>
  );
}

function WebCreatorMap({ creators, centerLat, centerLng, radiusKm, onSelect }: any) {
  const [ready, setReady] = useState(false);
  const RL = useRef<any>(null);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    import('react-leaflet').then(m => { RL.current = m; setReady(true); });
  }, []);

  if (!ready) return <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;

  const { MapContainer, TileLayer, CircleMarker, Circle, Popup } = RL.current;
  const zoom = Math.max(8, 12 - Math.floor(radiusKm / 20));

  return (
    <MapContainer center={[centerLat, centerLng]} zoom={zoom} style={{ flex: 1, width: '100%', height: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
      <Circle center={[centerLat, centerLng]} radius={radiusKm * 1000} pathOptions={{ color: colors.primary, fillColor: colors.primary, fillOpacity: 0.05, weight: 1 }} />
      <CircleMarker center={[centerLat, centerLng]} radius={12} pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 1 }}>
        <Popup>Votre marché</Popup>
      </CircleMarker>
      {creators.map((c: any) => (
        <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={8}
          pathOptions={{ color: colors.secondary, fillColor: colors.secondary, fillOpacity: 0.9 }}
          eventHandlers={{ click: () => onSelect(c) }}
        >
          <Popup><Text style={{ fontWeight: 'bold' }}>{c.full_name}</Text><Text>{c.disciplines.slice(0, 2).join(', ')}</Text><Text>{c.distanceKm} km</Text></Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default function CreatorMapScreen() {
  const nav = useNavigation<any>();
  const [radiusKm, setRadius]     = useState(30);
  const [discipline, setDisc]     = useState('');
  const [selected, setSelected]   = useState<any>(null);
  const [showDiscs, setShowDiscs] = useState(false);

  // Default center: Paris (until organizer sets their event location)
  const centerLat = 48.85;
  const centerLng = 2.35;

  const { creators, loading } = useGeoCreators({ centerLat, centerLng, radiusKm, discipline: discipline || undefined });

  const disciplineGroups = discipline
    ? creators.filter(c => c.disciplines.includes(discipline))
    : creators;

  const MapContent = Platform.OS === 'web' ? WebCreatorMap : NativeCreatorMap;

  return (
    <View style={s.container}>
      {/* Controls */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.title}>Créateurs disponibles</Text>
      </View>

      <View style={s.controlRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.radiusRow}>
          {RADIUS_OPTIONS.map(r => (
            <TouchableOpacity key={r} style={[s.chip, radiusKm === r && s.chipActive]} onPress={() => setRadius(r)}>
              <Text style={[s.chipText, radiusKm === r && s.chipTextActive]}>{r} km</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={[s.discBtn, discipline && s.discBtnActive]} onPress={() => setShowDiscs(v => !v)}>
          <Text style={[s.chipText, discipline && s.chipTextActive]}>{discipline || 'Discipline'}</Text>
        </TouchableOpacity>
      </View>

      {showDiscs && (
        <View style={s.discPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.radiusRow}>
            <TouchableOpacity style={[s.chip, !discipline && s.chipActive]} onPress={() => { setDisc(''); setShowDiscs(false); }}>
              <Text style={[s.chipText, !discipline && s.chipTextActive]}>Tous</Text>
            </TouchableOpacity>
            {DISCIPLINE_TAGS.map(d => (
              <TouchableOpacity key={d} style={[s.chip, discipline === d && s.chipActive]} onPress={() => { setDisc(d); setShowDiscs(false); }}>
                <Text style={[s.chipText, discipline === d && s.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Count banner */}
      <View style={s.countBanner}>
        <Text style={s.countText}>
          {loading ? '…' : `${creators.length} créateur${creators.length !== 1 ? 's' : ''}${discipline ? ` · ${discipline}` : ''} dans ${radiusKm} km`}
        </Text>
      </View>

      {/* Map */}
      <View style={s.mapWrap}>
        {loading
          ? <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
          : <MapContent creators={creators} centerLat={centerLat} centerLng={centerLng} radiusKm={radiusKm} onSelect={setSelected} />
        }
      </View>

      {/* Creator preview */}
      {selected && (
        <View style={s.preview}>
          <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}><Ionicons name="close" size={18} color={colors.text.primary} /></TouchableOpacity>
          <View style={s.previewHeader}>
            <View style={s.avatar}><Text style={s.avatarText}>{selected.full_name[0]?.toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.creatorName}>{selected.full_name}</Text>
              <Text style={s.creatorDist}>{selected.city ?? '—'}  ·  {selected.distanceKm} km</Text>
              <Text style={s.creatorDisc}>{selected.disciplines.slice(0, 3).join(' · ')}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.viewBtn} onPress={() => { setSelected(null); nav.navigate('Mes marchés', { screen: 'ManageEvents' }); }}>
            <Text style={s.viewBtnText}>Voir le profil complet →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar:    { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
  back:      { ...typography.h2, color: colors.text.secondary },
  title:     { ...typography.h3, color: colors.text.primary, flex: 1 },
  controlRow:{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
  radiusRow: { paddingHorizontal: spacing.md, gap: spacing.xs, paddingVertical: spacing.sm },
  chip:      { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive:{ backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:  { ...typography.caption, color: colors.text.secondary },
  chipTextActive: { color: colors.text.inverse, fontWeight: '700' },
  discBtn:   { marginRight: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  discBtnActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  discPanel: { backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
  countBanner: { backgroundColor: colors.primary + '15', paddingVertical: spacing.xs, alignItems: 'center' },
  countText: { ...typography.label, color: colors.primary, fontWeight: '600' },
  mapWrap:   { flex: 1 },
  preview:   { position: 'absolute', bottom: spacing.xl, left: spacing.xl, right: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  closeBtn:  { position: 'absolute', top: spacing.md, right: spacing.md, padding: 4 },
  closeBtnText: { color: colors.text.secondary, fontSize: 16 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  avatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary + '25', alignItems: 'center', justifyContent: 'center' },
  avatarText:{ ...typography.h3, color: colors.secondary },
  creatorName: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  creatorDist: { ...typography.caption, color: colors.text.secondary },
  creatorDisc: { ...typography.caption, color: colors.primary },
  viewBtn:   { backgroundColor: colors.secondary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  viewBtnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
