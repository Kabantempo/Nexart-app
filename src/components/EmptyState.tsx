import React, { useEffect, useRef } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography, radius } from '../constants/theme'
import { ANIMATION_DURATIONS } from '../constants/animations'

interface EmptyStateProps {
  icon: string
  title: string
  subtitle?: string
  actionText?: string
  onAction?: () => void
}

/**
 * EmptyState — Animation pour "Aucun résultat"
 * Icon avec pulse + bounce animation
 */
export function EmptyState({
  icon,
  title,
  subtitle,
  actionText,
  onAction,
}: EmptyStateProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.slow,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start()
  }, [bounceAnim, opacityAnim])

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ translateY: bounceAnim }],
          },
        ]}
      >
        <Ionicons name={icon as any} size={64} color={colors.primary} />
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {actionText && (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </Pressable>
      )}
    </Animated.View>
  )
}

// Import Pressable
import { Pressable } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  buttonText: {
    ...typography.label,
    color: 'white',
    textAlign: 'center',
  },
})
