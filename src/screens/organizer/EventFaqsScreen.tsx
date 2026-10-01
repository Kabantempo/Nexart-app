import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../stores/theme';
import { useEventFaqs } from '../../hooks/useEventFaqs';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

export default function EventFaqsScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { faqs, loading, error, add, refetch } = useEventFaqs(eventId);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [keywords, setKeywords] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!question.trim() || !answer.trim()) { Alert.alert('Champs requis', 'Saisissez une question et sa réponse.'); return; }
    setSaving(true);
    const err = await add(question, answer, keywords);
    setSaving(false);
    if (err) Alert.alert('Erreur', err);
    else { setQuestion(''); setAnswer(''); setKeywords(''); }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>FAQ</Text>
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
            <Text style={s.formTitle}>Ajouter une question</Text>
            <TextInput style={s.input} value={question} onChangeText={setQuestion} placeholder="Question"
              placeholderTextColor={colors.text.secondary} />
            <TextInput style={[s.input, s.inputMulti]} value={answer} onChangeText={setAnswer} placeholder="Réponse"
              placeholderTextColor={colors.text.secondary} multiline />
            <TextInput style={s.input} value={keywords} onChangeText={setKeywords}
              placeholder="Mots-clés, séparés par des virgules" placeholderTextColor={colors.text.secondary}
              autoCapitalize="none" />
            <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
              <Text style={s.btnText}>{saving ? 'Ajout…' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>

          {faqs.length === 0 ? <Text style={[s.empty, { marginTop: spacing.lg }]}>Aucune question pour l'instant.</Text> : null}
          {faqs.map(f => (
            <View key={f.id} style={s.card}>
              <Text style={s.name}>{f.question}</Text>
              <Text style={s.meta}>{f.answer}</Text>
              {f.keywords?.length ? <Text style={s.tags}>{f.keywords.join(' · ')}</Text> : null}
            </View>
          ))}
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
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.body, color: colors.text.secondary },
  tags: { ...typography.caption, color: colors.primary },
});
