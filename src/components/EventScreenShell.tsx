import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}

/** En-tête, chargement et erreur communs aux écrans d'outils d'un événement. */
export default function EventScreenShell({ title, subtitle, onBack, loading, error, onRetry, children }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" onPress={onBack} style={s.back} accessibilityLabel="Retour">
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{title}</Text>
          {subtitle ? <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : error ? (
        <View style={s.center}>
          <Text style={s.empty}>{error}</Text>
          {onRetry ? (
            <TouchableOpacity style={s.retry} onPress={onRetry}><Text style={s.retryText}>Réessayer</Text></TouchableOpacity>
          ) : null}
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: { width: 32 },
  title: { ...typography.h3, color: colors.text.primary },
  subtitle: { ...typography.caption, color: colors.text.secondary },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  retry: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  retryText: { ...typography.label, color: '#fff', fontWeight: '600' },
});
