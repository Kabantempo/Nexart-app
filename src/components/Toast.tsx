import React, { useEffect, useRef } from 'react'
import { Animated, View, Text, StyleSheet, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography, radius } from '../constants/theme'
import { ANIMATION_DURATIONS } from '../constants/animations'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  visible: boolean
}

const TOAST_CONFIG = {
  success: { color: '#10B981', icon: 'checkmark-circle' },
  error: { color: '#EF4444', icon: 'close-circle' },
  info: { color: '#3B82F6', icon: 'information-circle' },
  warning: { color: '#F59E0B', icon: 'warning' },
}

/**
 * Toast — Notification avec animation slide up
 * Utilisé pour success/error messages
 */
export function Toast({ message, type = 'info', duration = 3000, visible }: ToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const config = TOAST_CONFIG[type]

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATIONS.slow,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.slow,
          useNativeDriver: true,
        }),
      ]).start()

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: ANIMATION_DURATIONS.slow,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: ANIMATION_DURATIONS.slow,
            useNativeDriver: true,
          }),
        ]).start()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, slideAnim, opacityAnim, duration])

  if (!visible) return null

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.toast, { borderLeftColor: config.color }]}>
        <Ionicons name={config.icon as any} size={20} color={config.color} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
    paddingTop: spacing.lg,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: Dimensions.get('window').width - 32,
  },
  message: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
})
