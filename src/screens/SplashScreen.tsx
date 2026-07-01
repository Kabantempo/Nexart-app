import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, Image } from 'react-native'
import { colors } from '../constants/theme'
import { ANIMATION_DURATIONS } from '../constants/animations'

type Props = {
  onFinish: () => void
}

/**
 * SplashScreen — Logo animation au démarrage de l'app
 * Logo zoom in uniquement (sans texte)
 */
export default function SplashScreen({ onFinish }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const bounceAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.sequence([
      // Phase 1: Zoom in + fade in + rotation (500ms)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.slow,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.slow,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.slow,
          useNativeDriver: true,
        }),
      ]),
      // Phase 2: Petit bounce (200ms)
      Animated.parallel([
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.15,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start()

    // Finish after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish()
    }, 2500)

    return () => clearTimeout(timer)
  }, [scaleAnim, opacityAnim, rotateAnim, bounceAnim, onFinish])

  const rotationInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={styles.container}>
      {/* Logo avec animation rotation + bounce */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: rotationInterpolate },
              { scale: bounceAnim },
            ],
          },
        ]}
      >
        <Image
          source={require('../assets/nexart-icon-512.png')}
          style={styles.logo}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    borderRadius: 40,
    overflow: 'hidden',
  },
})
