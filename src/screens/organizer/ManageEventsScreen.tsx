import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OrganizerEventStackParams } from '../../navigation/OrganizerEventStack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../stores/auth';
import { useEvents } from '../../hooks/useEvents';
import { Event, EventStatus } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = { navigation: StackNavigationProp<OrganizerEventStackParams, 'ManageEvents'> };

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Brouillon', color: colors.text.secondary, bg: colors.border },
  published: { label: 'Publié',    color: colors.secondary,      bg: colors.secondary + '25' },
  closed:    { label: 'Fermé',     color: colors.error,          bg: colors.error + '20' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function EventRow({
  event,
  onPress,
  onToggleStatus,
}: {
  event: Event;
  onPress: () => void;
  onToggleStatus: (e: Event) => void;
}) {
  const cfg = STATUS_CONFIG[event.status];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
          <Text style={styles.cardMeta}>
            {event.city ?? '—'} · {formatDate(event.start_date)} → {formatDate(event.end_date)}
          </Text>
          <Text style={styles.cardStands}>{event.stand_count} stands</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        {event.status === 'draft' && (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.secondary }]}
            onPress={() => onToggleStatus(event)}
          >
            <Text style={[styles.actionBtnText, { color: colors.secondary }]}>Publier</Text>
          </TouchableOpacity>
        )}
        {event.status === 'published' && (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border }]}
            onPress={() => onToggleStatus(event)}
          >
            <Text style={[styles.actionBtnText, { color: colors.text.secondary }]}>Fermer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={onPress}>
          <Text style={styles.actionBtnPrimaryText}>Candidatures →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ManageEventsScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const { events, loading, refetch } = useEvents({ organizerId: profile?.id, limit: 50 });

  const toggleStatus = async (event: Event) => {
    const next: EventStatus = event.status === 'draft' ? 'published' : 'closed';
    const label = next === 'published' ? 'Publier' : 'Fermer';
    Alert.alert(
      `${label} ce marché ?`,
      next === 'published'
        ? 'Le marché sera visible par tous les artisans.'
        : 'Les artisans ne pourront plus candidater.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: label,
          style: next === 'closed' ? 'destructive' : 'default',
          onPress: async () => {
            await supabase.from('events').update({ status: next }).eq('id', event.id);
            refetch();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes marchés</Text>
      <FlatList
        data={events}
        keyExtractor={e => e.id}
        renderItem={({ item }) => (
          <EventRow
            event={item}
            onPress={() => navigation.navigate('EventApplications', { eventId: item.id, eventTitle: item.title })}
            onToggleStatus={toggleStatus}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucun marché</Text>
            <Text style={styles.emptySubtitle}>Créez votre premier marché depuis l'onglet "Créer"</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  cardTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  cardMeta: { ...typography.caption, color: colors.text.secondary, marginBottom: 2 },
  cardStands: { ...typography.caption, color: colors.primary },

  statusBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { ...typography.caption, fontWeight: '700' },

  cardActions: { flexDirection: 'row', gap: spacing.sm, borderTopWidth: 1, borderColor: colors.border, paddingTop: spacing.md },
  actionBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    borderWidth: 1, alignItems: 'center',
  },
  actionBtnText: { ...typography.caption, fontWeight: '600' },
  actionBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionBtnPrimaryText: { ...typography.caption, color: colors.text.inverse, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
});
