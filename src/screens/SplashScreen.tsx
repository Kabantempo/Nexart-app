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

  useEffect(() => {
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
    ]).start()

    // Finish after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish()
    }, 2500)

    return () => clearTimeout(timer)
  }, [scaleAnim, opacityAnim, onFinish])

  return (
    <View style={styles.container}>
      {/* Logo avec animation */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/nexart-icon.png')}
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
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
})
