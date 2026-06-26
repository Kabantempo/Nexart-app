import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

export default function RoleScreen() {
  const [loading, setLoading] = useState(false);

  const selectRole = async (role: UserRole) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      role,
      full_name: user.user_metadata.full_name ?? '',
    });

    setLoading(false);
    if (error) Alert.alert('Erreur', error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Je suis…</Text>
      <Text style={styles.subtitle}>Choisissez votre profil pour accéder aux bonnes fonctionnalités</Text>

      <TouchableOpacity style={styles.card} onPress={() => selectRole('creator')} disabled={loading}>
        <Ionicons name="brush-outline" size={40} color={colors.primary} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Créateur / Artisan</Text>
        <Text style={styles.cardDesc}>Je crée des objets et je cherche des marchés pour les exposer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.cardAlt]} onPress={() => selectRole('organizer')} disabled={loading}>
        <Ionicons name="calendar-outline" size={40} color={colors.secondary} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Organisateur</Text>
        <Text style={styles.cardDesc}>J'organise des marchés artisanaux et je cherche des exposants</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.cardVisitor]} onPress={() => selectRole('visitor')} disabled={loading}>
        <Ionicons name="eye-outline" size={40} color={colors.text.secondary} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Visiteur</Text>
        <Text style={styles.cardDesc}>Je découvre les marchés et les créateurs près de chez moi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, justifyContent: 'center' },
  title: { ...typography.h1, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.md, borderWidth: 2, borderColor: colors.primary, alignItems: 'center' },
  cardAlt: { borderColor: colors.secondary },
  cardVisitor: { borderColor: colors.border },
  cardIcon: { marginBottom: spacing.sm },
  cardTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  cardDesc: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
});
