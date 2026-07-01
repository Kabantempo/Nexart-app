import React from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { colors, spacing, typography } from '../../constants/theme'

export function AppFooter() {
  const nav = useNavigation<any>()

  const links = [
    { label: 'À propos', onPress: () => nav.navigate('About') },
    { label: 'Nous contacter', onPress: () => nav.navigate('Contact') },
    { label: 'CGU', onPress: () => nav.navigate('Contact') },
  ]

  return (
    <View style={s.footer}>
      {/* Links */}
      <View style={s.linksContainer}>
        {links.map((link, idx) => (
          <React.Fragment key={link.label}>
            <TouchableOpacity onPress={link.onPress} activeOpacity={0.7}>
              <Text style={s.link}>{link.label}</Text>
            </TouchableOpacity>
            {idx < links.length - 1 && <Text style={s.divider}>•</Text>}
          </React.Fragment>
        ))}
      </View>

      {/* Social */}
      <View style={s.social}>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="logo-instagram" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="mail" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Copyright */}
      <Text style={s.copyright}>© 2026 Nexart. Tous droits réservés.</Text>
    </View>
  )
}

const s = StyleSheet.create({
  footer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  link: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  divider: {
    color: colors.text.secondary,
    fontSize: 10,
  },
  social: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  copyright: {
    color: colors.text.secondary,
    textAlign: 'center',
    ...typography.caption,
  },
})
