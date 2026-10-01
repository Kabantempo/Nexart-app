import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import { useTheme } from '../../stores/theme';
import { useEventAnalytics } from '../../hooks/useEventAnalytics';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

export default function EventAnalyticsScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { stats, loading, error, refetch } = useEventAnalytics(eventId);

  const tiles = stats ? [
    { label: 'Candidatures', value: String(stats.totalApplications) },
    { label: 'Acceptées', value: String(stats.acceptedCount) },
    { label: 'En attente', value: String(stats.pendingCount) },
    { label: 'Refusées', value: String(stats.refusedCount) },
    { label: "Taux d'acceptation", value: `${stats.acceptanceRate} %` },
    { label: 'Stands', value: String(stats.totalStands) },
  ] : [];

  return (
    <EventScreenShell title="Statistiques" subtitle={eventTitle} onBack={() => navigation.goBack()}
      loading={loading} error={error} onRetry={refetch}>
      {stats ? (
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          <View style={s.fillCard}>
            <Text style={s.fillLabel}>Taux de remplissage</Text>
            <Text style={s.fillValue}>{stats.fillRate} %</Text>
            <View style={s.bar}><View style={[s.barFill, { width: `${Math.min(100, stats.fillRate)}%` }]} /></View>
            <Text style={s.fillHint}>{stats.acceptedCount} stand{stats.acceptedCount > 1 ? 's' : ''} accepté{stats.acceptedCount > 1 ? 's' : ''} sur {stats.totalStands}</Text>
          </View>
          <View style={s.grid}>
            {tiles.map(t => (
              <View key={t.label} style={s.tile}>
                <Text style={s.tileValue}>{t.value}</Text>
                <Text style={s.tileLabel}>{t.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  fillCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs, marginBottom: spacing.md,
  },
  fillLabel: { ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  fillValue: { ...typography.h1, color: colors.text.primary },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden', marginVertical: spacing.xs },
  barFill: { height: '100%', backgroundColor: colors.primary },
  fillHint: { ...typography.caption, color: colors.text.secondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    flexBasis: '48%', flexGrow: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md,
  },
  tileValue: { ...typography.h2, color: colors.text.primary },
  tileLabel: { ...typography.caption, color: colors.text.secondary },
});
