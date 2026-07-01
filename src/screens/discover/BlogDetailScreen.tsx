import React from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ARTICLES } from '../../lib/blog-data'
import { colors, spacing, typography, radius } from '../../constants/theme'

type Props = {
  navigation: NativeStackNavigationProp<any, 'BlogDetail'>
  route: any
}

export default function BlogDetailScreen({ navigation, route }: Props) {
  const { slug } = route.params
  const article = ARTICLES.find((a) => a.slug === slug)

  if (!article) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Article non trouvé</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      {/* Hero Image */}
      {article.image && (
        <Image
          source={{ uri: article.image }}
          style={styles.heroImage}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{article.category}</Text>
        </View>

        <Text style={styles.title}>{article.icon} {article.title}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>⏱️ {article.readTime} min de lecture</Text>
          <Text style={styles.metaText}>📅 {new Date(article.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}</Text>
        </View>

        <Text style={styles.excerpt}>{article.excerpt}</Text>

        {/* Tags */}
        <View style={styles.tags}>
          {article.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Description */}
        <Text style={styles.description}>
          Cet article contient des conseils pratiques pour les créateurs et organisateurs de marchés artisanaux.
        </Text>
        <Text style={styles.description}>
          Pour lire l'article complet, visitez le blog sur le site web nexart.fr
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Lire l'article complet</Text>
        </TouchableOpacity>
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
  heroImage: {
    width: '100%',
    height: 240,
  },
  content: {
    padding: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  badgeText: {
    color: colors.primary,
    ...typography.label,
    fontSize: 12,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  excerpt: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    color: colors.text.inverse,
    ...typography.label,
    fontWeight: '600',
  },
  errorText: {
    color: colors.text.primary,
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
})
