import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Linking, Image } from 'react-native';
import { useTheme } from '../../stores/theme';
import { ARTICLES, Article } from '../../lib/blog-data';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

type Filter = 'all' | Article['category'];

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'créateurs', label: 'Créateurs' },
  { value: 'organisateurs', label: 'Organisateurs' },
  { value: 'actualités', label: 'Actualités' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function BlogScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [filter, setFilter] = useState<Filter>('all');
  const articles = filter === 'all' ? ARTICLES : ARTICLES.filter(a => a.category === filter);

  return (
    <View style={s.container}>
      <View style={s.filters}>
        {FILTERS.map(f => {
          const active = filter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[s.chip, active && s.chipActive]}
              onPress={() => setFilter(f.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={articles}
        keyExtractor={a => a.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(`https://nexart.fr/blog/${item.slug}`)}
          >
            {item.image ? <Image source={{ uri: item.image }} style={s.image} resizeMode="cover" /> : null}
            <View style={s.body}>
              <Text style={s.meta}>
                {item.category} · {item.readTime} min · {formatDate(item.date)}
              </Text>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.excerpt} numberOfLines={3}>{item.excerpt}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.md },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.accent },
  chipText: { ...typography.label, color: colors.text.secondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, overflow: 'hidden',
  },
  image: { width: '100%', height: 150, backgroundColor: colors.border },
  body: { padding: spacing.md, gap: spacing.xs },
  meta: { ...typography.caption, color: colors.text.secondary, textTransform: 'capitalize' },
  title: { ...typography.h3, color: colors.text.primary },
  excerpt: { ...typography.body, color: colors.text.secondary },
});
