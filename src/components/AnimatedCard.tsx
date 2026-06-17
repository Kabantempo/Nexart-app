import React, { useEffect, useRef } from 'react'
import { Animated, ViewStyle, StyleProp } from 'react-native'
import { ANIMATION_DURATIONS } from '../constants/animations'

interface AnimatedCardProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  delay?: number
  index?: number
}

/**
 * AnimatedCard — Card avec fade + slide up animation
 * Utilisé pour les items de liste, événements, créateurs
 */
export function AnimatedCard({ children, style, delay = 0, index = 0 }: AnimatedCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.slow,
        useNativeDriver: true,
        delay: delay || index * 50,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATIONS.slow,
        useNativeDriver: true,
        delay: delay || index * 50,
      }),
    ]).start()
  }, [fadeAnim, slideAnim, delay, index])

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

/**
 * AnimatedFadeIn — Simple fade in animation
 */
export function AnimatedFadeIn({ children, style, duration = ANIMATION_DURATIONS.base }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim, duration])

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  )
}

/**
 * AnimatedScale — Scale + fade animation for buttons/icons
 */
export function AnimatedScale({ children, style, onPress }: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: ANIMATION_DURATIONS.fast,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.fast,
        useNativeDriver: true,
      }),
    ]).start()

    onPress?.()
  }

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {React.cloneElement(children, { onPress: handlePress })}
    </Animated.View>
  )
}

/**
 * PulseAnimation — Infinite pulse for loading states
 */
export function PulseAnimation({ children, style }: any) {
  const opacityAnim = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [opacityAnim])

  return (
    <Animated.View style={[style, { opacity: opacityAnim }]}>
      {children}
    </Animated.View>
  )
}
