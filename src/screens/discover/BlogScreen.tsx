import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ARTICLES } from '../../lib/blog-data'
import { colors, spacing, typography, radius } from '../../constants/theme'
import { AnimatedCard } from '../../components/AnimatedCard'

type Props = {
  navigation: NativeStackNavigationProp<any, 'Blog'>
}

export default function BlogScreen({ navigation }: Props) {
  const handleArticlePress = (slug: string) => {
    navigation.navigate('BlogDetail', { slug })
  }

  const renderArticle = ({ item, index }: any) => (
    <AnimatedCard index={index} style={styles.articleCard}>
      <TouchableOpacity
        onPress={() => handleArticlePress(item.slug)}
        activeOpacity={0.7}
      >
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.articleImage}
          />
        )}
        <View style={styles.articleContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.articleTitle}>{item.icon} {item.title}</Text>
          <Text style={styles.articleExcerpt}>{item.excerpt}</Text>
          <View style={styles.articleMeta}>
            <Text style={styles.metaText}>⏱️ {item.readTime} min</Text>
            <Text style={styles.metaText}>📅 {new Date(item.date).toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Blog Nexart</Text>
        <Text style={styles.headerSubtitle}>Conseils et tendances artisanales</Text>
      </View>

      <FlatList
        data={ARTICLES}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  articleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  articleImage: {
    width: '100%',
    height: 180,
  },
  articleContent: {
    padding: spacing.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  categoryText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 11,
  },
  articleTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  articleExcerpt: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
})
