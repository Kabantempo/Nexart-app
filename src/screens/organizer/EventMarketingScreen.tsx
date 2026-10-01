import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EventScreenShell from '../../components/EventScreenShell';
import { useTheme } from '../../stores/theme';
import { useEventMarketing, MediaContact, Deadline } from '../../hooks/useEventMarketing';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EventMarketingScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { plan, loading, error, save, refetch } = useEventMarketing(eventId);

  const [press, setPress] = useState('');
  const [contacts, setContacts] = useState<MediaContact[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cOutlet, setCOutlet] = useState('');
  const [dDate, setDDate] = useState('');
  const [dTask, setDTask] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPress(plan.press_release);
    setContacts(plan.media_contacts);
    setDeadlines(plan.deadlines_calendar);
  }, [plan]);

  const addContact = () => {
    if (!cName.trim() || !EMAIL_RE.test(cEmail.trim())) { Alert.alert('Contact invalide', 'Nom et e-mail valide requis.'); return; }
    setContacts(c => [...c, { name: cName.trim(), email: cEmail.trim(), outlet: cOutlet.trim() || undefined }]);
    setCName(''); setCEmail(''); setCOutlet('');
  };

  const addDeadline = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dDate) || !dTask.trim()) { Alert.alert('Échéance invalide', 'Date AAAA-MM-JJ et tâche requises.'); return; }
    setDeadlines(d => [...d, { date: dDate, task: dTask.trim() }].sort((a, b) => a.date.localeCompare(b.date)));
    setDDate(''); setDTask('');
  };

  const submit = async () => {
    setSaving(true);
    const err = await save({ press_release: press, media_contacts: contacts, deadlines_calendar: deadlines });
    setSaving(false);
    Alert.alert(err ? 'Erreur' : 'Plan enregistré', err ?? undefined);
  };

  const input = (value: string, set: (v: string) => void, placeholder: string, extra: object = {}) => (
    <TextInput style={s.input} value={value} onChangeText={set} placeholder={placeholder}
      placeholderTextColor={colors.text.secondary} {...extra} />
  );

  return (
    <EventScreenShell title="Marketing" subtitle={eventTitle} onBack={() => navigation.goBack()}
      loading={loading} error={error} onRetry={refetch}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }} keyboardShouldPersistTaps="handled">
        <Text style={s.section}>Communiqué de presse</Text>
        <TextInput style={[s.input, s.multi]} value={press} onChangeText={setPress} multiline
          placeholder="Rédigez votre communiqué…" placeholderTextColor={colors.text.secondary} />

        <Text style={s.section}>Contacts presse ({contacts.length})</Text>
        {contacts.map((c, i) => (
          <View key={`${c.email}-${i}`} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{c.name}{c.outlet ? ` · ${c.outlet}` : ''}</Text>
              <Text style={s.meta} selectable>{c.email}</Text>
            </View>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" onPress={() => setContacts(cs => cs.filter((_, j) => j !== i))} accessibilityLabel={`Retirer ${c.name}`}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={s.form}>
          {input(cName, setCName, 'Nom')}
          {input(cEmail, setCEmail, 'E-mail', { keyboardType: 'email-address', autoCapitalize: 'none' })}
          {input(cOutlet, setCOutlet, 'Média (optionnel)')}
          <TouchableOpacity style={s.addBtn} onPress={addContact}><Text style={s.addText}>Ajouter le contact</Text></TouchableOpacity>
        </View>

        <Text style={s.section}>Échéances ({deadlines.length})</Text>
        {deadlines.map((d, i) => (
          <View key={`${d.date}-${i}`} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{d.task}</Text>
              <Text style={s.meta}>{d.date}</Text>
            </View>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" onPress={() => setDeadlines(ds => ds.filter((_, j) => j !== i))} accessibilityLabel={`Retirer ${d.task}`}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={s.form}>
          {input(dDate, setDDate, 'Date AAAA-MM-JJ', { keyboardType: 'numeric' })}
          {input(dTask, setDTask, 'Tâche')}
          <TouchableOpacity style={s.addBtn} onPress={addDeadline}><Text style={s.addText}>Ajouter l'échéance</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.save, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
          <Text style={s.saveText}>{saving ? 'Enregistrement…' : 'Enregistrer le plan'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  section: {
    ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm, color: colors.text.primary, ...typography.body,
  },
  multi: { minHeight: 140, textAlignVertical: 'top' },
  form: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, gap: spacing.sm,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.text.secondary },
  addBtn: { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  addText: { ...typography.label, color: colors.primary, fontWeight: '600' },
  save: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveText: { ...typography.label, color: '#fff', fontWeight: '600' },
});
