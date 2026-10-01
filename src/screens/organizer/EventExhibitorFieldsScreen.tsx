import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EventScreenShell from '../../components/EventScreenShell';
import { useTheme } from '../../stores/theme';
import {
  useExhibitorFields, ExhibitorField, FieldType, FIELD_TYPE_LABELS, fieldNameFromLabel,
} from '../../hooks/useExhibitorFields';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const TYPES = Object.keys(FIELD_TYPE_LABELS) as FieldType[];

export default function EventExhibitorFieldsScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { fields, loading, error, save, refetch } = useExhibitorFields(eventId);

  const [local, setLocal] = useState<ExhibitorField[]>([]);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<FieldType>('text');
  const [options, setOptions] = useState('');
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setLocal(fields); setDirty(false); }, [fields]);

  const add = () => {
    const name = fieldNameFromLabel(label.trim());
    if (!label.trim()) { Alert.alert('Libellé requis'); return; }
    if (local.some(f => f.field_name === name)) { Alert.alert('Champ déjà présent', 'Un champ porte déjà ce nom.'); return; }
    const opts = options.split(',').map(o => o.trim()).filter(Boolean);
    if (type === 'select' && opts.length < 2) { Alert.alert('Choix requis', 'Indiquez au moins deux options, séparées par des virgules.'); return; }
    setLocal([...local, { field_name: name, field_label: label.trim(), field_type: type, options: type === 'select' ? opts : null, required }]);
    setLabel(''); setOptions(''); setRequired(false); setType('text'); setDirty(true);
  };

  const submit = async () => {
    setSaving(true);
    const err = await save(local);
    setSaving(false);
    if (err) Alert.alert('Erreur', err);
  };

  return (
    <EventScreenShell title="Formulaire exposant" subtitle={eventTitle} onBack={() => navigation.goBack()} loading={loading} error={error} onRetry={refetch}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
        <Text style={s.note}>Ces questions s'ajoutent à la candidature des exposants. Leurs réponses apparaissent dans la liste des exposants et dans l'export.</Text>

        {local.length === 0 ? <Text style={s.empty}>Aucun champ personnalisé.</Text> : null}
        {local.map((f, i) => (
          <View key={f.field_name} style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{f.field_label}{f.required ? ' *' : ''}</Text>
              <Text style={s.meta}>{FIELD_TYPE_LABELS[f.field_type]}{f.options ? ` : ${f.options.join(', ')}` : ''}</Text>
            </View>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel={`Retirer ${f.field_label}`}
              onPress={() => { setLocal(local.filter((_, j) => j !== i)); setDirty(true); }}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={s.form}>
          <Text style={s.formTitle}>Ajouter un champ</Text>
          <TextInput style={s.input} value={label} onChangeText={setLabel} placeholder="Libellé (ex : Nombre de tables)" placeholderTextColor={colors.text.secondary} />
          <View style={s.types}>
            {TYPES.map(t => (
              <TouchableOpacity key={t} style={[s.chip, type === t && s.chipActive]} onPress={() => setType(t)} accessibilityRole="button" accessibilityState={{ selected: type === t }}>
                <Text style={[s.chipText, type === t && s.chipTextActive]}>{FIELD_TYPE_LABELS[t]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {type === 'select' ? (
            <TextInput style={s.input} value={options} onChangeText={setOptions} placeholder="Options séparées par des virgules" placeholderTextColor={colors.text.secondary} />
          ) : null}
          <TouchableOpacity style={s.reqRow} onPress={() => setRequired(!required)} accessibilityRole="checkbox" accessibilityState={{ checked: required }}>
            <Ionicons name={required ? 'checkbox' : 'square-outline'} size={22} color={colors.primary} />
            <Text style={s.reqText}>Réponse obligatoire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnGhost} onPress={add} accessibilityRole="button"><Text style={s.btnGhostText}>Ajouter à la liste</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.btn, (!dirty || saving) && { opacity: 0.5 }]} onPress={submit} disabled={!dirty || saving} accessibilityRole="button">
          <Text style={s.btnText}>{saving ? 'Enregistrement…' : 'Enregistrer le formulaire'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  note: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.md },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginVertical: spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.text.secondary },
  form: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, gap: spacing.sm, marginVertical: spacing.md,
  },
  formTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  input: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.sm, color: colors.text.primary, ...typography.body,
  },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 44, justifyContent: 'center' },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.accent },
  chipText: { ...typography.label, color: colors.text.secondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44 },
  reqText: { ...typography.body, color: colors.text.primary },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
  btnGhost: { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  btnGhostText: { ...typography.label, color: colors.primary, fontWeight: '600' },
});
