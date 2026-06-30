import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
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

type Props = { navigation: StackNavigationProp<AuthStackParams, 'ForgotPassword'> };

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Champ requis', 'Veuillez entrer votre email.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${SITE_URL}/reset-password`,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    setSent(true);
  };

  return (
    <EtherealBackground intensity={0.18}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backArrow}>←</Text>
            <Text style={s.backText}>Connexion</Text>
          </TouchableOpacity>

          {sent ? (
            <View style={s.hero}>
              <Text style={s.emoji}>✉️</Text>
              <Text style={s.title}>Email envoyé</Text>
              <Text style={s.subtitle}>
                Un lien de réinitialisation a été envoyé à {'\n'}
                <Text style={{ fontWeight: '700', color: colors.text.primary }}>{email}</Text>.
                {'\n\n'}Ouvrez-le depuis votre boîte mail pour choisir un nouveau mot de passe.
              </Text>
              <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
                <Text style={s.btnSecondaryText}>Retour à la connexion</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={s.hero}>
                <Text style={s.title}>Mot de passe oublié ?</Text>
                <Text style={s.subtitle}>Entrez votre email pour recevoir un lien de réinitialisation.</Text>
              </View>

              <View style={s.form}>
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
                    returnKeyType="send"
                    onSubmitEditing={handleSubmit}
                  />
                </View>

                <TouchableOpacity
                  style={[s.btnPrimary, loading && s.btnLoading]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={s.btnPrimaryText}>{loading ? 'Envoi…' : 'Envoyer le lien'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </EtherealBackground>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xl },

  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: spacing.xl },
  backArrow: { fontSize: 18, color: colors.text.secondary },
  backText: { ...typography.label, color: colors.text.secondary },

  hero: { marginBottom: spacing.xl },
  emoji: { fontSize: 40, marginBottom: spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.8, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.text.secondary, lineHeight: 22 },

  form: { gap: spacing.md },
  fieldWrap: { gap: spacing.xs },
  fieldLabel: { ...typography.caption, color: colors.text.secondary, fontWeight: '600', marginLeft: 2, letterSpacing: 0.3 },
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
  btnLoading: { opacity: 0.65 },
  btnPrimaryText: { ...typography.label, color: colors.text.inverse, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  btnSecondary: {
    paddingVertical: 16,
    borderRadius: radius.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  btnSecondaryText: { ...typography.label, color: colors.text.primary, fontSize: 16 },
});
