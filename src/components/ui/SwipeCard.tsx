import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Animated, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────

export function SwipeCard({
  title, subtitle, images, stats, description, accent, onPress,
}: SwipeCardProps) {
  const { width: W } = useWindowDimensions();
  // Sur web le viewport = navigateur entier, on plafonne à 300px
  const CARD_W   = Math.min(W * 0.78, 300);
  const IMG_W    = CARD_W * 0.40;
  const IMG_H    = 90;

  const [spread, setSpread] = useState(false);
  const accentColor = accent ?? colors.primary;

  const anims = React.useRef(
    [0, 1, 2].map(() => new Animated.Value(0)),
  ).current;

  const toggle = () => {
    const toValue = spread ? 0 : 1;
    Animated.stagger(60, anims.map(a =>
      Animated.spring(a, { toValue, friction: 6, tension: 60, useNativeDriver: true }),
    )).start();
    setSpread(!spread);
  };

  const imgs    = images.slice(0, 3);
  const OFFSETS = [0, CARD_W * 0.22, CARD_W * 0.44];
  const SPREAD  = [0, CARD_W * 0.32, CARD_W * 0.62];
  const ROTS    = ['-5deg', '0deg', '5deg'];

  return (
    <TouchableOpacity
      style={[s.card, { width: CARD_W, borderColor: accentColor + '25' }]}
      onPress={onPress}
      onLongPress={toggle}
      activeOpacity={0.95}
    >
      {/* Titre */}
      <View style={s.titleRow}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
        <View style={[s.arrowBtn, { backgroundColor: accentColor + '15' }]}>
          <Ionicons name="arrow-forward" size={15} color={accentColor} />
        </View>
      </View>

      {/* Images empilées */}
      <TouchableOpacity onPress={toggle} activeOpacity={0.9} style={[s.imageArea, { height: IMG_H + 8 }]}>
        {imgs.map((uri, i) => {
          const tx = anims[i].interpolate({
            inputRange: [0, 1], outputRange: [OFFSETS[i], SPREAD[i]],
          });
          const rot = anims[i].interpolate({
            inputRange: [0, 1], outputRange: ['0deg', ROTS[i]],
          });
          return (
            <Animated.View
              key={i}
              style={[
                s.imageWrap,
                { left: OFFSETS[i], zIndex: imgs.length - i, width: IMG_W, height: IMG_H },
                { transform: [{ translateX: tx }, { rotate: rot }] },
              ]}
            >
              {uri ? (
                <Image source={{ uri }} style={s.image} />
              ) : (
                <View style={[s.image, { backgroundColor: accentColor + '12', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="image-outline" size={20} color={accentColor + '60'} />
                </View>
              )}
            </Animated.View>
          );
        })}
        <View style={s.spreadHint}>
          <Text style={s.spreadHintText}>{spread ? 'Fermer' : 'Photos'}</Text>
        </View>
      </TouchableOpacity>

      {/* Stats — max 3, wrap si besoin */}
      <View style={s.statsRow}>
        {stats.slice(0, 3).map((st, i) => (
          <View key={i} style={s.stat}>
            <Ionicons name={st.icon} size={11} color={colors.text.secondary} />
            <Text style={s.statText} numberOfLines={1}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      <Text style={s.desc} numberOfLines={2}>{description}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  title:    { ...typography.label, color: colors.text.primary, fontWeight: '700', fontSize: 15 },
  subtitle: { ...typography.caption, color: colors.text.secondary, marginTop: 1 },
  arrowBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  imageArea: { marginBottom: spacing.sm, position: 'relative' },
  imageWrap: {
    position: 'absolute', top: 0,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  image: { width: '100%', height: '100%' },

  spreadHint: {
    position: 'absolute', right: 0, bottom: 0,
    backgroundColor: colors.muted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  spreadHintText: { ...typography.caption, color: colors.text.secondary, fontSize: 9 },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xs },
  stat:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { ...typography.caption, color: colors.text.secondary, fontSize: 11, flexShrink: 1 },

  desc: { ...typography.caption, color: colors.text.secondary, lineHeight: 18, fontSize: 12 },
});
