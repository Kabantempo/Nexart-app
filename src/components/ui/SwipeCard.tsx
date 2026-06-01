import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../constants/theme';

const { width: W } = Dimensions.get('window');
export const CARD_WIDTH  = W * 0.78;
export const CARD_HEIGHT = 260;

// ─── Types ────────────────────────────────────────────────

export interface CardStat {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}

export interface SwipeCardProps {
  title:       string;
  subtitle?:   string;
  images:      string[];          // 1–3 images (portfolio ou couverture)
  stats:       CardStat[];
  description: string;
  accent?:     string;
  onPress?:    () => void;
}

// ─── Component ────────────────────────────────────────────

export function SwipeCard({
  title, subtitle, images, stats, description, accent, onPress,
}: SwipeCardProps) {
  const [spread, setSpread] = useState(false);
  const accentColor = accent ?? colors.primary;

  // Animated values for each image
  const anims = React.useRef(
    images.slice(0, 3).map(() => new Animated.Value(0)),
  ).current;

  const toggle = () => {
    const toValue = spread ? 0 : 1;
    Animated.stagger(
      60,
      anims.map(a =>
        Animated.spring(a, {
          toValue,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ),
    ).start();
    setSpread(!spread);
  };

  const imgs = images.slice(0, 3);
  const OFFSETS = [0, CARD_WIDTH * 0.28, CARD_WIDTH * 0.56];
  const SPREAD  = [CARD_WIDTH * 0.02, CARD_WIDTH * 0.35, CARD_WIDTH * 0.68];
  const ROTATIONS = ['-6deg', '0deg', '6deg'];

  return (
    <TouchableOpacity
      style={[s.card, { borderColor: accentColor + '30' }]}
      onPress={onPress}
      onLongPress={toggle}
      activeOpacity={0.95}
    >
      {/* Title row */}
      <View style={s.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
        <View style={[s.arrowBtn, { backgroundColor: accentColor + '15' }]}>
          <Ionicons name="arrow-forward" size={16} color={accentColor} />
        </View>
      </View>

      {/* Stacked images */}
      <TouchableOpacity onPress={toggle} activeOpacity={0.9} style={s.imageArea}>
        {imgs.map((uri, i) => {
          const tx = anims[i].interpolate({
            inputRange:  [0, 1],
            outputRange: [OFFSETS[i], SPREAD[i]],
          });
          const rot = anims[i].interpolate({
            inputRange:  [0, 1],
            outputRange: ['0deg', ROTATIONS[i]],
          });
          return (
            <Animated.View
              key={i}
              style={[
                s.imageWrap,
                {
                  left:    OFFSETS[i],
                  zIndex:  imgs.length - i,
                  transform: [{ translateX: tx }, { rotate: rot }],
                  borderColor: accentColor + '40',
                },
              ]}
            >
              {uri ? (
                <Image source={{ uri }} style={s.image} />
              ) : (
                <View style={[s.image, s.imagePlaceholder, { backgroundColor: accentColor + '18' }]}>
                  <Ionicons name="image-outline" size={24} color={accentColor + '80'} />
                </View>
              )}
            </Animated.View>
          );
        })}
        {/* Hint to long press */}
        <View style={s.spreadHint}>
          <Text style={s.spreadHintText}>{spread ? 'Fermer' : 'Voir photos'}</Text>
        </View>
      </TouchableOpacity>

      {/* Stats */}
      <View style={s.statsRow}>
        {stats.map((st, i) => (
          <View key={i} style={s.stat}>
            <Ionicons name={st.icon} size={13} color={colors.text.secondary} />
            <Text style={s.statText}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      <Text style={s.desc} numberOfLines={2}>{description}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  titleRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  title:     { ...typography.h3, color: colors.text.primary, fontWeight: '700' },
  subtitle:  { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  arrowBtn:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  imageArea: {
    height: 100,
    marginBottom: spacing.md,
    position: 'relative',
  },
  imageWrap: {
    position: 'absolute',
    top: 0,
    width: CARD_WIDTH * 0.38,
    height: 96,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  image:            { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  spreadHint: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  spreadHintText: { ...typography.caption, color: colors.text.secondary, fontSize: 10 },

  statsRow:  { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.sm },
  stat:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText:  { ...typography.caption, color: colors.text.secondary },

  desc: { ...typography.body, color: colors.text.secondary, lineHeight: 20, fontSize: 13 },
});
