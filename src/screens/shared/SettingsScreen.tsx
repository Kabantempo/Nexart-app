import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch, Share,
} from 'react-native';
import { DEFAULT_NOTIFICATION_PREFS, NotificationPrefs } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useTheme, ThemePreference } from '../../stores/theme';
import { useAuth } from '../../stores/auth';
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
  const { profile, refetchProfile } = useAuth();
  const prefs: NotificationPrefs = { ...DEFAULT_NOTIFICATION_PREFS, ...(profile?.notification_prefs ?? {}) };
  const PREF_ROWS: { key: keyof NotificationPrefs; label: string }[] = [
    { key: 'messages', label: 'Messages' },
    { key: 'applications', label: 'Candidatures' },
    { key: 'reminders', label: 'Rappels' },
    { key: 'newsletter', label: 'Newsletter' },
  ];
  const [exporting, setExporting] = React.useState(false);

  const updateProfile = async (patch: { profile_visibility?: 'public' | 'private'; preferred_language?: 'fr' | 'en' }) => {
    if (!profile) return;
    Haptics.selectionAsync();
    const { error } = await supabase.from('profiles').update(patch).eq('id', profile.id);
    if (error) Alert.alert('Erreur', 'Réglage non enregistré.');
    else await refetchProfile();
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('no session');
      const siteUrl = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://nexart.fr';
      const res = await fetch(`${siteUrl}/api/account/export-data`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error(String(res.status));
      await Share.share({ title: 'Mes données Nexart', message: await res.text() });
    } catch {
      Alert.alert('Export impossible', 'Réessayez plus tard ou écrivez à support@nexart.fr.');
    } finally {
      setExporting(false);
    }
  };

  const togglePref = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!profile) return;
    Haptics.selectionAsync();
    const { error } = await supabase
      .from('profiles')
      .update({ notification_prefs: { ...prefs, [key]: value } })
      .eq('id', profile.id);
    if (error) Alert.alert('Erreur', 'Préférence non enregistrée.');
    else await refetchProfile();
  };
  const isCreator = profile?.role === 'creator';
  const isOrganizer = profile?.role === 'organizer';
  const links: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string; show: boolean }[] = [
    { label: 'Notifications', icon: 'notifications-outline', route: 'Notifications', show: true },
    { label: 'Parrainage', icon: 'gift-outline', route: 'Referral', show: true },
    { label: 'Mes statistiques', icon: 'stats-chart-outline', route: 'CreatorAnalytics', show: isCreator },
    { label: 'Utilisateurs', icon: 'people-outline', route: 'AdminUsers', show: !!profile?.is_admin },
    { label: 'Modération des événements', icon: 'calendar-outline', route: 'AdminEvents', show: !!profile?.is_admin },
    { label: 'Signalements', icon: 'flag-outline', route: 'AdminReports', show: !!profile?.is_admin },
    { label: "Journal d'audit", icon: 'shield-outline', route: 'AuditLog', show: !!profile?.is_admin },
    { label: 'Carnet de route', icon: 'map-outline', route: 'Itinerary', show: isCreator },
    { label: 'Mes paiements', icon: 'card-outline', route: 'CreatorPayments', show: isCreator },
    { label: 'Statistiques', icon: 'stats-chart-outline', route: 'OrganizerAnalytics', show: isOrganizer },
    { label: 'Revenus', icon: 'cash-outline', route: 'OrganizerRevenue', show: isOrganizer },
    { label: 'Recherche', icon: 'search-outline', route: 'Search', show: true },
    { label: 'Tendances', icon: 'trending-up-outline', route: 'Trends', show: true },
    { label: 'Comparateur de marchés', icon: 'git-compare-outline', route: 'Compare', show: true },
    { label: 'Calendrier des marchés', icon: 'calendar-outline', route: 'Calendar', show: true },
    { label: 'Blog', icon: 'newspaper-outline', route: 'Blog', show: true },
    { label: 'Nouveautés', icon: 'sparkles-outline', route: 'PatchNotes', show: true },
    { label: 'Mes documents', icon: 'document-text-outline', route: 'Documents', show: isCreator },
    { label: 'Créateur vérifié', icon: 'shield-checkmark-outline', route: 'Verification', show: isCreator },
  ];
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
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Retour" accessibilityRole="button" onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.title}>Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Mon compte */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Mon compte</Text>
          {links.filter(l => l.show).map(l => (
            <TouchableOpacity key={l.route} style={s.linkRow} onPress={() => navigation.navigate(l.route)}>
              <Ionicons name={l.icon} size={20} color={colors.primary} />
              <Text style={s.linkText}>{l.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Préférences de notification */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Préférences de notification</Text>
          {PREF_ROWS.map(r => (
            <View key={r.key} style={s.linkRow}>
              <Text style={s.linkText}>{r.label}</Text>
              <Switch
                value={prefs[r.key]}
                onValueChange={v => togglePref(r.key, v)}
                trackColor={{ true: colors.primary, false: colors.border }}
                disabled={!profile}
              />
            </View>
          ))}
        </View>

        {/* Confidentialité et langue */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Confidentialité et langue</Text>
          <View style={s.linkRow}>
            <Text style={s.linkText}>Profil public</Text>
            <Switch
              value={(profile?.profile_visibility ?? 'public') === 'public'}
              onValueChange={v => updateProfile({ profile_visibility: v ? 'public' : 'private' })}
              trackColor={{ true: colors.primary, false: colors.border }}
              disabled={!profile}
            />
          </View>
          <View style={s.themeRow}>
            {(['fr', 'en'] as const).map(lang => {
              const active = (profile?.preferred_language ?? 'fr') === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[s.themeCard, active && s.themeCardActive]}
                  onPress={() => updateProfile({ preferred_language: lang })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[s.themeCardText, active && s.themeCardTextActive]}>
                    {lang === 'fr' ? 'Français' : 'English'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={s.hint}>
            La langue est enregistrée sur votre compte, comme sur le site. L'app reste en français pour l'instant.
          </Text>
          <TouchableOpacity style={[s.linkRow, { marginTop: spacing.md }, exporting && { opacity: 0.6 }]} onPress={exportData} disabled={exporting}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <Text style={s.linkText}>{exporting ? 'Export en cours…' : 'Exporter mes données (RGPD)'}</Text>
          </TouchableOpacity>
        </View>

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
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  linkText: { ...typography.label, color: colors.text.primary, flex: 1 },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
