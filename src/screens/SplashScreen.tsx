import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, Text } from 'react-native'
import { colors, typography, spacing } from '../constants/theme'
import { ANIMATION_DURATIONS } from '../constants/animations'

type Props = {
  onFinish: () => void
}

/**
 * SplashScreen — Logo animation au démarrage de l'app
 * Logo zoom in + text fade in
 */
export default function SplashScreen({ onFinish }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const textOpacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      // Logo zoom in
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.slow,
        useNativeDriver: true,
      }),
      // Logo fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.slow,
        useNativeDriver: true,
      }),
    ]).start()

    // Text appears after logo
    setTimeout(() => {
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.base,
        useNativeDriver: true,
      }).start()
    }, 200)

    // Finish after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish()
    }, 2500)

    return () => clearTimeout(timer)
  }, [scaleAnim, opacityAnim, textOpacityAnim, onFinish])

  return (
    <View style={styles.container}>
      {/* Background with gradient */}
      <View style={styles.background}>
        {/* Animated circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logo}>🎨</Text>
      </Animated.View>

      {/* Text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacityAnim,
          },
        ]}
      >
        <Text style={styles.title}>Nexart</Text>
        <Text style={styles.subtitle}>Connectez créateurs et marchés</Text>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Chargement...</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
    backgroundColor: '#FFFFFF',
  },
  circle2: {
    width: 300,
    height: 300,
    bottom: -50,
    left: -50,
    backgroundColor: '#FFFFFF',
  },
  circle3: {
    width: 200,
    height: 200,
    top: '50%',
    right: '10%',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
})
