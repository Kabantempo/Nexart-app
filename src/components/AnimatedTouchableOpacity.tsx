import React, { useRef, useEffect } from 'react'
import { Animated, TouchableOpacity, TouchableOpacityProps } from 'react-native'

interface AnimatedTouchableOpacityProps extends TouchableOpacityProps {
  scaleFactor?: number
  duration?: number
  children: React.ReactNode
}

/**
 * AnimatedTouchableOpacity — Button avec feedback d'échelle (95% → 100%)
 */
export function AnimatedTouchableOpacity({
  scaleFactor = 0.95,
  duration = 150,
  onPressIn,
  onPressOut,
  children,
  ...props
}: AnimatedTouchableOpacityProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = (e: any) => {
    Animated.timing(scaleAnim, {
      toValue: scaleFactor,
      duration,
      useNativeDriver: true,
    }).start()
    onPressIn?.(e)
  }

  const handlePressOut = (e: any) => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start()
    onPressOut?.(e)
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  )
}
