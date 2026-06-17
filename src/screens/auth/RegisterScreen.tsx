import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Linking, KeyboardAvoidingView, Platform } from 'react-native';
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

type Props = { navigation: StackNavigationProp<AuthStackParams, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [role, setRole]         = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);
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
  const pwdStrengthColor = ['transparent', colors.error, '#F59E0B', colors.success][pwdStrength];
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
      setToast({ visible: true, message: 'Compte créé avec succès! 🎉', type: 'success' });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <Toast visible={toast.visible} message={toast.message} type={toast.type} duration={3000} />
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Créer un compte</Text>

      <Text style={styles.sectionLabel}>Je suis…</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity style={[styles.roleCard, role === 'creator' && styles.roleCardActive]} onPress={() => setRole('creator')}>
          <Text style={styles.roleIcon}>🎨</Text>
          <Text style={[styles.roleTitle, role === 'creator' && styles.roleTextActive]}>Créateur</Text>
          <Text style={styles.roleDesc}>J'expose mes créations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleCard, role === 'organizer' && styles.roleCardActiveAlt]} onPress={() => setRole('organizer')}>
          <Text style={styles.roleIcon}>🗓️</Text>
          <Text style={[styles.roleTitle, role === 'organizer' && styles.roleTextActiveAlt]}>Organisateur</Text>
          <Text style={styles.roleDesc}>J'organise des marchés</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleCard, role === 'visitor' && styles.roleCardActiveVisitor]} onPress={() => setRole('visitor')}>
          <Text style={styles.roleIcon}>👀</Text>
          <Text style={[styles.roleTitle, role === 'visitor' && styles.roleTextActiveVisitor]}>Visiteur</Text>
          <Text style={styles.roleDesc}>J'explore les marchés</Text>
        </TouchableOpacity>
      </View>

      {/* Nom */}
      <View style={styles.fieldWrap}>
        <TextInput
          style={[styles.input, focused === 'name' && styles.inputFocused]}
          placeholder="Nom complet"
          placeholderTextColor={colors.text.secondary + '80'}
          value={fullName}
          onChangeText={setFullName}
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
        />
      </View>

      {/* Email */}
      <View style={styles.fieldWrap}>
        <TextInput
          style={[styles.input, focused === 'email' && styles.inputFocused, !!emailError && styles.inputError]}
          placeholder="Email"
          placeholderTextColor={colors.text.secondary + '80'}
          value={email}
          onChangeText={(v) => { setEmail(v); validateEmail(v); }}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {!!emailError && <Text style={styles.fieldError}>{emailError}</Text>}
      </View>

      {/* Mot de passe */}
      <View style={styles.fieldWrap}>
        <View style={styles.pwdRow}>
          <TextInput
            style={[styles.input, styles.pwdInput, focused === 'pwd' && styles.inputFocused, !!passwordError && styles.inputError]}
            placeholder="Mot de passe (min. 6 caractères)"
            placeholderTextColor={colors.text.secondary + '80'}
            value={password}
            onChangeText={(v) => { setPassword(v); validatePassword(v); }}
            onFocus={() => setFocused('pwd')}
            onBlur={() => setFocused(null)}
            secureTextEntry={!showPwd}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd(v => !v)} activeOpacity={0.7}>
            <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
        {password.length > 0 && (
          <View style={styles.strengthRow}>
            <View style={styles.strengthBars}>
              {[1, 2, 3].map(i => (
                <View key={i} style={[styles.strengthBar, { backgroundColor: i <= pwdStrength ? pwdStrengthColor : colors.border }]} />
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: pwdStrengthColor }]}>{pwdStrengthLabel}</Text>
          </View>
        )}
        {!!passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}
      </View>

      <AnimatedTouchableOpacity
        style={[styles.btn, !role && styles.btnDisabled]}
        onPress={handleRegister}
        disabled={loading || !role}
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
  back: { marginBottom: spacing.xl },
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
  roleCardRight: {},
  roleCardActive: { borderColor: colors.primary },
  roleCardActiveAlt: { borderColor: colors.secondary },
  roleCardActiveVisitor: { borderColor: '#8B7CF6' },
  roleTextActiveVisitor: { color: '#8B7CF6' },
  roleIcon: { fontSize: 28, marginBottom: spacing.xs },
  roleTitle: { ...typography.h3, color: colors.text.primary, marginBottom: 2 },
  roleTextActive: { color: colors.primary },
  roleTextActiveAlt: { color: colors.secondary },
  roleDesc: { ...typography.caption, color: colors.text.secondary, textAlign: 'center' },
  fieldWrap: { marginBottom: spacing.md },
  input: {
    backgroundColor: colors.surface,
    color: colors.text.primary,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontSize: 15,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: '#FAFBFF' },
  inputError: { borderColor: colors.error },
  fieldError: { ...typography.caption, color: colors.error, marginTop: 4, marginLeft: 4 },
  pwdRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pwdInput: { flex: 1 },
  eyeBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
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
