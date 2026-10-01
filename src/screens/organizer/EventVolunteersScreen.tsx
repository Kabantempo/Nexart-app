import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../stores/theme';
import { useEventVolunteers } from '../../hooks/useEventVolunteers';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

type Tab = 'volunteers' | 'shifts';

export default function EventVolunteersScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { volunteers, shifts, loading, error, addVolunteer, removeVolunteer, addShift, refetch } =
    useEventVolunteers(eventId);

  const [tab, setTab] = useState<Tab>('volunteers');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('5');
  const [saving, setSaving] = useState(false);

  const fail = (msg: string | null) => { if (msg) Alert.alert('Erreur', msg); return !msg; };

  const submitVolunteer = async () => {
    if (!name.trim()) { Alert.alert('Nom requis'); return; }
    setSaving(true);
    const ok = fail(await addVolunteer({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined }));
    setSaving(false);
    if (ok) { setName(''); setEmail(''); setPhone(''); }
  };

  const submitShift = async () => {
    if (!role.trim()) { Alert.alert('Rôle requis', 'Ex : accueil, installation, caisse.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { Alert.alert('Date invalide', 'Format AAAA-MM-JJ.'); return; }
    const cap = parseInt(capacity, 10);
    if (!cap || cap < 1) { Alert.alert('Capacité invalide'); return; }
    setSaving(true);
    const ok = fail(await addShift({ role: role.trim(), date, time: time.trim(), capacity: cap }));
    setSaving(false);
    if (ok) { setRole(''); setDate(''); setTime(''); setCapacity('5'); }
  };

  const confirmRemove = (id: string, label: string) =>
    Alert.alert('Retirer ce bénévole ?', label, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: async () => { fail(await removeVolunteer(id)); } },
    ]);

  const field = (value: string, set: (v: string) => void, placeholder: string, kb?: 'email-address' | 'phone-pad' | 'numeric') => (
    <TextInput
      style={s.input}
      value={value}
      onChangeText={set}
      placeholder={placeholder}
      placeholderTextColor={colors.text.secondary}
      keyboardType={kb}
      autoCapitalize={kb === 'email-address' ? 'none' : 'sentences'}
    />
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Bénévoles</Text>
          <Text style={s.subtitle} numberOfLines={1}>{eventTitle}</Text>
        </View>
      </View>

      <View style={s.tabs}>
        {([['volunteers', `Bénévoles (${volunteers.length})`], ['shifts', `Créneaux (${shifts.length})`]] as const).map(([k, label]) => (
          <TouchableOpacity key={k} style={[s.tab, tab === k && s.tabActive]} onPress={() => setTab(k)}
            accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
            <Text style={[s.tabText, tab === k && s.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : error ? (
        <View style={s.center}>
          <Text style={s.empty}>{error}</Text>
          <TouchableOpacity style={s.retry} onPress={refetch}><Text style={s.retryText}>Réessayer</Text></TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md }} keyboardShouldPersistTaps="handled">
          {tab === 'volunteers' ? (
            <>
              <View style={s.form}>
                <Text style={s.formTitle}>Ajouter un bénévole</Text>
                {field(name, setName, 'Nom')}
                {field(email, setEmail, 'E-mail (optionnel)', 'email-address')}
                {field(phone, setPhone, 'Téléphone (optionnel)', 'phone-pad')}
                <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} onPress={submitVolunteer} disabled={saving}>
                  <Text style={s.btnText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
              {volunteers.length === 0 ? <Text style={[s.empty, { marginTop: spacing.lg }]}>Aucun bénévole pour l'instant.</Text> : null}
              {volunteers.map(v => (
                <View key={v.id} style={s.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{v.name}</Text>
                    {v.email ? <Text style={s.meta} selectable>{v.email}</Text> : null}
                    {v.phone ? <Text style={s.meta} selectable>{v.phone}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => confirmRemove(v.id, v.name)} accessibilityLabel={`Retirer ${v.name}`}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <>
              <View style={s.form}>
                <Text style={s.formTitle}>Ajouter un créneau</Text>
                {field(role, setRole, 'Rôle (accueil, caisse…)')}
                {field(date, setDate, 'Date AAAA-MM-JJ', 'numeric')}
                {field(time, setTime, 'Heure (ex : 09:00)', 'numeric')}
                {field(capacity, setCapacity, 'Nombre de places', 'numeric')}
                <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} onPress={submitShift} disabled={saving}>
                  <Text style={s.btnText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
              {shifts.length === 0 ? <Text style={[s.empty, { marginTop: spacing.lg }]}>Aucun créneau pour l'instant.</Text> : null}
              {shifts.map(sh => (
                <View key={sh.id} style={s.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{sh.role ?? 'Créneau'}</Text>
                    <Text style={s.meta}>{[sh.date, sh.time?.slice(0, 5)].filter(Boolean).join(' · ')}</Text>
                  </View>
                  <View style={s.badge}><Text style={s.badgeText}>{sh.assigned}/{sh.capacity}</Text></View>
                </View>
              ))}
            </>
          )}
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
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { ...typography.label, color: colors.text.secondary },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  retry: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  retryText: { ...typography.label, color: '#fff', fontWeight: '600' },
  form: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, marginBottom: spacing.md,
  },
  formTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  input: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm, color: colors.text.primary, ...typography.body,
  },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.text.secondary },
  badge: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});
