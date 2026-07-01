import React, { useRef } from 'react'
import { Animated, ViewStyle } from 'react-native'

interface ShakeAnimationProps {
  children: React.ReactNode
  style?: ViewStyle
  trigger?: boolean
}

/**
 * ShakeAnimation — Error feedback dengan shake effect
 * Gunakan untuk validation errors
 */
export function ShakeAnimation({
  children,
  style,
  trigger = false,
}: ShakeAnimationProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current

  const handleShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
  }

  React.useEffect(() => {
    if (trigger) {
      handleShake()
    }
  }, [trigger])

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}

/**
 * PulseButton — Button avec ripple effect on press
 */
import { Pressable, ViewStyle as RNViewStyle } from 'react-native'

interface PulseButtonProps {
  onPress: () => void
  children: React.ReactNode
  style?: RNViewStyle
}

export function PulseButton({ onPress, children, style }: PulseButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    onPress()
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
      <Pressable onPress={handlePress}>
        {children}
      </Pressable>
    </Animated.View>
  )
}

/**
 * PulseIcon — Icon avec pulse animation infinite
 */
interface PulseIconProps {
  children: React.ReactNode
}

export function PulseIcon({ children }: PulseIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [scaleAnim])

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      {children}
    </Animated.View>
  )
}
