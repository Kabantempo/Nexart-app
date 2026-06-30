import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { colors, spacing, typography, radius } from '../../constants/theme';

const STATS = [
  { value: '500+', label: 'Créateurs' },
  { value: '200+', label: 'Événements' },
  { value: '15k+', label: 'Visiteurs' },
  { value: '3', label: 'Univers' },
];

const VALUES = [
  { emoji: '🎨', title: 'Créativité', desc: "Nous célébrons l'artisanat unique et les savoir-faire authentiques." },
  { emoji: '🤝', title: 'Communauté', desc: "Une plateforme qui connecte créateurs, organisateurs et amateurs d'art." },
  { emoji: '🌱', title: 'Durabilité', desc: 'Favoriser les circuits courts et le commerce équitable local.' },
];

export default function AboutScreen() {
  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={s.hero}>
        <Image source={require('../../../assets/logo-mark.png')} style={s.logoMark} />
        <Text style={s.heroTitle}>À propos de Nexart</Text>
        <Text style={s.heroSubtitle}>
          La plateforme qui connecte créateurs artisanaux et organisateurs de marchés en France.
        </Text>
      </View>

      {/* Stats */}
      <View style={s.statsGrid}>
        {STATS.map((s_) => (
          <View key={s_.label} style={s.statCard}>
            <Text style={s.statValue}>{s_.value}</Text>
            <Text style={s.statLabel}>{s_.label}</Text>
          </View>
        ))}
      </View>

      {/* Mission */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Notre mission</Text>
        <Text style={s.sectionText}>
          Nexart simplifie la mise en relation entre artisans créateurs et organisateurs d'événements.
          Notre plateforme permet aux créateurs de trouver des marchés qui correspondent à leur univers,
          et aux organisateurs de découvrir les meilleurs talents pour leurs événements.
        </Text>
      </View>

      {/* Values */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Nos valeurs</Text>
        {VALUES.map((v) => (
          <View key={v.title} style={s.valueCard}>
            <Text style={s.valueEmoji}>{v.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.valueTitle}>{v.title}</Text>
              <Text style={s.valueDesc}>{v.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={[s.section, { paddingBottom: spacing.xxl }]}>
        <TouchableOpacity
          style={s.ctaBtn}
          onPress={() => Linking.openURL('https://nexart.fr')}
          activeOpacity={0.8}
        >
          <Text style={s.ctaBtnText}>Visiter nexart.fr</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoMark: {
    width: 56, height: 56, borderRadius: 16,
    marginBottom: spacing.md,
  },
  heroTitle: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  heroSubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.sm,
  },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
  statLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 4 },

  section: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  sectionText: { ...typography.body, color: colors.text.secondary, lineHeight: 22 },

  valueCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  valueEmoji: { fontSize: 24 },
  valueTitle: { ...typography.label, fontWeight: '700', marginBottom: 4 },
  valueDesc: { ...typography.caption, color: colors.text.secondary, lineHeight: 18 },

  ctaBtn: {
    backgroundColor: colors.primary, paddingVertical: 14,
    borderRadius: radius.xl, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  ctaBtnText: { ...typography.label, color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
