import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Animated, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { Post, usePostLike } from '../../hooks/usePosts';
import { useAuth } from '../../stores/auth';

const POST_TYPE_COLORS: Record<string, string> = {
  guest_appearance: '#A855F7',
  call_for_collab:  '#10B981',
  tip:              '#F59E0B',
  experience:       '#3B82F6',
  general:          colors.text.secondary,
};

const POST_TYPE_LABELS: Record<string, string> = {
  guest_appearance: 'Guest',
  call_for_collab:  'Collab',
  tip:              'Conseil',
  experience:       'Expérience',
  general:          'Création',
};

export function CreationCard({ post }: { post: Post }) {
  const { width: W } = useWindowDimensions();
  const CARD_W = Math.min(W * 0.60, 220);
  const IMG_H  = CARD_W * 0.65;

  const nav = useNavigation<any>();
  const { profile } = useAuth();
  const { liked, count, toggle } = usePostLike(profile?.id, post.id, post.likes_count);

  const creator    = post.creator as any;
  const cover      = post.images?.[0] ?? null;
  const typeColor  = POST_TYPE_COLORS[post.post_type] ?? colors.text.secondary;
  const typeLabel  = POST_TYPE_LABELS[post.post_type] ?? 'Création';

  const shortText = post.content
    .split('\n')[0]
    .replace(/#[\wÀ-ÿ]+/g, '')
    .trim()
    .slice(0, 72);

  const locationStr = post.location_name
    ? `${post.location_name}${post.event_ref ? ' · ' + post.event_ref : ''}`
    : post.event_ref ?? '';

  // Scale animation identique à MarketCard
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 8 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, friction: 8 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], width: CARD_W }}>
      <TouchableOpacity
        style={s.card}
        onPress={() => creator && nav.navigate('PublicCreatorProfile', { creatorId: creator.id })}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {/* ── Image cover (même ratio que MarketCard) ── */}
        <View style={[s.imageWrap, { height: IMG_H }]}>
          {cover ? (
            <Image source={{ uri: cover }} style={s.image} resizeMode="cover" />
          ) : (
            <View style={s.imagePlaceholder}>
              <Ionicons name="color-palette-outline" size={32} color={colors.border} />
            </View>
          )}

          {/* Badge type en bas à droite (position identique au discountBadge de MarketCard) */}
          <View style={[s.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={s.typeText}>{typeLabel}</Text>
          </View>

          {/* Like overlay en haut à droite */}
          <TouchableOpacity style={s.likeBtn} onPress={toggle} activeOpacity={0.8}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={14}
              color={liked ? '#ef4444' : '#fff'}
            />
            {count > 0 && <Text style={s.likeCount}>{count}</Text>}
          </TouchableOpacity>
        </View>

        {/* ── Corps identique à MarketCard ── */}
        <View style={s.body}>
          {/* Titre (nom créateur) + avatar */}
          <View style={s.titleRow}>
            {creator?.avatar_url ? (
              <Image source={{ uri: creator.avatar_url }} style={s.avatar} />
            ) : (
              <View style={s.avatarFallback}>
                <Ionicons name="person" size={10} color={colors.primary} />
              </View>
            )}
            <Text style={s.title} numberOfLines={1}>{creator?.full_name ?? '—'}</Text>
          </View>

          {/* Sous-titre = localisation ou event_ref */}
          {locationStr ? (
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={11} color={colors.text.secondary} />
              <Text style={s.subtitle} numberOfLines={1}>{locationStr}</Text>
            </View>
          ) : null}

          {/* Extrait du texte (remplace la zone prix de MarketCard) */}
          {shortText ? (
            <Text style={s.caption} numberOfLines={2}>{shortText}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  // ── Structure identique à MarketCard ──────────────────
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

  imageWrap:        { width: '100%', position: 'relative' },
  image:            { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: colors.muted,
    alignItems: 'center', justifyContent: 'center',
  },

  // Badge type (position badge réduction de MarketCard)
  typeBadge: {
    position: 'absolute', bottom: spacing.sm, right: spacing.sm,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  typeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Like (coin haut droit)
  likeBtn: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  likeCount: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Body (padding identique à MarketCard)
  body: { padding: spacing.md },

  titleRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.xs, marginBottom: 4,
  },
  avatar:        { width: 20, height: 20, borderRadius: 10, flexShrink: 0 },
  avatarFallback:{
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  title:    { ...typography.label, color: colors.text.primary, fontWeight: '700', flex: 1, lineHeight: 18 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  subtitle: { ...typography.caption, color: colors.text.secondary },
  caption:  { ...typography.caption, color: colors.text.secondary, lineHeight: 15, fontSize: 11 },
});
