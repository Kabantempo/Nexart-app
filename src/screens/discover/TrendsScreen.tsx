import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../stores/theme';
import { useEvents } from '../../hooks/useEvents';
import { usePublicCreators } from '../../hooks/usePublicCreators';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

export default function TrendsScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { events, loading: loadingEvents } = useEvents({ limit: 300 });
  const { creators, loading: loadingCreators } = usePublicCreators({ limit: 500 });

  const { disciplines, regions, upcoming } = useMemo(() => {
    const disc: Record<string, number> = {};
    const reg: Record<string, { creators: number; events: number }> = {};
    creators.forEach(c => {
      (c.disciplines ?? []).forEach(d => { disc[d] = (disc[d] ?? 0) + 1; });
      if (c.region) reg[c.region] = { creators: (reg[c.region]?.creators ?? 0) + 1, events: reg[c.region]?.events ?? 0 };
    });
    const now = Date.now();
    const future = events
      .filter(e => new Date(e.start_date).getTime() >= now)
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
    future.forEach(e => {
      if (e.region) reg[e.region] = { creators: reg[e.region]?.creators ?? 0, events: (reg[e.region]?.events ?? 0) + 1 };
    });
    return {
      disciplines: Object.entries(disc).sort((a, b) => b[1] - a[1]).slice(0, 12),
      regions: Object.entries(reg)
        .sort((a, b) => (b[1].creators + b[1].events * 2) - (a[1].creators + a[1].events * 2))
        .slice(0, 8),
      upcoming: future.slice(0, 6),
    };
  }, [events, creators]);

  if (loadingEvents || loadingCreators) {
    return <View style={s.container}><ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} /></View>;
  }

  const maxDisc = disciplines[0]?.[1] ?? 1;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
      <Text style={s.section}>Disciplines les plus représentées</Text>
      {disciplines.length === 0 ? <Text style={s.empty}>Pas encore de données.</Text> : null}
      {disciplines.map(([name, count]) => (
        <View key={name} style={s.barRow}>
          <Text style={s.barLabel} numberOfLines={1}>{name}</Text>
          <View style={s.barTrack}><View style={[s.barFill, { width: `${Math.max(6, (count / maxDisc) * 100)}%` }]} /></View>
          <Text style={s.barCount}>{count}</Text>
        </View>
      ))}

      <Text style={s.section}>Régions les plus actives</Text>
      {regions.length === 0 ? <Text style={s.empty}>Pas encore de données.</Text> : null}
      {regions.map(([name, v]) => (
        <View key={name} style={s.card}>
          <Text style={s.name}>{name}</Text>
          <Text style={s.meta}>
            {v.creators} créateur{v.creators > 1 ? 's' : ''} · {v.events} marché{v.events > 1 ? 's' : ''} à venir
          </Text>
        </View>
      ))}

      <Text style={s.section}>Prochains marchés</Text>
      {upcoming.length === 0 ? <Text style={s.empty}>Aucun marché à venir.</Text> : null}
      {upcoming.map(e => (
        <View key={e.id} style={s.card}>
          <Text style={s.date}>{formatDate(e.start_date)}</Text>
          <Text style={s.name}>{e.title}</Text>
          <Text style={s.meta}>{[e.city, e.region].filter(Boolean).join(' · ')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: {
    ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  empty: { ...typography.body, color: colors.text.secondary },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  barLabel: { ...typography.label, color: colors.text.primary, width: 110 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary },
  barCount: { ...typography.caption, color: colors.text.secondary, width: 28, textAlign: 'right' },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: 2,
  },
  date: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.text.secondary },
});
