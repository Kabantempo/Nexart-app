import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography, radius } from '../../constants/theme';
import EtherealBackground from '../../components/ui/EtherealBackground';
import { Toast } from '../../components/Toast';
import { GoogleLoginButton } from '../../components/GoogleLoginButton';
import { AnimatedTouchableOpacity } from '../../components/AnimatedTouchableOpacity';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

type Props = { navigation: StackNavigationProp<AuthStackParams, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });
  const { handleGoogleSignIn, loading: googleLoading } = useGoogleAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setToast({ visible: true, message: 'Veuillez remplir email et mot de passe', type: 'error' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setToast({ visible: true, message: error.message, type: 'error' });
    } else {
      setToast({ visible: true, message: 'Connexion réussie! ✨', type: 'success' });
    }
  };

  return (
    <EtherealBackground intensity={0.18}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} duration={3000} />
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backArrow}>←</Text>
            <Text style={s.backText}>Accueil</Text>
          </TouchableOpacity>

          {/* Brand */}
          <View style={s.brand}>
            <View style={s.logoMark}>
              <View style={s.logoGrid}>
                <View style={s.logoDot} />
                <View style={s.logoDot} />
                <View style={s.logoDot} />
                <View style={s.logoDot} />
              </View>
            </View>
            <Text style={s.brandName}>Nexart</Text>
          </View>

          {/* Hero */}
          <View style={s.hero}>
            <Text style={s.title}>Bon retour !</Text>
            <Text style={s.subtitle}>
              Connectez-vous à votre compte Nexart.
            </Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            {/* Email */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Adresse email</Text>
              <TextInput
                style={s.input}
                placeholder="votre@email.fr"
                placeholderTextColor={colors.text.secondary + '60'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Mot de passe</Text>
              <View style={s.pwdRow}>
                <TextInput
                  style={[s.input, s.pwdInput]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.secondary + '60'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPwd(v => !v)} activeOpacity={0.7}>
                  <Text style={s.eyeText}>{showPwd ? 'Cacher' : 'Voir'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit */}
            <AnimatedTouchableOpacity
              style={[s.btnPrimary, loading && s.btnLoading]}
              onPress={handleLogin}
              disabled={loading}
              scaleFactor={0.96}
            >
              <Text style={s.btnPrimaryText}>
                {loading ? 'Connexion…' : 'Se connecter'}
              </Text>
            </AnimatedTouchableOpacity>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>ou</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Google Login */}
            <GoogleLoginButton onPress={handleGoogleSignIn} loading={googleLoading} />

            {/* Register link */}
            <AnimatedTouchableOpacity
              style={s.btnSecondary}
              onPress={() => navigation.navigate('Register')}
              scaleFactor={0.97}
            >
              <Text style={s.btnSecondaryText}>Créer un compte</Text>
            </AnimatedTouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={s.terms}>
            En continuant, vous acceptez nos{' '}
            <Text style={s.termsLink}>Conditions d'utilisation</Text>
            {' '}et notre{' '}
            <Text style={s.termsLink}>Politique de confidentialité</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </EtherealBackground>
  );
}

const s = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },

  // Back
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  backArrow: { fontSize: 18, color: colors.text.secondary },
  backText:  { ...typography.label, color: colors.text.secondary },

  // Brand
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGrid: {
    width: 18,
    height: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  logoDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },

  // Hero
  hero: { marginBottom: spacing.xl },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.8,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },

  // Form
  form: { gap: spacing.md },

  fieldWrap: { gap: spacing.xs },
  fieldLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginLeft: 2,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },

  pwdRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pwdInput: { flex: 1, marginBottom: 0 },
  eyeBtn:  { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  eyeText: { ...typography.caption, color: colors.primary, fontWeight: '600' },

  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginTop: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  btnLoading:    { opacity: 0.65 },
  btnPrimaryText: {
    ...typography.label,
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { ...typography.caption, color: colors.text.secondary },

  btnSecondary: {
    paddingVertical: 16,
    borderRadius: radius.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    ...typography.label,
    color: colors.text.primary,
    fontSize: 16,
  },

  terms: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.xl,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
