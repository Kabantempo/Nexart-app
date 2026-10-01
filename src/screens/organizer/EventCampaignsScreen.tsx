import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../stores/theme';
import { useEventCampaigns, Campaign } from '../../hooks/useEventCampaigns';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function EventCampaignsScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { campaigns, loading, error, create, send, refetch } = useEventCampaigns(eventId);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() || !subject.trim() || !body.trim()) {
      Alert.alert('Champs requis', 'Renseignez le titre, l’objet et le message.');
      return;
    }
    setSaving(true);
    const err = await create(title, subject, body);
    setSaving(false);
    if (err) Alert.alert('Erreur', err);
    else { setTitle(''); setSubject(''); setBody(''); }
  };

  const confirmSend = (c: Campaign) =>
    Alert.alert(
      'Envoyer cette campagne ?',
      `« ${c.subject} » sera envoyé par e-mail aux exposants approuvés de « ${eventTitle} ». Cette action est définitive.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          style: 'destructive',
          onPress: async () => {
            setSendingId(c.id);
            const res = await send(c.id);
            setSendingId(null);
            if (res.error) Alert.alert('Envoi non effectué', res.error);
            else Alert.alert('Campagne envoyée', `${res.sent} e-mail${res.sent > 1 ? 's' : ''} envoyé${res.sent > 1 ? 's' : ''}.`);
          },
        },
      ],
    );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Retour" accessibilityRole="button" onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Campagnes e-mail</Text>
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
            <Text style={s.formTitle}>Nouvelle campagne</Text>
            <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Titre (pour vous)"
              placeholderTextColor={colors.text.secondary} />
            <TextInput style={s.input} value={subject} onChangeText={setSubject} placeholder="Objet de l'e-mail"
              placeholderTextColor={colors.text.secondary} />
            <TextInput style={[s.input, s.inputMulti]} value={body} onChangeText={setBody} placeholder="Message"
              placeholderTextColor={colors.text.secondary} multiline />
            <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
              <Text style={s.btnText}>{saving ? 'Enregistrement…' : 'Enregistrer en brouillon'}</Text>
            </TouchableOpacity>
          </View>

          {campaigns.length === 0 ? <Text style={[s.empty, { marginTop: spacing.lg }]}>Aucune campagne pour l'instant.</Text> : null}
          {campaigns.map(c => {
            const sent = c.status === 'sent';
            return (
              <View key={c.id} style={s.card}>
                <View style={s.cardTop}>
                  <Text style={s.name}>{c.title}</Text>
                  <View style={[s.badge, sent && s.badgeSent]}>
                    <Text style={[s.badgeText, sent && s.badgeTextSent]}>{sent ? 'Envoyée' : 'Brouillon'}</Text>
                  </View>
                </View>
                <Text style={s.meta}>{c.subject}</Text>
                <Text style={s.meta} numberOfLines={3}>{c.message}</Text>
                {sent ? (
                  <Text style={s.tags}>Envoyée le {formatDate(c.sent_at)}</Text>
                ) : (
                  <TouchableOpacity style={[s.sendBtn, sendingId === c.id && { opacity: 0.6 }]}
                    onPress={() => confirmSend(c)} disabled={sendingId !== null}>
                    <Text style={s.sendText}>{sendingId === c.id ? 'Envoi…' : 'Envoyer aux exposants'}</Text>
                  </TouchableOpacity>
                )}
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
  inputMulti: { minHeight: 110, textAlignVertical: 'top' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600', flex: 1 },
  meta: { ...typography.body, color: colors.text.secondary },
  tags: { ...typography.caption, color: colors.success },
  badge: { backgroundColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeSent: { backgroundColor: colors.success + '25' },
  badgeText: { ...typography.caption, color: colors.text.secondary, fontWeight: '700' },
  badgeTextSent: { color: colors.success },
  sendBtn: {
    marginTop: spacing.xs, borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md,
    padding: spacing.sm, alignItems: 'center',
  },
  sendText: { ...typography.label, color: colors.primary, fontWeight: '600' },
});
