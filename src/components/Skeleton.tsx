import React, { useEffect, useRef } from 'react'
import { Animated, View, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, radius } from '../constants/theme'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

/**
 * Skeleton — Loading placeholder avec shimmer animation
 * Utilisé pour card loading states
 */
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
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start()
  }, [shimmerAnim])

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  })

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  )
}

/**
 * SkeletonGroup — Multiple skeleton loaders pour card
 */
export function SkeletonGroup() {
  return (
    <View style={styles.group}>
      <Skeleton height={150} style={{ marginBottom: spacing.md }} />
      <Skeleton height={16} width="80%" style={{ marginBottom: spacing.sm }} />
      <Skeleton height={14} width="60%" />
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.muted,
  },
  group: {
    padding: spacing.md,
  },
})
