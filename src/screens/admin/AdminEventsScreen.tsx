import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import { useTheme } from '../../stores/theme';
import { siteFetch } from '../../lib/siteApi';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

type Status = 'draft' | 'published' | 'closed';
type Action = 'approve' | 'reject' | 'unpublish';

interface AdminEvent {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  stand_count: number | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

const TABS: { value: Status; label: string }[] = [
  { value: 'draft', label: 'Brouillons' },
  { value: 'published', label: 'Publiés' },
  { value: 'closed', label: 'Fermés' },
];

const CONFIRM: Record<Action, { title: string; button: string }> = {
  approve: { title: 'Approuver et publier cet événement ?', button: 'Approuver' },
  reject: { title: 'Rejeter cet événement ?', button: 'Rejeter' },
  unpublish: { title: 'Dépublier cet événement ?', button: 'Dépublier' },
};

/** Modération des événements, via les routes admin du site (refusées aux non-admins). */
export default function AdminEventsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [status, setStatus] = useState<Status>('draft');
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/admin/events?status=${status}&limit=100`);
      const json = await res.json();
      setEvents((json.data ?? []) as AdminEvent[]);
      setError(null);
    } catch {
      setError('Impossible de charger les événements (accès réservé aux administrateurs).');
    }
    setLoading(false);
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const run = (e: AdminEvent, action: Action) =>
    Alert.alert(CONFIRM[action].title, e.title, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: CONFIRM[action].button,
        style: action === 'approve' ? 'default' : 'destructive',
        onPress: async () => {
          try {
            await siteFetch('/api/admin/events', { method: 'POST', body: JSON.stringify({ event_id: e.id, action }) });
            setEvents(prev => prev.filter(x => x.id !== e.id));
          } catch (err) {
            Alert.alert('Action refusée', err instanceof Error ? err.message : 'Réessayez plus tard.');
          }
        },
      },
    ]);

  return (
    <EventScreenShell title="Événements" onBack={() => navigation.goBack()} loading={loading} error={error} onRetry={load}>
      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.value} style={[s.chip, status === t.value && s.chipOn]} onPress={() => setStatus(t.value)}
            accessibilityRole="tab" accessibilityState={{ selected: status === t.value }}>
            <Text style={[s.chipText, status === t.value && s.chipTextOn]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={events}
        keyExtractor={e => e.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={<Text style={s.empty}>Aucun événement.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.name}>{item.title}</Text>
            <Text style={s.meta}>
              {item.profiles?.full_name ?? 'Organisateur inconnu'} · {new Date(item.start_date).toLocaleDateString('fr-FR')} → {new Date(item.end_date).toLocaleDateString('fr-FR')}
              {item.stand_count != null ? ` · ${item.stand_count} stands` : ''}
            </Text>
            <View style={s.actions}>
              {status === 'draft' ? (
                <>
                  <TouchableOpacity style={s.primary} onPress={() => run(item, 'approve')} accessibilityRole="button">
                    <Text style={s.primaryText}>Approuver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.secondary} onPress={() => run(item, 'reject')} accessibilityRole="button">
                    <Text style={s.secondaryText}>Rejeter</Text>
                  </TouchableOpacity>
                </>
              ) : null}
              {status === 'published' ? (
                <TouchableOpacity style={s.secondary} onPress={() => run(item, 'unpublish')} accessibilityRole="button">
                  <Text style={s.secondaryText}>Dépublier</Text>
                </TouchableOpacity>
              ) : null}
            </View>
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
  name: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  meta: { ...typography.caption, color: colors.text.secondary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  primary: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  primaryText: { ...typography.label, color: '#fff', fontWeight: '600' },
  secondary: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  secondaryText: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
});
