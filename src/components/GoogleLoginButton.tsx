import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography, radius } from '../constants/theme'

interface GoogleLoginButtonProps {
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}

/**
 * GoogleLoginButton — Bouton Google Login réutilisable
 */
export function GoogleLoginButton({
  onPress,
  loading = false,
  disabled = false,
}: GoogleLoginButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled || loading ? styles.buttonDisabled : null,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size={20} color={colors.text.primary} />
        ) : (
          <Ionicons name="logo-google" size={20} color={colors.text.primary} />
        )}
        <Text style={styles.text}>
          {loading ? 'Connexion...' : 'Continuer avec Google'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    ...typography.label,
    color: colors.text.primary,
    fontWeight: '600',
  },
})
