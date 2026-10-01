import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../stores/theme';
import { useEventTeam, TeamRole, TEAM_ROLE_LABELS } from '../../hooks/useEventTeam';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const ROLES: TeamRole[] = ['co_organizer', 'volunteer'];

export default function EventTeamScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { members, loading, error, invite, remove, refetch } = useEventTeam(eventId);

  const [username, setUsername] = useState('');
  const [role, setRole] = useState<TeamRole>('co_organizer');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!username.trim()) { Alert.alert('Pseudo requis', 'Saisissez le @pseudo du membre à inviter.'); return; }
    setSaving(true);
    const err = await invite(username.replace(/^@/, ''), role);
    setSaving(false);
    if (err) Alert.alert('Invitation impossible', err);
    else setUsername('');
  };

  const confirmRemove = (id: string, label: string) =>
    Alert.alert("Retirer de l'équipe ?", label, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => { const err = await remove(id); if (err) Alert.alert('Erreur', err); },
      },
    ]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Équipe</Text>
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
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md }} keyboardShouldPersistTaps="handled">
          <View style={s.form}>
            <Text style={s.formTitle}>Inviter par @pseudo</Text>
            <TextInput
              style={s.input}
              value={username}
              onChangeText={setUsername}
              placeholder="@pseudo"
              placeholderTextColor={colors.text.secondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={s.roleRow}>
              {ROLES.map(r => (
                <TouchableOpacity key={r} style={[s.roleChip, role === r && s.roleChipActive]} onPress={() => setRole(r)}
                  accessibilityRole="radio" accessibilityState={{ selected: role === r }}>
                  <Text style={[s.roleText, role === r && s.roleTextActive]}>{TEAM_ROLE_LABELS[r]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
              <Text style={s.btnText}>{saving ? 'Invitation…' : 'Inviter'}</Text>
            </TouchableOpacity>
          </View>

          {members.length === 0 ? <Text style={[s.empty, { marginTop: spacing.lg }]}>Aucun membre dans l'équipe.</Text> : null}
          {members.map(m => {
            const label = m.profiles?.full_name ?? (m.profiles?.username ? `@${m.profiles.username}` : 'Membre');
            return (
              <View key={m.id} style={s.card}>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{label}</Text>
                  <Text style={s.meta}>
                    {TEAM_ROLE_LABELS[m.role] ?? m.role}
                    {m.profiles?.username ? ` · @${m.profiles.username}` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => confirmRemove(m.id, label)} accessibilityLabel={`Retirer ${label}`}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            );
          })}
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
  form: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, marginBottom: spacing.md,
  },
  formTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  input: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm, color: colors.text.primary, ...typography.body,
  },
  roleRow: { flexDirection: 'row', gap: spacing.sm },
  roleChip: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
  },
  roleChipActive: { borderColor: colors.primary, backgroundColor: colors.accent },
  roleText: { ...typography.label, color: colors.text.secondary },
  roleTextActive: { color: colors.primary, fontWeight: '600' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.text.secondary },
});
