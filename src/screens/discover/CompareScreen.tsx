import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../stores/theme';
import { useEvents } from '../../hooks/useEvents';
import { Event } from '../../types';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const MAX = 3;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const price = (e: Event) => (e.stand_price == null ? '—' : e.stand_price === 0 ? 'Gratuit' : `${e.stand_price} €`);

const ROWS: { label: string; value: (e: Event) => string }[] = [
  { label: 'Ville', value: e => [e.city, e.region].filter(Boolean).join(', ') || '—' },
  { label: 'Dates', value: e => `${formatDate(e.start_date)} → ${formatDate(e.end_date)}` },
  { label: 'Type', value: e => e.event_type },
  { label: 'Prix du stand', value: price },
  { label: 'Stands', value: e => (e.stand_count != null ? String(e.stand_count) : '—') },
  { label: 'Dimensions', value: e => e.stand_dimensions || '—' },
  { label: 'Disciplines', value: e => (e.discipline_tags?.length ? e.discipline_tags.join(', ') : '—') },
];

export default function CompareScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { events, loading } = useEvents({ limit: 100 });
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (id: string) =>
    setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : p.length >= MAX ? p : [...p, id]));

  const chosen = picked.map(id => events.find(e => e.id === id)).filter((e): e is Event => !!e);

  if (loading) {
    return <View style={s.container}><ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} /></View>;
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
      <Text style={s.intro}>Choisissez jusqu'à {MAX} marchés à comparer ({picked.length}/{MAX}).</Text>

      {events.map(e => {
        const on = picked.includes(e.id);
        const full = !on && picked.length >= MAX;
        return (
          <TouchableOpacity key={e.id} style={[s.pick, on && s.pickOn, full && { opacity: 0.45 }]}
            onPress={() => toggle(e.id)} disabled={full}
            accessibilityRole="checkbox" accessibilityState={{ checked: on, disabled: full }}>
            <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? colors.primary : colors.text.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{e.title}</Text>
              <Text style={s.meta}>{[e.city, formatDate(e.start_date)].filter(Boolean).join(' · ')}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {chosen.length >= 2 ? (
        <>
          <Text style={s.section}>Comparaison</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={s.tableRow}>
                <View style={[s.cell, s.labelCell]} />
                {chosen.map(e => (
                  <View key={e.id} style={[s.cell, s.headCell]}><Text style={s.headText} numberOfLines={3}>{e.title}</Text></View>
                ))}
              </View>
              {ROWS.map(r => (
                <View key={r.label} style={s.tableRow}>
                  <View style={[s.cell, s.labelCell]}><Text style={s.labelText}>{r.label}</Text></View>
                  {chosen.map(e => (
                    <View key={e.id} style={s.cell}><Text style={s.cellText}>{r.value(e)}</Text></View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      ) : (
        <Text style={s.hint}>Sélectionnez au moins deux marchés pour afficher le tableau.</Text>
      )}
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  intro: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.md },
  pick: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  pickOn: { borderColor: colors.primary },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.text.secondary },
  section: {
    ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  hint: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.lg },
  tableRow: { flexDirection: 'row' },
  cell: {
    width: 150, padding: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    backgroundColor: colors.surface, justifyContent: 'center',
  },
  labelCell: { width: 110, backgroundColor: colors.background },
  headCell: { backgroundColor: colors.accent },
  headText: { ...typography.label, color: colors.primary, fontWeight: '700' },
  labelText: { ...typography.caption, color: colors.text.secondary, fontWeight: '600' },
  cellText: { ...typography.caption, color: colors.text.primary },
});
