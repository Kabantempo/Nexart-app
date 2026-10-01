import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import { useCreatorVerification } from '../../hooks/useVerification';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const isValidSiret = (v: string) => /^\d{14}$/.test(v.replace(/\s/g, ''));

export default function VerificationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { verification, isVerified, isPending, isRejected, rejectionReason, loading, submit } =
    useCreatorVerification(user?.id);
  const [siret, setSiret] = useState('');
  const [sending, setSending] = useState(false);

  const canSubmit = !isVerified && !isPending;

  const onSubmit = async () => {
    if (!isValidSiret(siret)) { Alert.alert('SIRET invalide', 'Le SIRET comporte 14 chiffres.'); return; }
    setSending(true);
    const { error } = await submit(siret);
    setSending(false);
    if (error) Alert.alert('Erreur', "La demande n'a pas pu être envoyée.");
    else setSiret('');
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Retour" accessibilityRole="button" onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.title}>Créateur vérifié</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
          {isVerified && (
            <View style={[s.banner, { borderColor: colors.success }]}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text style={s.bannerText}>Votre profil est vérifié.</Text>
            </View>
          )}
          {isPending && (
            <View style={[s.banner, { borderColor: colors.primary }]}>
              <Ionicons name="time-outline" size={22} color={colors.primary} />
              <Text style={s.bannerText}>Demande en cours d'examen (SIRET {verification?.siret}).</Text>
            </View>
          )}
          {isRejected && (
            <View style={[s.banner, { borderColor: colors.error }]}>
              <Ionicons name="close-circle" size={22} color={colors.error} />
              <Text style={s.bannerText}>
                Demande refusée{rejectionReason ? ` : ${rejectionReason}` : '.'} Vous pouvez en déposer une nouvelle.
              </Text>
            </View>
          )}

          <Text style={s.intro}>
            Le badge rassure les organisateurs. Renseignez votre SIRET : un administrateur le contrôle.
          </Text>

          {canSubmit && (
            <>
              <Text style={s.label}>Numéro SIRET</Text>
              <TextInput
                style={s.input}
                value={siret}
                onChangeText={setSiret}
                keyboardType="number-pad"
                placeholder="14 chiffres"
                placeholderTextColor={colors.text.secondary}
                maxLength={17}
              />
              <TouchableOpacity style={[s.btn, sending && { opacity: 0.6 }]} onPress={onSubmit} disabled={sending}>
                <Text style={s.btnText}>{sending ? 'Envoi…' : 'Envoyer ma demande'}</Text>
              </TouchableOpacity>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  title: { ...typography.h3, color: colors.text.primary },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderWidth: 1, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  bannerText: { ...typography.label, color: colors.text.primary, flex: 1 },
  intro: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg },
  label: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, color: colors.text.primary,
    ...typography.body, marginBottom: spacing.lg,
  },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
});
