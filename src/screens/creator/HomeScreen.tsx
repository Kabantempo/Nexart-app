import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../stores/auth';
import { useEvents } from '../../hooks/useEvents';
import { useCreatorApplications } from '../../hooks/useApplications';
import { useCreatorProfile } from '../../hooks/useCreatorProfile';
import { useEventRecommendations } from '../../hooks/useRecommendations';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { Event } from '../../types';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: 'En attente', bg: colors.text.secondary + '18', color: colors.text.secondary },
  accepted: { label: 'Acceptée',   bg: colors.secondary + '20',      color: colors.secondary },
  refused:  { label: 'Refusée',    bg: colors.error + '18',          color: colors.error },
};

const EVENT_TYPE_ACCENT: Record<string, string> = {
  permanent: '#3B82F6',
  seasonal:  '#F59E0B',
  popup:     '#A855F7',
  salon:     '#10B981',
  fair:      '#EF4444',
};

// ─── EventCard ────────────────────────────────────────────

function EventCard({ event }: { event: Event }) {
  const accent = EVENT_TYPE_ACCENT[event.event_type] ?? colors.primary;
  return (
    <View style={[s.eventCard, { borderLeftColor: accent }]}>
      <View style={[s.eventDateBadge, { backgroundColor: accent + '18' }]}>
        <Text style={[s.eventDateDay, { color: accent }]}>
          {new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit' })}
        </Text>
        <Text style={[s.eventDateMonth, { color: accent }]}>
          {new Date(event.start_date).toLocaleDateString('fr-FR', { month: 'short' })}
        </Text>
      </View>
      <View style={s.eventInfo}>
        <Text style={s.eventTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={s.eventCity} numberOfLines={1}>{event.city ?? '—'}</Text>
        {event.stand_price != null && (
          <Text style={s.eventPrice}>
            {event.stand_price === 0 ? 'Gratuit' : `Stand ${event.stand_price} €`}
          </Text>
        )}
      </View>
      <View style={[s.eventArrow, { backgroundColor: accent + '15' }]}>
        <Text style={[s.eventArrowText, { color: accent }]}>›</Text>
      </View>
    </View>
  );
}

// ─── ApplicationItem ──────────────────────────────────────

function ApplicationItem({ application }: { application: any }) {
  const cfg = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.pending;
  return (
    <View style={s.appItem}>
      <View style={s.appDot} />
      <View style={{ flex: 1 }}>
        <Text style={s.appTitle} numberOfLines={1}>{application.event?.title ?? '—'}</Text>
        <Text style={s.appCity}>{application.event?.city ?? ''}</Text>
      </View>
      <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
        <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <View style={s.emptyState}>
      <View style={s.emptyDot} />
      <Text style={s.emptyText}>{message}</Text>
    </View>
  );
}

// ─── SectionTitle ─────────────────────────────────────────

function SectionTitle({ children, accent }: { children: string; accent?: boolean }) {
  return (
    <View style={s.sectionHeader}>
      {accent && <View style={s.sectionAccent} />}
      <Text style={s.sectionTitle}>{children}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────

export default function CreatorHomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { creatorProfile } = useCreatorProfile(profile?.id);
  const { events, loading: evLoading } = useEvents({ limit: 5 });
  const { applications, loading: appLoading } = useCreatorApplications(profile?.id);
  const { events: recommended, loading: recLoading } = useEventRecommendations(creatorProfile, 3);

  const pendingCount  = applications.filter(a => a.status === 'pending').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const firstName     = profile?.full_name?.split(' ')[0] ?? 'artisan';

  return (
    <ScrollView style={s.container} contentContainerStyle={[s.content, { paddingTop: insets.top + spacing.sm }]} showsVerticalScrollIndicator={false}>

      {/* Greeting */}
      <View style={s.greetingWrap}>
        <Text style={s.greeting}>Bonjour, {firstName}</Text>
        <Text style={s.subtitle}>Trouvez vos prochains marchés</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={[s.statCard, s.statCardPending]}>
          <Text style={s.statNum}>{pendingCount}</Text>
          <Text style={s.statLabel}>En attente</Text>
        </View>
        <View style={[s.statCard, s.statCardAccepted]}>
          <Text style={[s.statNum, { color: colors.secondary }]}>{acceptedCount}</Text>
          <Text style={s.statLabel}>Acceptées</Text>
        </View>
      </View>

      {/* Recommandés */}
      {!recLoading && recommended.length > 0 && (
        <>
          <SectionTitle accent>Pour vous</SectionTitle>
          {recommended.map(e => <EventCard key={e.id} event={e} />)}
          <View style={s.spacer} />
        </>
      )}

      {/* Prochains marchés */}
      <SectionTitle>Prochains marchés</SectionTitle>
      {evLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : events.length === 0 ? (
        <EmptyState message="Aucun marché disponible pour l'instant" />
      ) : (
        events.map(e => <EventCard key={e.id} event={e} />)
      )}

      <View style={s.spacer} />

      {/* Candidatures */}
      <SectionTitle>Mes candidatures</SectionTitle>
      {appLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : applications.length === 0 ? (
        <EmptyState message="Candidatez à vos premiers marchés !" />
      ) : (
        applications.slice(0, 5).map(a => <ApplicationItem key={a.id} application={a} />)
      )}

    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },

  // Greeting
  greetingWrap: { marginBottom: spacing.xl },
  greeting:     { ...typography.h2, color: colors.text.primary, fontWeight: '700', marginBottom: spacing.xs },
  subtitle:     { ...typography.body, color: colors.text.secondary },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  statCard: {
    flex: 1, borderRadius: radius.xl,
    padding: spacing.lg, alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardPending: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    shadowColor: colors.text.secondary,
  },
  statCardAccepted: {
    backgroundColor: colors.secondary + '10',
    borderColor: colors.secondary + '30',
    shadowColor: colors.secondary,
  },
  statNum:   { ...typography.h1, fontSize: 32, fontWeight: '700', marginBottom: 2 },
  statLabel: { ...typography.caption, color: colors.text.secondary },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: colors.primary },
  sectionTitle:  { ...typography.h3, color: colors.text.primary, fontWeight: '600' },

  spacer: { height: spacing.xl },

  // Event card
  eventCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  eventDateBadge: {
    width: 44, alignItems: 'center',
    marginRight: spacing.md,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
  },
  eventDateDay:   { ...typography.h3, fontWeight: '700', lineHeight: 22 },
  eventDateMonth: { ...typography.caption, textTransform: 'uppercase', fontSize: 10 },
  eventInfo:      { flex: 1 },
  eventTitle:     { ...typography.label, color: colors.text.primary, fontWeight: '600', marginBottom: 3 },
  eventCity:      { ...typography.caption, color: colors.text.secondary },
  eventPrice:     { ...typography.caption, color: colors.primary, marginTop: 2, fontWeight: '600' },
  eventArrow: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginLeft: spacing.sm,
  },
  eventArrowText: { fontSize: 18, fontWeight: '300', marginTop: -1 },

  // Application item
  appItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    gap: spacing.sm,
  },
  appDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  appTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600', marginBottom: 2 },
  appCity:  { ...typography.caption, color: colors.text.secondary },
  statusPill: {
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: { ...typography.caption, fontWeight: '700', fontSize: 11 },

  // Empty state
  emptyState: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: spacing.sm,
  },
  emptyDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.text.secondary + '40' },
  emptyText: { ...typography.body, color: colors.text.secondary, fontStyle: 'italic' },
});
