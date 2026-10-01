import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import { useReferrals } from '../../hooks/useReferrals';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { code, link, total, credited, pending, loading } = useReferrals(user?.id);

  const share = async () => {
    if (!link) return;
    Haptics.selectionAsync();
    await Share.share({ message: `Rejoins-moi sur Nexart : ${link}` });
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Retour" accessibilityRole="button" onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.title}>Parrainage</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          <Text style={s.intro}>
            Invitez d'autres créateurs ou organisateurs. Chaque filleul inscrit vous rapporte des crédits.
          </Text>

          <View style={s.codeCard}>
            <Text style={s.codeLabel}>Votre code</Text>
            <Text style={s.code}>{code ?? '—'}</Text>
            <TouchableOpacity style={[s.shareBtn, !link && { opacity: 0.4 }]} onPress={share} disabled={!link}>
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={s.shareText}>Partager mon lien</Text>
            </TouchableOpacity>
          </View>

          <View style={s.statsRow}>
            {[
              { label: 'Filleuls', value: total },
              { label: 'Crédités', value: credited },
              { label: 'En attente', value: pending },
            ].map(st => (
              <View key={st.label} style={s.stat}>
                <Text style={s.statValue}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
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
  intro: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg },
  codeCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg,
  },
  codeLabel: { ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  code: { ...typography.h2, color: colors.primary, marginVertical: spacing.md, letterSpacing: 2 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  shareText: { ...typography.label, color: '#fff', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1, alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.md,
  },
  statValue: { ...typography.h2, color: colors.text.primary },
  statLabel: { ...typography.caption, color: colors.text.secondary },
});
