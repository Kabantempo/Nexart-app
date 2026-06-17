import React, { useEffect, useRef } from 'react'
import { Animated, View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography, radius } from '../constants/theme'

interface EmptyStateProps {
  icon: string
  title: string
  subtitle?: string
  actionText?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, subtitle, actionText, onAction }: EmptyStateProps) {
  const fadeAnim  = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.85)).current
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -6, duration: 1800, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0,  duration: 1800, useNativeDriver: true }),
        ])
      ).start()
    })
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY: floatAnim }] }}>
        {/* Outer glow ring */}
        <View style={styles.glowRing}>
          {/* Inner circle */}
          <View style={styles.iconCircle}>
            <Ionicons name={icon as any} size={36} color={colors.primary} />
          </View>
        </View>
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {actionText && onAction && (
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onAction}
        >
          <Text style={styles.buttonText}>{actionText}</Text>
        </Pressable>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },

  glowRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.primary + '25',
    backgroundColor: colors.primary + '08',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
    maxWidth: 280,
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  buttonText: {
    ...typography.label,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})
