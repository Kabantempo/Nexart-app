import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../stores/theme';
import { useEventChecklist, ChecklistType, CHECKLIST_TYPE_LABELS } from '../../hooks/useEventChecklist';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const TYPES: ChecklistType[] = ['salon', 'popup', 'other'];

export default function EventChecklistScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { items, exists, done, percent, loading, error, initialize, toggle, add, remove, refetch } =
    useEventChecklist(eventId);
  const [newTitle, setNewTitle] = useState('');

  const fail = (msg: string | null) => { if (msg) Alert.alert('Erreur', msg); return !msg; };

  const submit = async () => {
    if (!newTitle.trim()) return;
    if (fail(await add(newTitle))) setNewTitle('');
  };

  const confirmRemove = (index: number) =>
    Alert.alert('Supprimer cette tâche ?', items[index]?.title ?? '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { fail(await remove(index)); } },
    ]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Checklist</Text>
          <Text style={s.subtitle} numberOfLines={1}>{eventTitle}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : error ? (
        <View style={s.center}>
          <Text style={s.empty}>{error}</Text>
          <TouchableOpacity style={s.retry} onPress={refetch}><Text style={s.retryText}>Réessayer</Text></TouchableOpacity>
        </View>
      ) : !exists ? (
        <View style={s.center}>
          <Text style={s.empty}>Aucune checklist pour cet événement. Choisissez un modèle pour commencer.</Text>
          {TYPES.map(t => (
            <TouchableOpacity key={t} style={s.typeBtn} onPress={async () => { fail(await initialize(t)); }}>
              <Text style={s.typeBtnText}>{CHECKLIST_TYPE_LABELS[t]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md }} keyboardShouldPersistTaps="handled">
          <Text style={s.progressLabel}>{done} sur {items.length} tâches faites · {percent} %</Text>
          <View style={s.bar}><View style={[s.barFill, { width: `${percent}%` }]} /></View>

          {items.map((it, i) => (
            <TouchableOpacity key={`${i}-${it.title}`} style={s.card} onPress={async () => { fail(await toggle(i)); }}
              onLongPress={() => confirmRemove(i)} activeOpacity={0.8}
              accessibilityRole="checkbox" accessibilityState={{ checked: !!it.completed }}>
              <Ionicons
                name={it.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={it.completed ? colors.success : colors.text.secondary}
              />
              <View style={{ flex: 1 }}>
                <Text style={[s.name, it.completed && s.nameDone]}>{it.title}</Text>
                {it.description ? <Text style={s.meta}>{it.description}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => confirmRemove(i)} accessibilityLabel={`Supprimer ${it.title}`}>
                <Ionicons name="trash-outline" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <View style={s.addRow}>
            <TextInput
              style={s.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Nouvelle tâche"
              placeholderTextColor={colors.text.secondary}
              onSubmitEditing={submit}
              returnKeyType="done"
            />
            <TouchableOpacity style={s.addBtn} onPress={submit} accessibilityLabel="Ajouter la tâche">
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: { width: 32 },
  title: { ...typography.h3, color: colors.text.primary },
  subtitle: { ...typography.caption, color: colors.text.secondary },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  retry: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  retryText: { ...typography.label, color: '#fff', fontWeight: '600' },
  typeBtn: {
    width: '70%', alignItems: 'center', padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.accent,
  },
  typeBtnText: { ...typography.label, color: colors.primary, fontWeight: '600' },
  progressLabel: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.xs },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden', marginBottom: spacing.md },
  barFill: { height: '100%', backgroundColor: colors.success },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  nameDone: { color: colors.text.secondary, textDecorationLine: 'line-through' },
  meta: { ...typography.caption, color: colors.text.secondary },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  input: {
    flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm, color: colors.text.primary, ...typography.body,
  },
  addBtn: { width: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
