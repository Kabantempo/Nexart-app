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
  permanent: 'Marché permanent', seasonal: 'Saisonnier',
  popup: 'Pop-up', salon: 'Salon', fair: 'Foire',
};

const TYPE_COLORS: Record<string, string> = {
  permanent: '#3B82F6', seasonal: '#F59E0B',
  popup: '#A855F7', salon: '#10B981', fair: '#EF4444',
};

const STATUS_CONFIG = {
  pending:  { label: 'Candidature envoyée',  bg: colors.text.secondary + '20', color: colors.text.secondary },
  accepted: { label: 'Candidature acceptée', bg: colors.secondary + '20',      color: colors.secondary },
  refused:  { label: 'Candidature refusée',  bg: colors.error + '20',          color: colors.error },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ─── Apply section ────────────────────────────────────────

function ApplySection({ eventId, userId }: { eventId: string; userId: string }) {
  const { status, loading: statusLoading } = useApplicationStatus(eventId, userId);
  const { apply, loading: applying } = useApply(eventId, userId);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage]   = useState('');
  const [applied, setApplied]   = useState(false);

  const handleApply = async () => {
    const { error } = await apply(message.trim() || undefined);
    if (error) {
      if (error.includes('unique')) Alert.alert('Déjà candidaté', 'Vous avez déjà envoyé une candidature pour ce marché.');
      else Alert.alert('Erreur', error);
      return;
    }
    setExpanded(false);
    setApplied(true);
  };

  if (statusLoading) return <ActivityIndicator color={colors.primary} style={{ margin: spacing.xl }} />;

  if (applied) {
    return (
      <View style={s.successBox}>
        <View style={s.successIcon}>
          <Text style={s.successIconText}>✓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.successTitle}>Candidature envoyée !</Text>
          <Text style={s.successSub}>L'organisateur vous répondra par message.</Text>
        </View>
      </View>
    );
  }

  if (status !== 'none') {
    const cfg = STATUS_CONFIG[status];
    return (
      <View style={[s.statusBox, { backgroundColor: cfg.bg }]}>
        <Text style={[s.statusBoxText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    );
  }

  if (!expanded) {
    return (
      <TouchableOpacity style={s.applyBtn} onPress={() => setExpanded(true)} activeOpacity={0.85}>
        <Text style={s.applyBtnText}>Je m'inscris à ce marché</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={s.applyForm}>
      <Text style={s.applyFormTitle}>Message pour l'organisateur</Text>
      <Text style={s.applyFormHint}>Présentez-vous brièvement (facultatif)</Text>
      <TextInput
        style={s.applyInput}
        placeholder="Ex : Je suis céramiste depuis 5 ans, spécialisée en grès…"
        placeholderTextColor={colors.text.secondary + '80'}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        maxLength={500}
      />
      <Text style={s.charCount}>{message.length}/500</Text>
      <View style={s.applyActions}>
        <TouchableOpacity style={s.cancelBtn} onPress={() => setExpanded(false)}>
          <Text style={s.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.confirmBtn, applying && { opacity: 0.6 }]}
          onPress={handleApply}
          disabled={applying}
          activeOpacity={0.85}
        >
          <Text style={s.confirmBtnText}>{applying ? 'Envoi…' : 'Envoyer ma candidature'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────

export default function EventDetailScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { profile } = useAuth();
  const { event, loading, error } = useEvent(eventId);

  if (loading) return <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;
  if (error || !event) return (
    <View style={s.centered}>
      <Text style={s.errorText}>{error ?? 'Événement introuvable'}</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
        <Text style={{ color: colors.primary }}>← Retour</Text>
      </TouchableOpacity>
    </View>
  );

  const accent  = TYPE_COLORS[event.event_type] ?? colors.primary;
  const org     = event.organizer;
  const orgName = org?.organizer_profile?.organization_name ?? org?.full_name ?? '—';

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Retour</Text>
        </TouchableOpacity>

        {/* Type + title */}
        <View style={[s.typePill, { backgroundColor: accent + '18' }]}>
          <Text style={[s.typePillText, { color: accent }]}>{EVENT_TYPE_LABEL[event.event_type] ?? event.event_type}</Text>
        </View>
        <Text style={s.title}>{event.title}</Text>
        <Text style={s.location}>{[event.location, event.city, event.region].filter(Boolean).join(', ')}</Text>

        {/* Dates */}
        <Section title="Dates">
          <View style={s.infoCard}>
            <InfoRow label="Ouverture" value={formatDate(event.start_date)} />
            <View style={s.divider} />
            <InfoRow label="Fermeture" value={formatDate(event.end_date)} />
            {event.start_time && (
              <>
                <View style={s.divider} />
                <InfoRow label="Horaires" value={`${event.start_time}${event.end_time ? ` → ${event.end_time}` : ''}`} />
              </>
            )}
          </View>
        </Section>

        {/* Stands */}
        <Section title="Stands">
          <View style={s.infoCard}>
            <InfoRow label="Capacité" value={`${event.stand_count} stands`} />
            {event.stand_price != null && (
              <>
                <View style={s.divider} />
                <InfoRow label="Tarif" value={event.stand_price === 0 ? 'Gratuit' : `${event.stand_price} €`} />
              </>
            )}
            {event.stand_dimensions && (
              <>
                <View style={s.divider} />
                <InfoRow label="Dimensions" value={event.stand_dimensions} />
              </>
            )}
          </View>
        </Section>

        {/* Disciplines */}
        {event.discipline_tags.length > 0 && (
          <Section title="Disciplines recherchées">
            <View style={s.tagRow}>
              {event.discipline_tags.map(t => (
                <View key={t} style={[s.tag, { borderColor: accent + '50', backgroundColor: accent + '10' }]}>
                  <Text style={[s.tagText, { color: accent }]}>{t}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Description */}
        {event.description && (
          <Section title="Description">
            <Text style={s.body}>{event.description}</Text>
          </Section>
        )}

        {/* Rules */}
        {event.rules && (
          <Section title="Règlement">
            <View style={s.rulesBox}>
              <Text style={s.rulesText}>{event.rules}</Text>
            </View>
          </Section>
        )}

        {/* Organizer */}
        <Section title="Organisateur">
          <View style={s.orgCard}>
            <View style={s.orgAvatar}>
              <Text style={s.orgAvatarText}>{orgName[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <View>
              <Text style={s.orgName}>{orgName}</Text>
              <Text style={s.orgRole}>Organisateur</Text>
            </View>
          </View>
        </Section>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky footer */}
      {profile?.role === 'creator' && profile.id && (
        <View style={s.footer}>
          <ApplySection eventId={eventId} userId={profile.id} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { padding: spacing.xl, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  errorText: { ...typography.body, color: colors.error },

  backBtn:  { marginBottom: spacing.xl },
  backText: { color: colors.text.secondary },

  typePill:     { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full, marginBottom: spacing.sm },
  typePillText: { ...typography.caption, fontWeight: '700', textTransform: 'capitalize' },
  title:        { ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm, lineHeight: 38 },
  location:     { ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl },

  section:      { marginBottom: spacing.xl },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionAccent:{ width: 3, height: 16, borderRadius: 2, backgroundColor: colors.primary },
  sectionTitle: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600' },

  infoCard:  { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  infoLabel: { ...typography.body, color: colors.text.secondary },
  infoValue: { ...typography.body, color: colors.text.primary, fontWeight: '500', flex: 1, textAlign: 'right' },
  divider:   { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },

  body: { ...typography.body, color: colors.text.primary, lineHeight: 24 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag:    { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  tagText:{ ...typography.caption, fontWeight: '600' },

  rulesBox:  { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 3, borderLeftColor: colors.primary + '60' },
  rulesText: { ...typography.body, color: colors.text.primary, lineHeight: 24 },

  orgCard:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  orgAvatar:     { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.secondary + '25', alignItems: 'center', justifyContent: 'center' },
  orgAvatarText: { ...typography.h3, color: colors.secondary },
  orgName:       { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  orgRole:       { ...typography.caption, color: colors.text.secondary },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface + 'F5',
    borderTopWidth: 1, borderColor: colors.border,
    padding: spacing.lg, paddingBottom: spacing.xl,
  },
  statusBox:     { borderRadius: radius.xl, padding: spacing.md, alignItems: 'center' },
  statusBoxText: { ...typography.label, fontWeight: '700' },

  successBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.secondary + '12',
    borderRadius: radius.xl, padding: spacing.md,
    borderWidth: 1, borderColor: colors.secondary + '40',
  },
  successIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  successIconText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  successTitle: { ...typography.label, color: colors.secondary, fontWeight: '700', marginBottom: 2 },
  successSub:   { ...typography.caption, color: colors.text.secondary },
  applyBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  applyBtnText:  { ...typography.h3, color: colors.text.inverse, fontWeight: '700' },
  applyForm:     {},
  applyFormTitle:{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  applyFormHint: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm },
  applyInput: {
    backgroundColor: colors.background, color: colors.text.primary,
    borderRadius: radius.xl, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    textAlignVertical: 'top', minHeight: 90, fontSize: 15,
  },
  charCount:     { ...typography.caption, color: colors.text.secondary, textAlign: 'right', marginBottom: spacing.md },
  applyActions:  { flexDirection: 'row', gap: spacing.sm },
  cancelBtn:     { paddingHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelBtnText: { ...typography.label, color: colors.text.secondary },
  confirmBtn:    { flex: 1, backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center' },
  confirmBtnText:{ ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
