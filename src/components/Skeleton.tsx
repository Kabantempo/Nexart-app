import React, { useEffect, useRef } from 'react'
import { Animated, View, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native'
import { colors, spacing, radius } from '../constants/theme'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export function Skeleton({
  width = '100%',
  height = 100,
  borderRadius = radius.md,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ])
    ).start()
  }, [shimmerAnim])

  const opacity = shimmerAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 0.55, 0.25] })

  return (
    <Animated.View style={[styles.skeleton, { width, height, borderRadius, opacity }, style]} />
  )
}

export function SkeletonGroup() {
  return (
    <View style={styles.group}>
      <Skeleton height={150} style={{ marginBottom: spacing.md }} />
      <Skeleton height={16} width="80%" style={{ marginBottom: spacing.sm }} />
      <Skeleton height={14} width="60%" />
    </View>
  )
}

export function SkeletonSwipeCard() {
  const { width: W } = useWindowDimensions()
  const cardWidth = Math.min(W * 0.78, 300)
  const coverHeight = cardWidth * 0.55

  return (
    <View style={[styles.swipeCard, { width: cardWidth }]}>
      <Skeleton height={coverHeight} borderRadius={radius.lg} style={{ marginBottom: spacing.sm }} />
      <Skeleton height={14} width="70%" style={{ marginBottom: spacing.xs }} />
      <Skeleton height={12} width="50%" style={{ marginBottom: spacing.sm }} />
      <View style={styles.statsRow}>
        <Skeleton height={10} width={60} borderRadius={4} />
        <Skeleton height={10} width={60} borderRadius={4} />
        <Skeleton height={10} width={60} borderRadius={4} />
      </View>
    </View>
  )
}

export function SkeletonCreatorCard() {
  const { width: W } = useWindowDimensions()
  const cardWidth = Math.min(W * 0.60, 220)
  const imgHeight = cardWidth * 0.85

  return (
    <View style={[styles.creatorCard, { width: cardWidth }]}>
      <Skeleton height={imgHeight} borderRadius={radius.lg} style={{ marginBottom: spacing.sm }} />
      <View style={styles.creatorInfoRow}>
        <Skeleton height={36} width={36} borderRadius={18} style={{ marginRight: spacing.sm }} />
        <View style={{ flex: 1 }}>
          <Skeleton height={13} width="80%" style={{ marginBottom: spacing.xs }} />
          <Skeleton height={11} width="55%" />
        </View>
      </View>
    </View>
  )
}

export function SkeletonHorizontalList({ variant = 'event', count = 3 }: { variant?: 'event' | 'creator'; count?: number }) {
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <View style={styles.listHeader}>
        <Skeleton height={16} width={140} borderRadius={6} />
        <Skeleton height={13} width={60} borderRadius={6} />
      </View>
      <View style={styles.horizontalList}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={{ marginRight: spacing.md }}>
            {variant === 'event' ? <SkeletonSwipeCard /> : <SkeletonCreatorCard />}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: colors.muted },
  group: { padding: spacing.md },
  swipeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  creatorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  creatorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  horizontalList: {
    flexDirection: 'row',
    paddingLeft: spacing.xl,
    paddingBottom: spacing.sm,
  },
})
