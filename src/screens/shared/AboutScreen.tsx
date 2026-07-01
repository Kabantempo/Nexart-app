import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { colors, spacing, typography, radius } from '../../constants/theme'

type Props = {
  navigation: NativeStackNavigationProp<any, 'About'>
}

export default function AboutScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>À propos de Nexart</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre mission</Text>
          <Text style={styles.text}>
            Nexart est la plateforme de mise en relation entre créateurs, artisans et organisateurs de marchés artisanaux en France.
          </Text>
          <Text style={styles.text}>
            Nous croyons que chaque création mérite de trouver son audience et que les artisans méritent une plateforme simple, juste et gratuite pour développer leur activité.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valeurs</Text>
          <View style={styles.valueItem}>
            <Text style={styles.valueTitle}>Authenticité</Text>
            <Text style={styles.valueDesc}>Chaque création sur Nexart est vérifiée et faite main.</Text>
          </View>
          <View style={styles.valueItem}>
            <Text style={styles.valueTitle}>Accessibilité</Text>
            <Text style={styles.valueDesc}>Une plateforme gratuite, sans commission sur les ventes.</Text>
          </View>
          <View style={styles.valueItem}>
            <Text style={styles.valueTitle}>Communauté</Text>
            <Text style={styles.valueDesc}>Un écosystème où créateurs, artisans et visiteurs se rencontrent et s'entraident.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Les chiffres</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>Créateurs</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Marchés</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>100K+</Text>
              <Text style={styles.statLabel}>Visiteurs</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>En savoir plus</Text>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('Contact')}
          >
            <Text style={styles.linkText}>Nous contacter →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Consulter nos CGU →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Politique de confidentialité →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backText: {
    color: colors.primary,
    ...typography.body,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  valueItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  valueTitle: {
    ...typography.label,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  valueDesc: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 13,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  link: {
    paddingVertical: spacing.md,
  },
  linkText: {
    color: colors.primary,
    ...typography.body,
    fontWeight: '600',
  },
})
