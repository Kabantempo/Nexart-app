import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EventScreenShell from '../../components/EventScreenShell';
import { useAuth } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import { useItinerary } from '../../hooks/useItinerary';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const fmt = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

export default function ItineraryScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { entries, loading, error, add, remove, refetch } = useItinerary(user?.id);

  const [label, setLabel] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!label.trim()) { Alert.alert('Libellé requis', 'Ex : Tournée Bretagne.'); return; }
    if (!DATE_RE.test(start) || !DATE_RE.test(end)) { Alert.alert('Dates invalides', 'Format AAAA-MM-JJ.'); return; }
    if (end < start) { Alert.alert('Dates incohérentes', 'La fin doit suivre le début.'); return; }
    setSaving(true);
    const err = await add({ label, region, city, start_date: start, end_date: end, is_public: isPublic });
    setSaving(false);
    if (err) Alert.alert('Erreur', err);
    else { setLabel(''); setRegion(''); setCity(''); setStart(''); setEnd(''); }
  };

  const confirmRemove = (id: string, name: string) =>
    Alert.alert('Supprimer cette étape ?', name, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { const e = await remove(id); if (e) Alert.alert('Erreur', e); } },
    ]);

  const input = (value: string, set: (v: string) => void, placeholder: string, kb?: 'numeric') => (
    <TextInput style={s.input} value={value} onChangeText={set} placeholder={placeholder}
      placeholderTextColor={colors.text.secondary} keyboardType={kb} />
  );

  return (
    <EventScreenShell title="Carnet de route" onBack={() => navigation.goBack()} loading={loading} error={error} onRetry={refetch}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }} keyboardShouldPersistTaps="handled">
        <View style={s.form}>
          <Text style={s.formTitle}>Ajouter une étape</Text>
          {input(label, setLabel, 'Libellé (ex : Tournée Bretagne)')}
          {input(region, setRegion, 'Région (optionnel)')}
          {input(city, setCity, 'Ville (optionnel)')}
          {input(start, setStart, 'Début AAAA-MM-JJ', 'numeric')}
          {input(end, setEnd, 'Fin AAAA-MM-JJ', 'numeric')}
          <View style={s.switchRow}>
            <Text style={s.switchText}>Visible par les organisateurs et vos abonnés</Text>
            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: colors.primary, false: colors.border }} />
          </View>
          <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
            <Text style={s.btnText}>{saving ? 'Ajout…' : 'Ajouter'}</Text>
          </TouchableOpacity>
        </View>

        {entries.length === 0 ? <Text style={s.empty}>Aucune étape à venir.</Text> : null}
        {entries.map(e => (
          <View key={e.id} style={s.card}>
            <Ionicons name={e.is_public ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.text.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{e.label}</Text>
              <Text style={s.meta}>
                {fmt(e.start_date)} → {fmt(e.end_date)}{[e.city, e.region].filter(Boolean).length ? ` · ${[e.city, e.region].filter(Boolean).join(', ')}` : ''}
              </Text>
            </View>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" onPress={() => confirmRemove(e.id, e.label)} accessibilityLabel={`Supprimer ${e.label}`}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  form: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, marginBottom: spacing.md,
  },
  formTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  input: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm, color: colors.text.primary, ...typography.body,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  switchText: { ...typography.caption, color: colors.text.secondary, flex: 1 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.text.secondary },
});
