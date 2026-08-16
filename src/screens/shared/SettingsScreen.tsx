import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography, radius } from '../../constants/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible. Toutes vos données (profil, portfolio, candidatures, messages) seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const { error } = await supabase.rpc('delete_user');
            if (error) Alert.alert('Erreur', 'La suppression a échoué. Contactez support@nexart.fr');
            else supabase.auth.signOut();
          },
        },
      ],
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.title}>Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Zone danger */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Zone dangereuse</Text>
          <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={s.deleteBtnText}>Supprimer mon compte</Text>
          </TouchableOpacity>
          <Text style={s.deleteHint}>
            Action irréversible — toutes vos données seront définitivement supprimées.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  title: { ...typography.h3, color: colors.text.primary },
  content: { padding: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error + '15',
    borderWidth: 1,
    borderColor: colors.error + '40',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  deleteBtnText: { ...typography.label, color: colors.error, fontWeight: '600' },
  deleteHint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
