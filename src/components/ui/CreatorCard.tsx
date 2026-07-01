import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, useWindowDimensions, NativeScrollEvent,
  NativeSyntheticEvent, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, radius } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────

export interface CreatorCardProps {
  id:                 string;
  fullName:           string;
  avatarUrl?:         string | null;
  discipline?:        string;
  city?:              string;
  bio?:               string;
  portfolioImages:    string[];      // jusqu'à 3 photos de ses œuvres
  siretVerified?:     boolean;
  insuranceVerified?: boolean;
  onPress?:           () => void;
}

// ─── Component ────────────────────────────────────────────

export function CreatorCard({
  fullName, avatarUrl, discipline, city, bio,
  portfolioImages, siretVerified, insuranceVerified, onPress,
}: CreatorCardProps) {
  const { width: W }  = useWindowDimensions();
  const CARD_W        = Math.min(W * 0.60, 220);
  const IMG_H         = CARD_W * 0.85;

  const scrollRef     = useRef<ScrollView>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  const imgs = portfolioImages.filter(Boolean).slice(0, 3);
  const total = imgs.length;

  // Auto-slide toutes les 2.5s
  const goNext = useCallback(() => {
    if (total <= 1) return;
    const next = (activeIdx + 1) % total;
    scrollRef.current?.scrollTo({ x: next * CARD_W, animated: true });
    setActiveIdx(next);
  }, [activeIdx, total, CARD_W]);

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(goNext, 2500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [goNext, total]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
    if (idx !== activeIdx) {
      setActiveIdx(idx);
      // Reset timer à chaque swipe manuel
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(goNext, 2500);
    }
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[s.card, { width: CARD_W }]}
      onPress={handlePress}
      activeOpacity={0.92}
    >
      {/* ── Carousel images ── */}
      <View style={[s.imageWrap, { height: IMG_H }]}>
        {total > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
            style={{ width: CARD_W, height: IMG_H }}
          >
            {imgs.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={{ width: CARD_W, height: IMG_H }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <View style={[s.imgPlaceholder, { height: IMG_H }]}>
            <Ionicons name="brush-outline" size={36} color={colors.border} />
          </View>
        )}

        {/* Dots */}
        {total > 1 && (
          <View style={s.dots}>
            {imgs.map((_, i) => (
              <View key={i} style={[s.dot, i === activeIdx && s.dotActive]} />
            ))}
          </View>
        )}

        {/* Avatar en overlay bas gauche */}
        <View style={s.avatarOverlay}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={s.avatar} />
          ) : (
            <View style={s.avatarFallback}>
              <Ionicons name="person" size={14} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Badges vérification */}
        {(siretVerified || insuranceVerified) && (
          <View style={s.badgeOverlay}>
            {siretVerified && (
              <View style={s.badge}>
                <Ionicons name="checkmark-circle" size={11} color={colors.success} />
              </View>
            )}
          </View>
        )}
      </View>

      {/* ── Infos ── */}
      <View style={s.body}>
        <Text style={s.name} numberOfLines={1}>{fullName}</Text>
        {discipline && <Text style={s.discipline} numberOfLines={1}>{discipline}</Text>}
        {city && (
          <View style={s.locationRow}>
            <Ionicons name="location-outline" size={11} color={colors.text.secondary} />
            <Text style={s.city} numberOfLines={1}>{city}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },

  imageWrap:    { position: 'relative', overflow: 'hidden' },
  imgPlaceholder: {
    width: '100%',
    backgroundColor: colors.muted,
    alignItems: 'center', justifyContent: 'center',
  },

  // Dots
  dots: {
    position: 'absolute', bottom: spacing.sm,
    left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  dot:       { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 14 },

  // Avatar overlay
  avatarOverlay: {
    position: 'absolute', bottom: spacing.sm, left: spacing.sm,
  },
  avatar:        { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#fff' },
  avatarFallback:{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#fff', backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },

  // Badge vérifié
  badgeOverlay: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  badge:        { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },

  // Body
  body:        { padding: spacing.sm },
  name:        { ...typography.label, color: colors.text.primary, fontWeight: '700', marginBottom: 2 },
  discipline:  { ...typography.caption, color: colors.primary, fontWeight: '600', marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  city:        { ...typography.caption, color: colors.text.secondary, fontSize: 10 },
});
