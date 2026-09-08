import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useTheme, ThemePreference } from '../../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

/**
 * Écran de référence pour le thème clair/sombre : les styles sont construits
 * à partir de `useTheme().colors` au lieu d'importer `colors` en statique.
 * C'est le patron à suivre pour migrer les autres écrans.
 */

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'Système', icon: 'phone-portrait-outline' },
  { value: 'light',  label: 'Clair',   icon: 'sunny-outline' },
  { value: 'dark',   label: 'Sombre',  icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, preference, setPreference } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const handleThemeChange = (value: ThemePreference) => {
    Haptics.selectionAsync();
    setPreference(value);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible. Toutes vos données (profil, portfolio, candidatures, messages) seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const { error } = await supabase.rpc('delete_user');
            if (error) Alert.alert('Erreur', 'La suppression a échoué. Contactez support@nexart.fr');
            else supabase.auth.signOut();
          },
        },
      ],
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.title}>Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Apparence */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Apparence</Text>
          <View style={s.themeRow}>
            {THEME_OPTIONS.map(opt => {
              const active = preference === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.themeCard, active && s.themeCardActive]}
                  onPress={() => handleThemeChange(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={active ? colors.primary : colors.text.secondary}
                  />
                  <Text style={[s.themeCardText, active && s.themeCardTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={s.hint}>
            « Système » suit le réglage clair/sombre de votre téléphone.
          </Text>
        </View>

        {/* Zone danger */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Zone dangereuse</Text>
          <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={s.deleteBtnText}>Supprimer mon compte</Text>
          </TouchableOpacity>
          <Text style={s.hint}>
            Action irréversible — toutes vos données seront définitivement supprimées.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  title: { ...typography.h3, color: colors.text.primary },
  content: { padding: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  themeRow: { flexDirection: 'row', gap: spacing.sm },
  themeCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  themeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  themeCardText: { ...typography.label, color: colors.text.secondary },
  themeCardTextActive: { color: colors.primary, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error + '15',
    borderWidth: 1,
    borderColor: colors.error + '40',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  deleteBtnText: { ...typography.label, color: colors.error, fontWeight: '600' },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
