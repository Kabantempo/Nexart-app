import React from 'react';
import {
  View, TouchableOpacity, StyleSheet, Image, Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { colors, spacing, radius, typography } from '../../constants/theme';

interface AppHeaderProps {
  showFavorites?: boolean;
  showCreate?:    boolean;
  onCreatePress?: () => void;
}

export function AppHeader({
  showFavorites = true,
  showCreate    = false,
  onCreatePress,
}: AppHeaderProps) {
  const insets              = useSafeAreaInsets();
  const nav                 = useNavigation<any>();
  const { profile, session } = useAuth();
  const isAuth              = !!session || !!profile;

  const goToFavorites = () => { if (isAuth) nav.navigate('Favoris'); };
  const goToProfile   = () => {
    if (!isAuth) { nav.navigate('Auth'); return; }
    nav.navigate('Profil');
  };

  return (
    <View style={[s.header, { paddingTop: insets.top + spacing.sm }]}>
      {/* Logo gauche */}
      <View style={s.logo}>
        <Text style={s.logoText}>Nexart</Text>
      </View>

      {/* Actions droite */}
      <View style={s.actions}>
        {showCreate && (
          <TouchableOpacity style={s.iconCircle} onPress={onCreatePress} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}

        {showFavorites && (
          <TouchableOpacity style={s.iconCircle} onPress={goToFavorites} activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        )}

        {/* Avatar rond */}
        <TouchableOpacity onPress={goToProfile} activeOpacity={0.85}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={s.avatarImg} />
          ) : (
            <View style={s.avatarFallback}>
              <Ionicons name="person" size={16} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    ...typography.h3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },

  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center', justifyContent: 'center',
  },

  avatarImg: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: colors.primary + '40',
  },
  avatarFallback: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.primary + '30',
  },
});
