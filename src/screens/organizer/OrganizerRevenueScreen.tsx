import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import StatTiles from '../../components/StatTiles';
import { useTheme } from '../../stores/theme';
import { useSiteData, euros } from '../../hooks/useSiteData';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

interface Revenue {
  kpi: { brut_cents: number; commission_cents: number; net_cents: number; refunded_cents: number; pending_cents: number; transactions: number };
  by_event: { event_id: string; title: string; city: string; stands_paid: number; brut_cents: number; net_cents: number; commission_cents: number; refunded_cents: number }[];
}

export default function OrganizerRevenueScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { data, loading, error, refetch } = useSiteData<Revenue>('/api/organizer/revenue', 'Impossible de charger vos revenus.');

  return (
    <EventScreenShell title="Revenus" onBack={() => navigation.goBack()} loading={loading} error={error} onRetry={refetch}>
      {data ? (
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
          <StatTiles tiles={[
            { label: 'Montant brut', value: euros(data.kpi.brut_cents) },
            { label: 'Net après commission', value: euros(data.kpi.net_cents) },
            { label: 'Commission', value: euros(data.kpi.commission_cents) },
            { label: 'Remboursé', value: euros(data.kpi.refunded_cents) },
            { label: 'En attente', value: euros(data.kpi.pending_cents) },
            { label: 'Paiements', value: String(data.kpi.transactions) },
          ]} />

          <Text style={s.section}>Par marché</Text>
          {data.by_event.length === 0 ? <Text style={s.meta}>Aucun paiement pour l'instant.</Text> : null}
          {data.by_event.map(e => (
            <View key={e.event_id} style={s.card}>
              <Text style={s.name}>{e.title}</Text>
              <Text style={s.meta}>{e.city} · {e.stands_paid} stand{e.stands_paid > 1 ? 's' : ''} payé{e.stands_paid > 1 ? 's' : ''}</Text>
              <Text style={s.amount}>{euros(e.net_cents)} net</Text>
              <Text style={s.meta}>Brut {euros(e.brut_cents)} · commission {euros(e.commission_cents)}{e.refunded_cents ? ` · remboursé ${euros(e.refunded_cents)}` : ''}</Text>
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
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: 2,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  amount: { ...typography.h3, color: colors.primary },
});
