import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const TOOLS: { route: string; label: string; hint: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { route: 'EventExhibitors', label: 'Exposants',        hint: 'Liste, statuts, export CSV',          icon: 'people-outline' },
  { route: 'EventWaitlist',   label: "Liste d'attente",  hint: 'Proposer une place libérée',          icon: 'hourglass-outline' },
  { route: 'EventVolunteers', label: 'Bénévoles',        hint: 'Bénévoles et créneaux',               icon: 'hand-left-outline' },
  { route: 'EventTeam',       label: 'Équipe',           hint: 'Co-organisateurs, invitation par @pseudo', icon: 'person-add-outline' },
  { route: 'EventCampaigns',  label: 'Campagnes e-mail', hint: 'Écrire et envoyer aux exposants',      icon: 'mail-outline' },
  { route: 'EventChecklist',  label: 'Checklist',        hint: "Tâches d'organisation",               icon: 'checkbox-outline' },
  { route: 'EventFaqs',       label: 'FAQ',              hint: 'Questions et réponses automatiques',  icon: 'help-circle-outline' },
];

export default function EventToolsScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Outils</Text>
          <Text style={s.subtitle} numberOfLines={1}>{eventTitle}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {TOOLS.map(t => (
          <TouchableOpacity key={t.route} style={s.row} activeOpacity={0.8}
            onPress={() => navigation.navigate(t.route, { eventId, eventTitle })}>
            <Ionicons name={t.icon} size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.label}>{t.label}</Text>
              <Text style={s.hint}>{t.hint}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  label: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  hint: { ...typography.caption, color: colors.text.secondary },
});
