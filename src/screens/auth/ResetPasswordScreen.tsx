import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

export default function ResetPasswordScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (password.length < 8) { Alert.alert('Mot de passe trop court', '8 caractères minimum.'); return; }
    if (password !== confirm) { Alert.alert('Mots de passe différents', 'Les deux champs doivent être identiques.'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) { Alert.alert('Erreur', error.message); return; }
    Alert.alert('Mot de passe modifié', 'Vous êtes connecté avec votre nouveau mot de passe.', [
      { text: 'OK', onPress: onDone },
    ]);
  };

  return (
    <View style={[s.container, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={s.title}>Nouveau mot de passe</Text>
      <Text style={s.subtitle}>Choisissez un mot de passe d'au moins 8 caractères.</Text>

      <Text style={s.label}>Nouveau mot de passe</Text>
      <TextInput
        style={s.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        textContentType="newPassword"
        placeholderTextColor={colors.text.secondary}
      />
      <Text style={s.label}>Confirmation</Text>
      <TextInput
        style={s.input}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoCapitalize="none"
        textContentType="newPassword"
        placeholderTextColor={colors.text.secondary}
      />

      <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
        <Text style={s.btnText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.cancel} onPress={onDone}>
        <Text style={s.cancelText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  title: { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: spacing.sm, marginBottom: spacing.xl },
  label: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, color: colors.text.primary,
    ...typography.body, marginBottom: spacing.lg,
  },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
  cancel: { padding: spacing.md, alignItems: 'center' },
  cancelText: { ...typography.label, color: colors.text.secondary },
});
