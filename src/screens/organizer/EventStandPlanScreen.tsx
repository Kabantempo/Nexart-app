import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EventScreenShell from '../../components/EventScreenShell';
import { supabase } from '../../lib/supabase';
import { DEMO_MODE } from '../../lib/demoData';
import { useTheme } from '../../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

type StandStatus = 'available' | 'reserved' | 'occupied' | 'blocked';

interface Stand {
  id: string; row: string; col: number; label: string; status: StandStatus;
  width: number; height: number; price?: number; assignee?: string;
}

/** Même structure que `events.stand_plan` côté site. */
interface StandPlan { rows: number; cols: number; cellSize: number; stands: Stand[] }

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MAX_ROWS = 10;
const MAX_COLS = 12;
const ORDER: StandStatus[] = ['available', 'reserved', 'occupied', 'blocked'];
const LABELS: Record<StandStatus, string> = {
  available: 'Disponible', reserved: 'Réservé', occupied: 'Occupé', blocked: 'Bloqué',
};

function generateStands(rows: number, cols: number, existing: Stand[]): Stand[] {
  const byId = new Map(existing.map(s => [s.id, s]));
  const out: Stand[] = [];
  for (let r = 0; r < rows; r++) {
    const row = ALPHABET[r] ?? `R${r}`;
    for (let c = 1; c <= cols; c++) {
      const id = `${row}${c}`;
      out.push(byId.get(id) ?? { id, row, col: c, label: id, status: 'available', width: 1, height: 1 });
    }
  }
  return out;
}

export default function EventStandPlanScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [plan, setPlan] = useState<StandPlan>({ rows: 4, cols: 6, cellSize: 1, stands: generateStands(4, 6, []) });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    if (DEMO_MODE) { setError(null); setLoading(false); return; }
    const { data, error: err } = await supabase.from('events').select('stand_plan').eq('id', eventId).single();
    if (err) setError('Impossible de charger le plan.');
    else {
      const saved = (data as { stand_plan: StandPlan | null } | null)?.stand_plan;
      if (saved?.stands?.length) setPlan(saved);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [eventId]);

  const color = (st: StandStatus) => ({
    available: colors.success, reserved: colors.warning ?? '#F59E0B', occupied: colors.primary, blocked: colors.text.secondary,
  }[st]);

  const resize = (dRows: number, dCols: number) => {
    const rows = Math.min(MAX_ROWS, Math.max(1, plan.rows + dRows));
    const cols = Math.min(MAX_COLS, Math.max(1, plan.cols + dCols));
    setPlan(p => ({ ...p, rows, cols, stands: generateStands(rows, cols, p.stands) }));
    setDirty(true);
  };

  const cycle = (id: string) => {
    setPlan(p => ({
      ...p,
      stands: p.stands.map(st => (st.id === id ? { ...st, status: ORDER[(ORDER.indexOf(st.status) + 1) % ORDER.length] } : st)),
    }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    if (DEMO_MODE) { setSaving(false); setDirty(false); return; }
    const { error: err } = await supabase.from('events').update({ stand_plan: plan }).eq('id', eventId);
    setSaving(false);
    if (err) Alert.alert('Erreur', 'Le plan n’a pas pu être enregistré.');
    else setDirty(false);
  };

  const counts = ORDER.map(st => ({ st, n: plan.stands.filter(x => x.status === st).length }));

  return (
    <EventScreenShell title="Plan des stands" subtitle={eventTitle} onBack={() => navigation.goBack()}
      loading={loading} error={error} onRetry={load}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={s.controls}>
          {([['Lignes', plan.rows, -1, 0, 1, 0], ['Colonnes', plan.cols, 0, -1, 0, 1]] as const).map(([label, value, dr1, dc1, dr2, dc2]) => (
            <View key={label} style={s.stepper}>
              <Text style={s.stepLabel}>{label}</Text>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" style={s.stepBtn} onPress={() => resize(dr1, dc1)} accessibilityLabel={`Moins de ${label.toLowerCase()}`}>
                <Ionicons name="remove" size={18} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={s.stepValue}>{value}</Text>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" style={s.stepBtn} onPress={() => resize(dr2, dc2)} accessibilityLabel={`Plus de ${label.toLowerCase()}`}>
                <Ionicons name="add" size={18} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={s.hint}>Touchez un stand pour changer son statut.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {Array.from({ length: plan.rows }, (_, r) => (
              <View key={r} style={s.gridRow}>
                {plan.stands.filter(st => st.row === (ALPHABET[r] ?? `R${r}`)).map(st => (
                  <TouchableOpacity key={st.id} onPress={() => cycle(st.id)}
                    style={[s.cell, { borderColor: color(st.status), backgroundColor: color(st.status) + '22' }]}
                    accessibilityLabel={`${st.label} ${LABELS[st.status]}`}>
                    <Text style={[s.cellText, { color: color(st.status) }]}>{st.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={s.legend}>
          {counts.map(({ st, n }) => (
            <View key={st} style={s.legendItem}>
              <View style={[s.dot, { backgroundColor: color(st) }]} />
              <Text style={s.legendText}>{LABELS[st]} · {n}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[s.save, (!dirty || saving) && { opacity: 0.5 }]} onPress={save} disabled={!dirty || saving}>
          <Text style={s.saveText}>{saving ? 'Enregistrement…' : dirty ? 'Enregistrer le plan' : 'Plan à jour'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  controls: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', marginBottom: spacing.md },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepLabel: { ...typography.label, color: colors.text.secondary },
  stepBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  stepValue: { ...typography.label, color: colors.text.primary, minWidth: 20, textAlign: 'center' },
  hint: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm },
  gridRow: { flexDirection: 'row' },
  cell: {
    width: 52, height: 44, margin: 2, borderWidth: 1.5, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  cellText: { ...typography.caption, fontWeight: '700' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { ...typography.caption, color: colors.text.secondary },
  save: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveText: { ...typography.label, color: '#fff', fontWeight: '600' },
});
