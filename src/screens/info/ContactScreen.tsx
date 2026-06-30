import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography, radius } from '../../constants/theme';

const SUBJECTS = ['Question générale', 'Problème technique', 'Signalement', 'Partenariat', 'Autre'];

export default function ContactScreen() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('contact_submissions').insert({ name, email, subject, message });
    setLoading(false);
    if (error) { Alert.alert('Erreur', error.message); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <View style={s.successContainer}>
        <Text style={s.successEmoji}>✉️</Text>
        <Text style={s.successTitle}>Message envoyé !</Text>
        <Text style={s.successText}>
          Merci {name}. Nous vous répondrons à {email} dans les plus brefs délais.
        </Text>
        <TouchableOpacity style={s.btnPrimary} onPress={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }} activeOpacity={0.8}>
          <Text style={s.btnPrimaryText}>Envoyer un autre message</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Nous contacter</Text>
        <Text style={s.subtitle}>Une question, un problème ou une suggestion ? On est là.</Text>

        <View style={s.form}>
          <View style={s.field}>
            <Text style={s.label}>Nom complet</Text>
            <TextInput style={s.input} placeholder="Votre nom" value={name} onChangeText={setName} placeholderTextColor={colors.text.secondary + '70'} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} placeholder="vous@exemple.fr" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.text.secondary + '70'} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Sujet</Text>
            <View style={s.subjectsGrid}>
              {SUBJECTS.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  onPress={() => setSubject(sub)}
                  style={[s.subjectChip, subject === sub && s.subjectChipActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.subjectChipText, subject === sub && s.subjectChipTextActive]}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Message</Text>
            <TextInput
              style={[s.input, s.textarea]}
              placeholder="Décrivez votre demande…"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholderTextColor={colors.text.secondary + '70'}
            />
          </View>

          <TouchableOpacity
            style={[s.btnPrimary, loading && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.btnPrimaryText}>{loading ? 'Envoi…' : 'Envoyer le message'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { padding: spacing.xl, paddingBottom: spacing.xxl },

  title:    { ...typography.h2, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl, lineHeight: 22 },

  form:  { gap: spacing.lg },
  field: { gap: spacing.xs },
  label: { ...typography.caption, color: colors.text.secondary, fontWeight: '600', letterSpacing: 0.3 },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, paddingHorizontal: spacing.md,
    paddingVertical: 13, fontSize: 15, color: colors.text.primary,
  },
  textarea: { minHeight: 120, paddingTop: 13 },

  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  subjectChip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  subjectChipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  subjectChipText:      { ...typography.caption, color: colors.text.secondary, fontWeight: '600' },
  subjectChipTextActive: { color: '#FFFFFF' },

  btnPrimary: {
    backgroundColor: colors.primary, paddingVertical: 15,
    borderRadius: radius.xl, alignItems: 'center', marginTop: spacing.sm,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  btnPrimaryText: { ...typography.label, color: '#FFFFFF', fontWeight: '700', fontSize: 16 },

  successContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xxl, backgroundColor: colors.background,
  },
  successEmoji: { fontSize: 48, marginBottom: spacing.lg },
  successTitle: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  successText:  { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
});
