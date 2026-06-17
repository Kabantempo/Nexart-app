import React, { useRef } from 'react'
import { Animated, ScrollView, View, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, typography } from '../constants/theme'

interface AnimatedScrollViewProps {
  children: React.ReactNode
  onScroll?: (offset: number) => void
  style?: ViewStyle
}

/**
 * AnimatedScrollView — ScrollView avec parallax header
 * Header fade lors du scroll
 */
export function AnimatedScrollView({
  children,
  onScroll,
  style,
}: AnimatedScrollViewProps) {
  const scrollAnim = useRef(new Animated.Value(0)).current

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
    { useNativeDriver: false }
  )

  // Header opacity: fade quand scroll > 50px
  const headerOpacity = scrollAnim.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  })

  // Content translateY: parallax effect
  const contentTranslateY = scrollAnim.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  })

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          {/* Header content will go here */}
        </Animated.View>

        {children}
      </ScrollView>
    </View>
  )
}

/**
 * ParallaxHeader — Header image avec parallax effect
 */
interface ParallaxHeaderProps {
  imageUrl?: string
  height?: number
}

export function ParallaxHeader({ height = 200 }: ParallaxHeaderProps) {
  const scrollAnim = useRef(new Animated.Value(0)).current

  const imageScale = scrollAnim.interpolate({
    inputRange: [-50, 0],
    outputRange: [1.5, 1],
    extrapolate: 'clamp',
  })

  return (
    <Animated.View
      style={[
        styles.parallaxHeader,
        {
          height,
          transform: [{ scale: imageScale }],
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: spacing.xl,
    backgroundColor: colors.primary + '10',
  },
  parallaxHeader: {
    backgroundColor: colors.primary + '20',
    overflow: 'hidden',
  },
})
