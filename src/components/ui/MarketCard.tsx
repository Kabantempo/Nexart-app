import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Animated, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────

export interface MarketCardProps {
  id:                string;
  imageUrl?:         string | null;
  title:             string;
  subtitle:          string;       // ville · type
  rating?:           number;       // 0–5
  price?:            number | null; // prix du stand
  originalPrice?:    number;        // prix barré (optionnel)
  discountLabel?:    string;        // ex: "Gratuit" ou "-20%"
  onPress?:          () => void;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  permanent: '#3B82F6', seasonal: '#F59E0B',
  popup:     '#A855F7', salon:    '#10B981', fair: '#EF4444',
};

// ─── Component ────────────────────────────────────────────

export function MarketCard({
  imageUrl, title, subtitle, rating, price,
  originalPrice, discountLabel, onPress,
}: MarketCardProps) {
  const { width: W } = useWindowDimensions();
  const CARD_W    = Math.min(W * 0.60, 220);
  const IMG_H     = CARD_W * 0.65;

  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 8 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, friction: 8 }).start();

  const priceStr = price == null
    ? null
    : price === 0
      ? 'Gratuit'
      : `${price} €`;

  return (
    <Animated.View style={{ transform: [{ scale }], width: CARD_W }}>
      <TouchableOpacity
        style={s.card}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {/* ── Image cover ── */}
        <View style={[s.imageWrap, { height: IMG_H }]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={s.image} resizeMode="cover" />
          ) : (
            <View style={s.imagePlaceholder}>
              <Ionicons name="storefront-outline" size={32} color={colors.border} />
            </View>
          )}

          {/* Badge réduction / label */}
          {discountLabel && (
            <View style={s.discountBadge}>
              <Text style={s.discountText}>{discountLabel}</Text>
            </View>
          )}
        </View>

        {/* ── Contenu ── */}
        <View style={s.body}>
          {/* Titre + Rating */}
          <View style={s.titleRow}>
            <Text style={s.title} numberOfLines={2}>{title}</Text>
            {rating != null && rating > 0 && (
              <View style={s.ratingBadge}>
                <Ionicons name="star" size={10} color="#4EA1F3" />
                <Text style={s.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {/* Sous-titre */}
          <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text>

          {/* Prix */}
          {priceStr && (
            <View style={s.priceRow}>
              <Text style={s.price}>{priceStr}</Text>
              {originalPrice != null && originalPrice > (price ?? 0) && (
                <Text style={s.originalPrice}>{originalPrice} €</Text>
              )}
            </View>
          )}
          {priceStr && (
            <Text style={s.priceLabel}>/ stand</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Image
  imageWrap:        { width: '100%', position: 'relative' },
  image:            { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: colors.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute', bottom: spacing.sm, right: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  discountText: { color: colors.text.inverse, fontSize: 10, fontWeight: '700' },

  // Body
  body:     { padding: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginBottom: 4 },
  title:    { ...typography.label, color: colors.text.primary, fontWeight: '700', flex: 1, lineHeight: 18 },

  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.full,
    paddingHorizontal: 6, paddingVertical: 2,
    flexShrink: 0,
  },
  ratingText: { fontSize: 10, fontWeight: '700', color: '#4EA1F3' },

  subtitle:      { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.xs },
  priceRow:      { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  price:         { ...typography.h3, color: colors.text.primary, fontWeight: '700', fontSize: 16 },
  originalPrice: { ...typography.caption, color: colors.text.secondary, textDecorationLine: 'line-through' },
  priceLabel:    { ...typography.caption, color: colors.text.secondary, fontSize: 10 },
});
