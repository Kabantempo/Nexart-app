import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

export default function BannedScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[s.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Ionicons name="ban-outline" size={56} color={colors.error} />
      <Text style={s.title}>Compte suspendu</Text>
      <Text style={s.text}>
        Votre compte a été suspendu car il ne respecte pas les conditions d'utilisation de Nexart.
        Si vous pensez qu'il s'agit d'une erreur, contactez-nous.
      </Text>
      <Text style={s.mail} selectable>support@nexart.fr</Text>

      <TouchableOpacity style={s.primary} onPress={() => Linking.openURL('mailto:support@nexart.fr')}>
        <Text style={s.primaryText}>Écrire au support</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.secondary} onPress={() => supabase.auth.signOut()}>
        <Text style={s.secondaryText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background, alignItems: 'center',
    justifyContent: 'center', padding: spacing.xl, gap: spacing.md,
  },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  text: { ...typography.body, color: colors.text.secondary, textAlign: 'center', maxWidth: 420 },
  mail: { ...typography.label, color: colors.text.primary },
  primary: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.md,
  },
  primaryText: { ...typography.label, color: '#fff', fontWeight: '600' },
  secondary: { padding: spacing.md },
  secondaryText: { ...typography.label, color: colors.text.secondary },
});
