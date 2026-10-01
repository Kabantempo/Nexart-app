import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import StatTiles from '../../components/StatTiles';
import { useTheme } from '../../stores/theme';
import { useSiteData } from '../../hooks/useSiteData';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

interface OrganizerStats {
  kpi: { totalApplications: number; accepted: number; refused: number; pending: number; acceptanceRate: number; profileViews: number };
  eventsByStatus: { draft: number; published: number; closed: number };
  applicationsPerEvent: { event_id: string; title: string; total: number; accepted: number; pending: number; refused: number; fill_rate: number }[];
  topDisciplines: { discipline: string; count: number }[];
}

export default function OrganizerAnalyticsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { data, loading, error, refetch } = useSiteData<OrganizerStats>(
    '/api/organizer/analytics', 'Impossible de charger vos statistiques.',
  );
  const maxDisc = data?.topDisciplines[0]?.count ?? 1;

  return (
    <EventScreenShell title="Statistiques" onBack={() => navigation.goBack()} loading={loading} error={error} onRetry={refetch}>
      {data ? (
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
          <StatTiles tiles={[
            { label: 'Candidatures', value: String(data.kpi.totalApplications) },
            { label: 'Acceptées', value: String(data.kpi.accepted) },
            { label: 'En attente', value: String(data.kpi.pending) },
            { label: 'Refusées', value: String(data.kpi.refused) },
            { label: "Taux d'acceptation", value: `${data.kpi.acceptanceRate} %` },
            { label: 'Vues du profil (30 j)', value: String(data.kpi.profileViews) },
          ]} />

          <Text style={s.section}>Marchés</Text>
          <Text style={s.meta}>
            {data.eventsByStatus.published} publié{data.eventsByStatus.published > 1 ? 's' : ''} · {data.eventsByStatus.draft} brouillon{data.eventsByStatus.draft > 1 ? 's' : ''} · {data.eventsByStatus.closed} fermé{data.eventsByStatus.closed > 1 ? 's' : ''}
          </Text>

          <Text style={s.section}>Remplissage par marché</Text>
          {data.applicationsPerEvent.length === 0 ? <Text style={s.meta}>Aucun marché.</Text> : null}
          {data.applicationsPerEvent.map(e => (
            <View key={e.event_id} style={s.card}>
              <Text style={s.name}>{e.title}</Text>
              <View style={s.track}><View style={[s.fill, { width: `${Math.min(100, e.fill_rate)}%` }]} /></View>
              <Text style={s.meta}>
                {e.fill_rate} % · {e.total} candidature{e.total > 1 ? 's' : ''} ({e.accepted} acceptée{e.accepted > 1 ? 's' : ''}, {e.pending} en attente)
              </Text>
            </View>
          ))}

          {data.topDisciplines.length ? <Text style={s.section}>Disciplines acceptées</Text> : null}
          {data.topDisciplines.map(d => (
            <View key={d.discipline} style={s.barRow}>
              <Text style={s.barLabel} numberOfLines={1}>{d.discipline}</Text>
              <View style={s.track}><View style={[s.fill, { width: `${Math.max(6, (d.count / maxDisc) * 100)}%` }]} /></View>
              <Text style={s.barCount}>{d.count}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  section: {
    ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  meta: { ...typography.caption, color: colors.text.secondary },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  barLabel: { ...typography.label, color: colors.text.primary, width: 110 },
  barCount: { ...typography.caption, color: colors.text.secondary, width: 24, textAlign: 'right' },
});
