import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, useWindowDimensions, ScrollView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, radius } from '../../constants/theme';

export interface CardStat {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}

export interface SwipeCardProps {
  title:       string;
  subtitle?:   string;
  images:      string[];
  stats:       CardStat[];
  description: string;
  accent?:     string;
  onPress?:    () => void;
}

export function SwipeCard({
  title, subtitle, images, stats, description, accent, onPress,
}: SwipeCardProps) {
  const { width: W }  = useWindowDimensions();
  const cardWidth     = Math.min(W * 0.78, 300);
  const coverHeight   = cardWidth * 0.55;      // ratio 16:9 ≈
  const thumbWidth    = (cardWidth - spacing.sm) / 2;
  const thumbHeight   = thumbWidth * 0.6;
  const accentColor   = accent ?? colors.primary;

  const validImgs = images.filter(Boolean);
  const cover     = validImgs[0] ?? null;
  const thumbs    = validImgs.slice(1, 3);

  const handlePress = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[s.card, { width: cardWidth, borderColor: accentColor + '25' }]}
      onPress={handlePress}
      activeOpacity={0.92}
    >
      {/* ── Cover image ── */}
      <View style={[s.coverWrap, { height: coverHeight }]}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={s.coverImg}
            resizeMode="cover"
          />
        ) : (
          <View style={[s.coverPlaceholder, { backgroundColor: accentColor + '12' }]}>
            <Ionicons name="image-outline" size={32} color={accentColor + '50'} />
          </View>
        )}
        {/* Badge type */}
        {subtitle && (
          <View style={[s.typeBadge, { backgroundColor: accentColor }]}>
            <Text style={s.typeBadgeText}>{subtitle}</Text>
          </View>
        )}
      </View>

      {/* ── Thumbnails ── */}
      {thumbs.length > 0 && (
        <View style={s.thumbRow}>
          {thumbs.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={[s.thumb, { width: thumbWidth, height: thumbHeight }]}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* ── Contenu ── */}
      <View style={s.body}>
        <View style={s.titleRow}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          <View style={[s.arrowBtn, { backgroundColor: accentColor + '15' }]}>
            <Ionicons name="arrow-forward" size={14} color={accentColor} />
          </View>
        </View>

        {/* Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.statsRow}
        >
          {stats.slice(0, 4).map((st, i) => (
            <View key={i} style={s.stat}>
              <Ionicons name={st.icon} size={11} color={colors.text.secondary} />
              <Text style={s.statText}>{st.label}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={s.desc} numberOfLines={2}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  // Cover
  coverWrap:        { width: '100%', position: 'relative' },
  coverImg:         { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  typeBadge: {
    position: 'absolute', top: spacing.sm, left: spacing.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.full,
  },
  typeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  // Thumbnails
  thumbRow:  { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.xs, paddingTop: spacing.xs },
  thumb:     { borderRadius: radius.sm, backgroundColor: colors.muted },

  // Body
  body:     { padding: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  title:    { ...typography.label, color: colors.text.primary, fontWeight: '700', flex: 1, fontSize: 14 },
  arrowBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  statsRow: { gap: spacing.md, marginBottom: spacing.xs },
  stat:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { ...typography.caption, color: colors.text.secondary, fontSize: 11 },

  desc: { ...typography.caption, color: colors.text.secondary, lineHeight: 17, fontSize: 11 },
});
