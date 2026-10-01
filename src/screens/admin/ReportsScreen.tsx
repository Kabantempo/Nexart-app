import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import { useTheme } from '../../stores/theme';
import { siteFetch } from '../../lib/siteApi';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

type Status = 'open' | 'resolved' | 'dismissed';

interface Report {
  id: string;
  status: string;
  reason: string | null;
  description: string | null;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
}

const TABS: { value: Status; label: string }[] = [
  { value: 'open', label: 'Ouverts' },
  { value: 'resolved', label: 'Résolus' },
  { value: 'dismissed', label: 'Rejetés' },
];

/** Modération des signalements, via les routes admin du site (refusées aux non-admins). */
export default function ReportsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [status, setStatus] = useState<Status>('open');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/admin/reports?status=${status}&limit=100`);
      const json = await res.json();
      setReports((json.data ?? []) as Report[]);
      setError(null);
    } catch {
      setError('Impossible de charger les signalements (accès réservé aux administrateurs).');
    }
    setLoading(false);
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const decide = (r: Report, next: 'resolved' | 'dismissed') =>
    Alert.alert(
      next === 'resolved' ? 'Marquer comme résolu ?' : 'Rejeter ce signalement ?',
      r.reason ?? '',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: next === 'resolved' ? 'Résolu' : 'Rejeter',
          onPress: async () => {
            try {
              await siteFetch(`/api/admin/reports/${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
              setReports(prev => prev.filter(x => x.id !== r.id));
            } catch (e) {
              Alert.alert('Action refusée', e instanceof Error ? e.message : 'Réessayez plus tard.');
            }
          },
        },
      ],
    );

  return (
    <EventScreenShell title="Signalements" onBack={() => navigation.goBack()} loading={loading} error={error} onRetry={load}>
      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.value} style={[s.chip, status === t.value && s.chipOn]} onPress={() => setStatus(t.value)}
            accessibilityRole="tab" accessibilityState={{ selected: status === t.value }}>
            <Text style={[s.chipText, status === t.value && s.chipTextOn]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={reports}
        keyExtractor={r => r.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={<Text style={s.empty}>Aucun signalement.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.reason}>{item.reason ?? 'Sans motif'}</Text>
            {item.description ? <Text style={s.desc}>{item.description}</Text> : null}
            <Text style={s.meta}>
              {item.target_type ?? '—'}{item.target_id ? ` · ${item.target_id.slice(0, 8)}` : ''} · {new Date(item.created_at).toLocaleDateString('fr-FR')}
            </Text>
            {status === 'open' ? (
              <View style={s.actions}>
                <TouchableOpacity style={s.primary} onPress={() => decide(item, 'resolved')} accessibilityRole="button">
                  <Text style={s.primaryText}>Résolu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.secondary} onPress={() => decide(item, 'dismissed')} accessibilityRole="button">
                  <Text style={s.secondaryText}>Rejeter</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      />
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.xs, padding: spacing.md, paddingBottom: 0 },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.accent },
  chipText: { ...typography.label, color: colors.text.secondary },
  chipTextOn: { color: colors.primary, fontWeight: '700' },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs,
  },
  reason: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  desc: { ...typography.body, color: colors.text.secondary },
  meta: { ...typography.caption, color: colors.text.secondary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  primary: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  primaryText: { ...typography.label, color: '#fff', fontWeight: '600' },
  secondary: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  secondaryText: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
});
