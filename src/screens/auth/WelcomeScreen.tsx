import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { useAuth } from '../../stores/auth';
import { Profile } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';
import EtherealBackground from '../../components/ui/EtherealBackground';

type Props = {
  navigation: StackNavigationProp<AuthStackParams, 'Welcome'> & { getParent: () => any };
};

const MOCK_CREATOR: Profile = {
  id: 'dev-creator-id', role: 'creator', full_name: 'Alice Dupont (test)',
  avatar_url: null, bio: 'Céramiste indépendante, mode test.', created_at: new Date().toISOString(),
};
const MOCK_ORGANIZER: Profile = {
  id: 'dev-organizer-id', role: 'organizer', full_name: 'Bob Martin (test)',
  avatar_url: null, bio: null, created_at: new Date().toISOString(),
};
const MOCK_VISITOR: Profile = {
  id: 'dev-visitor-id', role: 'visitor', full_name: 'Clara Visiteur (test)',
  avatar_url: null, bio: null, created_at: new Date().toISOString(),
};

export default function WelcomeScreen({ navigation }: Props) {
  const { setProfile } = useAuth();

  return (
    <EtherealBackground intensity={0.22}>
      <StatusBar barStyle="dark-content" />

      <View style={s.container}>

        {/* Brand header */}
        <View style={s.header}>
          <Image source={require('../../../assets/logo-mark.png')} style={s.logoMark} />
          <Text style={s.brandName}>Nexart</Text>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.title}>Connexion ou{'\n'}inscription</Text>
          <Text style={s.subtitle}>
            La plateforme qui connecte créateurs artisanaux et organisateurs de marchés en France.
          </Text>

          <View style={s.pillRow}>
            {['Tatouage', 'Céramique', 'Bijoux', 'Illustration'].map(t => (
              <View key={t} style={s.pill}>
                <Text style={s.pillText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Ionicons name="mail-outline" size={18} color={colors.text.inverse} />
            <Text style={s.btnPrimaryText}>Se connecter par email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnSecondary}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={s.btnSecondaryText}>Créer un compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnGhost}
            onPress={() => (navigation as any).getParent()?.navigate('Discover')}
            activeOpacity={0.7}
          >
            <Text style={s.btnGhostText}>Explorer sans compte →</Text>
          </TouchableOpacity>

          <Text style={s.terms}>
            En continuant, vous acceptez nos{' '}
            <Text style={s.termsLink}>Conditions d'utilisation</Text>
            {' '}et notre{' '}
            <Text style={s.termsLink}>Politique de confidentialité</Text>.
          </Text>

          {__DEV__ && (
            <View style={s.devSection}>
              <Text style={s.devLabel}>Mode test</Text>
              <View style={s.devRow}>
                <TouchableOpacity style={s.devBtn} onPress={() => setProfile(MOCK_CREATOR)}>
                  <Text style={s.devBtnText}>Créateur</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.devBtn, s.devBtnAlt]} onPress={() => setProfile(MOCK_ORGANIZER)}>
                  <Text style={s.devBtnText}>Orga</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.devBtn, s.devBtnVisitor]} onPress={() => setProfile(MOCK_VISITOR)}>
                  <Text style={s.devBtnText}>Visiteur</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </EtherealBackground>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.xl,
  },

  // Brand header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },

  // Hero
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    ...typography.caption,
    color: colors.text.secondary,
  },

  // Actions
  actions: {
    gap: spacing.sm,
  },

  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  btnPrimaryIcon: {
    fontSize: 16,
    color: colors.text.inverse,
  },
  btnPrimaryText: {
    ...typography.label,
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

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

  btnGhost: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnGhostText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 15,
  },

  terms: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  // Dev
  devSection: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border + '80',
    paddingTop: spacing.md,
  },
  devLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  devRow: { flexDirection: 'row', gap: spacing.sm },
  devBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    alignItems: 'center',
  },
  devBtnAlt:     { borderColor: colors.secondary + '40' },
  devBtnVisitor: { borderColor: '#8B7CF640' },
  devBtnText:    { ...typography.caption, color: colors.text.primary, fontWeight: '600' },
});
