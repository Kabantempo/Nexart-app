import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { Toast } from '../../components/Toast';
import { GoogleLoginButton } from '../../components/GoogleLoginButton';
import { AnimatedTouchableOpacity } from '../../components/AnimatedTouchableOpacity';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { FloatingInput } from '../../components/ui/FloatingInput';

type Props = { navigation: StackNavigationProp<AuthStackParams, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [role, setRole]         = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [emailError, setEmailError]     = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false, message: '', type: 'success',
  });
  const { handleGoogleSignIn, loading: googleLoading } = useGoogleAuth();

  const validateEmail = (v: string) => {
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setEmailError('Email invalide');
    else setEmailError('');
  };
  const validatePassword = (v: string) => {
    if (v && v.length < 6) setPasswordError('Minimum 6 caractères');
    else setPasswordError('');
  };

  const pwdStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwdStrengthColor = ['transparent', colors.error, '#F59E0B', colors.success ?? '#22C55E'][pwdStrength];
  const pwdStrengthLabel = ['', 'Faible', 'Moyen', 'Fort'][pwdStrength];

  const handleRegister = async () => {
    if (!role) {
      setToast({ visible: true, message: 'Choisissez votre profil', type: 'error' });
      return;
    }
    if (!fullName || !email || !password) {
      setToast({ visible: true, message: 'Tous les champs sont requis', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setToast({ visible: true, message: 'Le mot de passe doit faire au moins 6 caractères', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setToast({ visible: true, message: 'Les mots de passe ne correspondent pas', type: 'error' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    setLoading(false);
    if (error) {
      setToast({ visible: true, message: error.message, type: 'error' });
    } else {
      setToast({ visible: true, message: 'Compte créé avec succès !', type: 'success' });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <Toast visible={toast.visible} message={toast.message} type={toast.type} duration={3000} />
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={16} color={colors.text.secondary} />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Créer un compte</Text>

      <Text style={styles.sectionLabel}>Je suis…</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity style={[styles.roleCard, role === 'creator' && styles.roleCardActive]} onPress={() => setRole('creator')}>
          <Ionicons name="brush-outline" size={28} color={role === 'creator' ? colors.primary : colors.text.secondary} style={styles.roleIcon} />
          <Text style={[styles.roleTitle, role === 'creator' && styles.roleTextActive]}>Créateur</Text>
          <Text style={styles.roleDesc}>J'expose mes créations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleCard, role === 'organizer' && styles.roleCardActiveAlt]} onPress={() => setRole('organizer')}>
          <Ionicons name="calendar-outline" size={28} color={role === 'organizer' ? colors.secondary : colors.text.secondary} style={styles.roleIcon} />
          <Text style={[styles.roleTitle, role === 'organizer' && styles.roleTextActiveAlt]}>Organisateur</Text>
          <Text style={styles.roleDesc}>J'organise des marchés</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleCard, role === 'visitor' && styles.roleCardActiveVisitor]} onPress={() => setRole('visitor')}>
          <Ionicons name="eye-outline" size={28} color={role === 'visitor' ? '#8B7CF6' : colors.text.secondary} style={styles.roleIcon} />
          <Text style={[styles.roleTitle, role === 'visitor' && styles.roleTextActiveVisitor]}>Visiteur</Text>
          <Text style={styles.roleDesc}>J'explore les marchés</Text>
        </TouchableOpacity>
      </View>

      <FloatingInput
        label="Nom complet"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        textContentType="name"
      />

      <FloatingInput
        label="Email"
        value={email}
        onChangeText={(v) => { setEmail(v); validateEmail(v); }}
        error={emailError}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />

      <FloatingInput
        label="Mot de passe (min. 6 caractères)"
        value={password}
        onChangeText={(v) => { setPassword(v); validatePassword(v); }}
        error={passwordError}
        secureTextEntry={!showPwd}
        textContentType="newPassword"
        rightIcon={showPwd ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setShowPwd(v => !v)}
      />
      {password.length > 0 && (
        <View style={[styles.strengthRow, { marginTop: -spacing.sm, marginBottom: spacing.sm }]}>
          <View style={styles.strengthBars}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.strengthBar, { backgroundColor: i <= pwdStrength ? pwdStrengthColor : colors.border }]} />
            ))}
          </View>
          <Text style={[styles.strengthLabel, { color: pwdStrengthColor }]}>{pwdStrengthLabel}</Text>
        </View>
      )}

      <FloatingInput
        label="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPwd}
        textContentType="newPassword"
        rightIcon={showConfirmPwd ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setShowConfirmPwd(v => !v)}
        error={confirmPassword.length > 0 && password !== confirmPassword ? 'Les mots de passe ne correspondent pas' : undefined}
      />

      <AnimatedTouchableOpacity
        style={[styles.btn, (!role || (confirmPassword !== '' && password !== confirmPassword)) && styles.btnDisabled]}
        onPress={handleRegister}
        disabled={loading || !role || (confirmPassword !== '' && password !== confirmPassword)}
        scaleFactor={0.96}
      >
        <Text style={styles.btnText}>{loading ? 'Création…' : 'Créer mon compte'}</Text>
      </AnimatedTouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleLoginButton onPress={handleGoogleSignIn} loading={googleLoading} />

      <Text style={styles.legal}>
        En créant un compte, vous acceptez nos{' '}
        <Text style={styles.legalLink} onPress={() => Linking.openURL('https://nexart.app/cgu.html')}>
          Conditions d'utilisation
        </Text>
        {' '}et notre{' '}
        <Text style={styles.legalLink} onPress={() => Linking.openURL('https://nexart.app/privacy.html')}>
          Politique de confidentialité
        </Text>
        .
      </Text>

      <AnimatedTouchableOpacity onPress={() => navigation.navigate('Login')} scaleFactor={0.98}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </AnimatedTouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  back: { marginBottom: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: colors.text.secondary },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  roleRow: { flexDirection: 'row', marginBottom: spacing.xl, gap: spacing.sm },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleCardActive: { borderColor: colors.primary },
  roleCardActiveAlt: { borderColor: colors.secondary },
  roleCardActiveVisitor: { borderColor: '#8B7CF6' },
  roleTextActiveVisitor: { color: '#8B7CF6' },
  roleIcon: { marginBottom: spacing.xs },
  roleTitle: { ...typography.h3, color: colors.text.primary, marginBottom: 2 },
  roleTextActive: { color: colors.primary },
  roleTextActiveAlt: { color: colors.secondary },
  roleDesc: { ...typography.caption, color: colors.text.secondary, textAlign: 'center' },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 8 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { ...typography.caption, fontWeight: '600', fontSize: 11, minWidth: 40 },
  btn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { ...typography.label, color: colors.text.inverse, fontSize: 16, fontWeight: '600' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { ...typography.caption, color: colors.text.secondary },
  link: { color: colors.secondary, textAlign: 'center', marginTop: spacing.lg },
  legal: { ...typography.caption, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },
  legalLink: { color: colors.primary, textDecorationLine: 'underline' },
});
