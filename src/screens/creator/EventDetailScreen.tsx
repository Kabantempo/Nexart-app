import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MarketStackParams } from '../../navigation/MarketStack';
import { useAuth } from '../../stores/auth';
import { useEvent, useApplicationStatus } from '../../hooks/useEvent';
import { useApply } from '../../hooks/useApplications';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<MarketStackParams, 'EventDetail'>;
  route: RouteProp<MarketStackParams, 'EventDetail'>;
};

const EVENT_TYPE_LABEL: Record<string, string> = {
  permanent: 'Marché permanent',
  seasonal:  'Marché saisonnier',
  popup:     'Pop-up',
  salon:     'Salon',
  fair:      'Foire',
};

const STATUS_CONFIG = {
  pending:  { label: 'Candidature envoyée',  bg: colors.text.secondary + '20', color: colors.text.secondary },
  accepted: { label: 'Candidature acceptée', bg: colors.secondary + '20',      color: colors.secondary },
  refused:  { label: 'Candidature refusée',  bg: colors.error + '20',          color: colors.error },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// ─── Apply section ────────────────────────────────────────────────────────────

function ApplySection({ eventId, userId }: { eventId: string; userId: string }) {
  const { status, loading: statusLoading } = useApplicationStatus(eventId, userId);
  const { apply, loading: applying } = useApply(eventId, userId);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');

  const handleApply = async () => {
    const { error } = await apply(message.trim() || undefined);
    if (error) {
      if (error.includes('unique')) {
        Alert.alert('Déjà candidaté', 'Vous avez déjà envoyé une candidature pour ce marché.');
      } else {
        Alert.alert('Erreur', error);
      }
      return;
    }
    setExpanded(false);
    Alert.alert('Candidature envoyée !', "L'organisateur recevra votre demande et vous répondra par message.");
  };

  if (statusLoading) return <ActivityIndicator color={colors.primary} style={{ margin: spacing.xl }} />;

  if (status !== 'none') {
    const cfg = STATUS_CONFIG[status];
    return (
      <View style={[styles.applyBox, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.applyStatusText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    );
  }

  if (!expanded) {
    return (
      <TouchableOpacity style={styles.applyBtn} onPress={() => setExpanded(true)}>
        <Text style={styles.applyBtnText}>Je m'inscris</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.applyForm}>
      <Text style={styles.applyFormTitle}>Message pour l'organisateur</Text>
      <Text style={styles.applyFormHint}>Présentez-vous brièvement (facultatif)</Text>
      <TextInput
        style={styles.applyInput}
        placeholder="Ex : Je suis céramiste depuis 5 ans, spécialisée en grès…"
        placeholderTextColor={colors.text.secondary}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        maxLength={500}
      />
      <Text style={styles.charCount}>{message.length}/500</Text>
      <View style={styles.applyActions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => setExpanded(false)}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, applying && { opacity: 0.6 }]}
          onPress={handleApply}
          disabled={applying}
        >
          <Text style={styles.confirmBtnText}>{applying ? 'Envoi…' : 'Envoyer ma candidature'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EventDetailScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { profile } = useAuth();
  const { event, loading, error } = useEvent(eventId);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Événement introuvable'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
          <Text style={{ color: colors.primary }}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const org = event.organizer;
  const orgName = org?.organizer_profile?.organization_name ?? org?.full_name ?? '—';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        {/* Type badge + Title */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{EVENT_TYPE_LABEL[event.event_type] ?? event.event_type}</Text>
        </View>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.location}>📍 {[event.location, event.city, event.region].filter(Boolean).join(', ')}</Text>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          <Row label="Ouverture"   value={formatDate(event.start_date)} />
          <Row label="Fermeture"   value={formatDate(event.end_date)} />
          {event.start_time && <Row label="Horaires" value={`${event.start_time}${event.end_time ? ` → ${event.end_time}` : ''}`} />}
        </View>

        {/* Stands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stands</Text>
          <Row label="Capacité"     value={`${event.stand_count} stands`} />
          {event.stand_price != null && (
            <Row label="Tarif"      value={event.stand_price === 0 ? 'Gratuit' : `${event.stand_price} €`} />
          )}
          {event.stand_dimensions && (
            <Row label="Dimensions" value={event.stand_dimensions} />
          )}
        </View>

        {/* Disciplines */}
        {event.discipline_tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disciplines recherchées</Text>
            <View style={styles.tagRow}>
              {event.discipline_tags.map(t => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.body}>{event.description}</Text>
          </View>
        )}

        {/* Rules */}
        {event.rules && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Règlement</Text>
            <Text style={styles.body}>{event.rules}</Text>
          </View>
        )}

        {/* Organizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organisateur</Text>
          <View style={styles.orgRow}>
            <View style={styles.orgAvatar}>
              <Text style={styles.orgAvatarText}>{orgName[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <Text style={styles.orgName}>{orgName}</Text>
          </View>
        </View>

        {/* Spacer for sticky footer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky apply footer */}
      {profile?.role === 'creator' && profile.id && (
        <View style={styles.footer}>
          <ApplySection eventId={eventId} userId={profile.id} />
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  errorText: { ...typography.body, color: colors.error },

  backBtn: { marginBottom: spacing.xl },
  backText: { color: colors.text.secondary },

  typeBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.primary + '20',
    borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3, marginBottom: spacing.sm,
  },
  typeBadgeText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  title: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm },
  location: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl },

  section: { marginBottom: spacing.xl },
  sectionTitle: {
    ...typography.label, color: colors.text.secondary, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: spacing.md, borderBottomWidth: 1,
    borderColor: colors.border, paddingBottom: spacing.xs,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  rowLabel: { ...typography.body, color: colors.text.secondary },
  rowValue: { ...typography.body, color: colors.text.primary, fontWeight: '500', flex: 1, textAlign: 'right' },
  body: { ...typography.body, color: colors.text.primary, lineHeight: 22 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { borderWidth: 1, borderColor: colors.primary + '60', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  tagText: { ...typography.caption, color: colors.primary },

  orgRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  orgAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.secondary + '30', alignItems: 'center', justifyContent: 'center',
  },
  orgAvatarText: { ...typography.h3, color: colors.secondary },
  orgName: { ...typography.body, color: colors.text.primary, fontWeight: '500' },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border,
    padding: spacing.lg, paddingBottom: spacing.xl,
  },
  applyBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center',
  },
  applyBtnText: { ...typography.h3, color: colors.text.inverse, fontWeight: '700' },
  applyBox: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  applyStatusText: { ...typography.label, fontWeight: '600' },

  applyForm: {},
  applyFormTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  applyFormHint: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm },
  applyInput: {
    backgroundColor: colors.background, color: colors.text.primary,
    borderRadius: radius.md, padding: spacing.md, borderWidth: 1,
    borderColor: colors.border, textAlignVertical: 'top', minHeight: 90,
  },
  charCount: { ...typography.caption, color: colors.text.secondary, textAlign: 'right', marginBottom: spacing.md },
  applyActions: { flexDirection: 'row', gap: spacing.sm },
  cancelBtn: {
    paddingHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  cancelBtnText: { ...typography.label, color: colors.text.secondary },
  confirmBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center',
  },
  confirmBtnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
