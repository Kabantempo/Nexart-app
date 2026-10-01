import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import { supabase } from '../../lib/supabase';
import { siteFetch } from '../../lib/siteApi';
import { useTheme } from '../../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

export default function EventRemindersScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [first, setFirst] = useState('7');
  const [second, setSecond] = useState('14');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lecture directe : le site n'expose pas de route GET pour ces réglages. Valeurs par défaut du site : 7 et 14 jours.
  useEffect(() => {
    supabase
      .from('event_reminder_settings')
      .select('first_reminder_days, second_reminder_days')
      .eq('event_id', eventId)
      .maybeSingle()
      .then(({ data }) => {
        const d = data as { first_reminder_days: number | null; second_reminder_days: number | null } | null;
        if (d?.first_reminder_days) setFirst(String(d.first_reminder_days));
        if (d?.second_reminder_days) setSecond(String(d.second_reminder_days));
        setLoading(false);
      });
  }, [eventId]);

  const submit = async () => {
    const a = parseInt(first, 10);
    const b = parseInt(second, 10);
    if (!a || !b || a < 1 || b < 1) { Alert.alert('Délais invalides', 'Saisissez deux nombres de jours supérieurs à 0.'); return; }
    if (b <= a) { Alert.alert('Délais incohérents', 'La seconde relance doit venir après la première.'); return; }
    setSaving(true);
    try {
      await siteFetch(`/api/events/${eventId}/reminders`, {
        method: 'POST',
        body: JSON.stringify({ first_reminder_days: a, second_reminder_days: b }),
      });
      Alert.alert('Délais enregistrés');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Enregistrement impossible.');
    }
    setSaving(false);
  };

  return (
    <EventScreenShell title="Rappels" subtitle={eventTitle} onBack={() => navigation.goBack()} loading={loading}>
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <Text style={s.text}>
          Les exposants approuvés qui n'ont pas finalisé leur inscription reçoivent une relance par e-mail
          après ces délais.
        </Text>
        <Text style={s.label}>Première relance (jours après l'approbation)</Text>
        <TextInput style={s.input} value={first} onChangeText={setFirst} keyboardType="number-pad" />
        <Text style={s.label}>Seconde relance (jours)</Text>
        <TextInput style={s.input} value={second} onChangeText={setSecond} keyboardType="number-pad" />
        <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
          <Text style={s.btnText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </View>
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  text: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.sm },
  label: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm, color: colors.text.primary, ...typography.body,
  },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
});
