import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EventScreenShell from '../../components/EventScreenShell';
import { useTheme } from '../../stores/theme';
import { useEventTasks, TaskStatus, TASK_STATUS_LABELS } from '../../hooks/useEventTasks';
import { useEventTeam } from '../../hooks/useEventTeam';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const STATUSES: TaskStatus[] = ['not_started', 'in_progress', 'completed'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function EventTasksScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { tasks, loading, error, add, setStatus, remove, refetch } = useEventTasks(eventId);
  const { members } = useEventTeam(eventId);

  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignee, setAssignee] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const visible = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const assignable = members.filter(m => m.user_id);

  const submit = async () => {
    if (!title.trim()) { Alert.alert('Titre requis'); return; }
    if (deadline && !DATE_RE.test(deadline)) { Alert.alert('Date invalide', 'Format AAAA-MM-JJ.'); return; }
    setSaving(true);
    const err = await add({ title, description, assignee_id: assignee ?? undefined, deadline });
    setSaving(false);
    if (err) Alert.alert('Erreur', err);
    else { setTitle(''); setDescription(''); setDeadline(''); setAssignee(null); }
  };

  const confirmRemove = (id: string, name: string) =>
    Alert.alert('Supprimer cette tâche ?', name, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { const e = await remove(id); if (e) Alert.alert('Erreur', e); } },
    ]);

  const memberName = (m: typeof members[number]) => m.profiles?.full_name ?? (m.profiles?.username ? `@${m.profiles.username}` : 'Membre');

  return (
    <EventScreenShell title="Tâches" subtitle={eventTitle} onBack={() => navigation.goBack()} loading={loading} error={error} onRetry={refetch}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }} keyboardShouldPersistTaps="handled">
        <View style={s.filters}>
          {(['all', ...STATUSES] as const).map(f => (
            <TouchableOpacity key={f} style={[s.chip, filter === f && s.chipOn]} onPress={() => setFilter(f)}
              accessibilityRole="radio" accessibilityState={{ selected: filter === f }}>
              <Text style={[s.chipText, filter === f && s.chipTextOn]}>{f === 'all' ? `Toutes (${tasks.length})` : TASK_STATUS_LABELS[f]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.form}>
          <Text style={s.formTitle}>Nouvelle tâche</Text>
          <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Titre" placeholderTextColor={colors.text.secondary} />
          <TextInput style={[s.input, s.multi]} value={description} onChangeText={setDescription} placeholder="Description (optionnel)"
            placeholderTextColor={colors.text.secondary} multiline />
          <TextInput style={s.input} value={deadline} onChangeText={setDeadline} placeholder="Échéance AAAA-MM-JJ (optionnel)"
            placeholderTextColor={colors.text.secondary} keyboardType="numeric" />
          {assignable.length ? (
            <View style={s.filters}>
              {assignable.map(m => {
                const on = assignee === m.user_id;
                return (
                  <TouchableOpacity key={m.id} style={[s.chip, on && s.chipOn]} onPress={() => setAssignee(on ? null : m.user_id)}
                    accessibilityRole="radio" accessibilityState={{ selected: on }}>
                    <Text style={[s.chipText, on && s.chipTextOn]}>{memberName(m)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
          <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
            <Text style={s.btnText}>{saving ? 'Ajout…' : 'Ajouter'}</Text>
          </TouchableOpacity>
        </View>

        {visible.length === 0 ? <Text style={s.empty}>Aucune tâche.</Text> : null}
        {visible.map(t => (
          <View key={t.id} style={s.card}>
            <View style={s.top}>
              <Text style={[s.name, t.status === 'completed' && s.done]}>{t.title}</Text>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" onPress={() => confirmRemove(t.id, t.title)} accessibilityLabel={`Supprimer ${t.title}`}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
            {t.description ? <Text style={s.meta}>{t.description}</Text> : null}
            <Text style={s.meta}>
              {[t.profiles?.full_name ? `Responsable : ${t.profiles.full_name}` : null,
                t.deadline ? `Échéance : ${new Date(t.deadline).toLocaleDateString('fr-FR')}` : null].filter(Boolean).join(' · ') || 'Sans responsable'}
            </Text>
            <View style={s.filters}>
              {STATUSES.map(st => (
                <TouchableOpacity key={st} style={[s.chip, t.status === st && s.chipOn]}
                  onPress={async () => { if (t.status !== st) { const e = await setStatus(t.id, st); if (e) Alert.alert('Erreur', e); } }}
                  accessibilityRole="radio" accessibilityState={{ selected: t.status === st }}>
                  <Text style={[s.chipText, t.status === st && s.chipTextOn]}>{TASK_STATUS_LABELS[st]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.accent },
  chipText: { ...typography.caption, color: colors.text.secondary },
  chipTextOn: { color: colors.primary, fontWeight: '700' },
  form: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, marginVertical: spacing.md,
  },
  formTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  input: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm, color: colors.text.primary, ...typography.body,
  },
  multi: { minHeight: 70, textAlignVertical: 'top' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600', flex: 1 },
  done: { color: colors.text.secondary, textDecorationLine: 'line-through' },
  meta: { ...typography.caption, color: colors.text.secondary },
});
