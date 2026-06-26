import React, { useEffect, useRef } from 'react'
import { View, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface TabIconProps {
  name: IoniconName
  focused: boolean
  color: string
  size: number
}

export function TabIcon({ name, focused, color, size }: TabIconProps) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue: focused ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [focused])

  const scale    = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] })
  const barWidth = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 22] })
  const barOpacity = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] })

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={name} size={size} color={color} />
      </Animated.View>
      <Animated.View
        style={{
          height: 3,
          width: barWidth,
          borderRadius: 2,
          backgroundColor: color,
          opacity: barOpacity,
        }}
      />
    </View>
  )
}
