import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '../../stores/theme';
import { siteFetch } from '../../lib/siteApi';
import EventScreenShell from '../../components/EventScreenShell';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

interface AuditLog {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  description: string | null;
  created_at: string;
  accessed_sensitive_data: boolean | null;
}

const PAGE = 50;

/** Journal d'audit en lecture seule, réservé aux admins (la route du site refuse les autres). */
export default function AuditLogScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sensitive, setSensitive] = useState(false);

  const load = useCallback(async (offset: number, replace: boolean) => {
    if (replace) setLoading(true); else setMore(true);
    try {
      const res = await siteFetch(`/api/audit-logs?limit=${PAGE}&offset=${offset}${sensitive ? '&sensitive_only=true' : ''}`);
      const json = await res.json();
      setLogs(prev => (replace ? json.logs : [...prev, ...json.logs]) as AuditLog[]);
      setTotal(json.total ?? 0);
      setError(null);
    } catch {
      setError('Impossible de charger le journal (accès réservé aux administrateurs).');
    }
    setLoading(false);
    setMore(false);
  }, [sensitive]);

  useEffect(() => { load(0, true); }, [load]);

  return (
    <EventScreenShell title="Journal d'audit" subtitle={`${total} entrée${total > 1 ? 's' : ''}`} onBack={() => navigation.goBack()}
      loading={loading} error={error} onRetry={() => load(0, true)}>
      <View style={s.filterRow}>
        <TouchableOpacity style={[s.chip, sensitive && s.chipOn]} onPress={() => setSensitive(v => !v)}
          accessibilityRole="checkbox" accessibilityState={{ checked: sensitive }}>
          <Text style={[s.chipText, sensitive && s.chipTextOn]}>Données sensibles seulement</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={logs}
        keyExtractor={l => l.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={<Text style={s.empty}>Aucune entrée.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.top}>
              <Text style={s.action}>{item.action}</Text>
              {item.accessed_sensitive_data ? <Text style={s.flag}>sensible</Text> : null}
            </View>
            <Text style={s.meta}>{item.resource_type ?? '—'}{item.resource_id ? ` · ${item.resource_id.slice(0, 8)}` : ''}</Text>
            {item.description ? <Text style={s.desc}>{item.description}</Text> : null}
            <Text style={s.meta}>{new Date(item.created_at).toLocaleString('fr-FR')}</Text>
          </View>
        )}
        ListFooterComponent={
          logs.length < total ? (
            <TouchableOpacity style={s.moreBtn} onPress={() => load(logs.length, false)} disabled={more}>
              {more ? <ActivityIndicator color={colors.primary} /> : <Text style={s.moreText}>Voir plus</Text>}
            </TouchableOpacity>
          ) : null
        }
      />
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  filterRow: { padding: spacing.md, paddingBottom: 0, flexDirection: 'row' },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.accent },
  chipText: { ...typography.label, color: colors.text.secondary },
  chipTextOn: { color: colors.primary, fontWeight: '600' },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: 2,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  action: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  flag: { ...typography.caption, color: colors.error, fontWeight: '700' },
  desc: { ...typography.body, color: colors.text.secondary },
  meta: { ...typography.caption, color: colors.text.secondary },
  moreBtn: { padding: spacing.md, alignItems: 'center' },
  moreText: { ...typography.label, color: colors.primary, fontWeight: '600' },
});
