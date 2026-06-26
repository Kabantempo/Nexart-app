import React, { useEffect, useRef, useState } from 'react'
import {
  View, Text, TextInput, Animated, TouchableOpacity,
  StyleSheet, TextInputProps, ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, typography } from '../../constants/theme'

interface FloatingInputProps extends TextInputProps {
  label: string
  error?: string
  containerStyle?: ViewStyle
  rightIcon?: React.ComponentProps<typeof Ionicons>['name']
  onRightIconPress?: () => void
}

export function FloatingInput({
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  error,
  containerStyle,
  rightIcon,
  onRightIconPress,
  ...props
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false)
  const hasContent = !!(value && value.length > 0)
  const anim = useRef(new Animated.Value(hasContent ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue: focused || hasContent ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start()
  }, [focused, hasContent])

  const labelTop   = anim.interpolate({ inputRange: [0, 1], outputRange: [16, -10] })
  const labelSize  = anim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] })
  const labelColor = focused
    ? colors.primary
    : error
    ? colors.error
    : (anim as any).__getValue() > 0.5
    ? colors.text.secondary
    : colors.text.secondary + '80'

  const borderColor = error ? colors.error : focused ? colors.primary : colors.border

  const handleFocus = (e: any) => {
    setFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: any) => {
    setFocused(false)
    onBlur?.(e)
  }

  return (
    <View style={[s.container, containerStyle]}>
      <View style={[s.inputWrap, { borderColor }, focused && s.inputWrapFocused, !!error && s.inputWrapError]}>
        {/* Label flottant */}
        <Animated.Text
          style={[
            s.label,
            {
              top: labelTop,
              fontSize: labelSize,
              color: error ? colors.error : focused ? colors.primary : colors.text.secondary,
              backgroundColor: focused || hasContent ? colors.background : 'transparent',
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[s.input, rightIcon && { paddingRight: 44 }]}
          placeholderTextColor="transparent"
          placeholder=" "
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity style={s.rightIcon} onPress={onRightIconPress} activeOpacity={0.7}>
            <Ionicons name={rightIcon} size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  )
}

const s = StyleSheet.create({
  container: { marginBottom: spacing.md },

  inputWrap: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.85)',
    position: 'relative',
    justifyContent: 'center',
  },
  inputWrapFocused: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapError: {
    borderColor: colors.error,
  },

  label: {
    position: 'absolute',
    left: spacing.md,
    paddingHorizontal: 4,
    fontWeight: '500',
    zIndex: 1,
  },

  input: {
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingTop: 22,
    paddingBottom: 10,
    fontSize: 15,
    minHeight: 56,
  },

  rightIcon: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
    marginLeft: spacing.md,
  },
})
