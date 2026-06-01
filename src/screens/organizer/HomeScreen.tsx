import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../stores/auth';
import { useEvents } from '../../hooks/useEvents';
import { useOrganizerApplications } from '../../hooks/useApplications';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { Event } from '../../types';

const STATUS_CFG = {
  published: { label: 'Publié',   bg: colors.secondary + '20', color: colors.secondary },
  draft:     { label: 'Brouillon', bg: colors.text.secondary + '18', color: colors.text.secondary },
  closed:    { label: 'Fermé',    bg: colors.error + '18', color: colors.error },
};

// ─── EventCard ────────────────────────────────────────────

function EventCard({ event }: { event: Event }) {
  const start = new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const end   = new Date(event.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const cfg   = STATUS_CFG[event.status] ?? STATUS_CFG.draft;

  return (
    <View style={s.eventCard}>
      <View style={s.eventLeft}>
        <View style={[s.eventDotLine, { backgroundColor: cfg.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={s.eventTitle} numberOfLines={1}>{event.title}</Text>
          <Text style={s.eventMeta}>{event.city ?? '—'} · {start} → {end}</Text>
          <Text style={s.eventStands}>{event.stand_count} stands</Text>
        </View>
      </View>
      <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
        <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
}

// ─── ApplicationRow ───────────────────────────────────────

function ApplicationRow({ application }: { application: any }) {
  const initials = application.creator?.full_name?.[0]?.toUpperCase() ?? '?';
  const date     = new Date(application.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

  return (
    <View style={s.appRow}>
      <View style={s.appAvatar}>
        <Text style={s.appAvatarText}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.appName}>{application.creator?.full_name ?? '—'}</Text>
        <Text style={s.appDate}>Candidaté le {date}</Text>
      </View>
      <View style={s.pendingPill}>
        <Text style={s.pendingText}>En attente</Text>
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

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionAccent} />
      <Text style={s.sectionTitle}>{children}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────

export default function OrganizerHomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { events, loading: evLoading }     = useEvents({ organizerId: profile?.id, limit: 5 });
  const { applications, loading: appLoading } = useOrganizerApplications();

  const publishedCount = events.filter(e => e.status === 'published').length;
  const pendingApps    = applications.filter(a => a.status === 'pending');
  const firstName      = profile?.full_name?.split(' ')[0] ?? 'organisateur';

  return (
    <ScrollView style={s.container} contentContainerStyle={[s.content, { paddingTop: insets.top + spacing.sm }]} showsVerticalScrollIndicator={false}>

      {/* Greeting */}
      <View style={s.greetingWrap}>
        <Text style={s.greeting}>Bonjour, {firstName}</Text>
        <Text style={s.subtitle}>Gérez vos marchés artisanaux</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={[s.statCard, s.statCardPublished]}>
          <Text style={[s.statNum, { color: colors.secondary }]}>{publishedCount}</Text>
          <Text style={s.statLabel}>Marchés actifs</Text>
        </View>
        <View style={[s.statCard, s.statCardPending]}>
          <Text style={[s.statNum, { color: colors.primary }]}>{pendingApps.length}</Text>
          <Text style={s.statLabel}>Candidatures</Text>
        </View>
      </View>

      {/* Mes marchés */}
      <SectionTitle>Mes marchés</SectionTitle>
      {evLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : events.length === 0 ? (
        <EmptyState message={'Aucun marché créé — utilisez l\'onglet "Créer"'} />
      ) : (
        events.map(e => <EventCard key={e.id} event={e} />)
      )}

      <View style={s.spacer} />

      {/* Candidatures */}
      <SectionTitle>Nouvelles candidatures</SectionTitle>
      {appLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : pendingApps.length === 0 ? (
        <EmptyState message="Aucune nouvelle candidature pour l'instant" />
      ) : (
        pendingApps.slice(0, 5).map(a => <ApplicationRow key={a.id} application={a} />)
      )}

    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },

  greetingWrap: { marginBottom: spacing.xl },
  greeting:     { ...typography.h2, color: colors.text.primary, fontWeight: '700', marginBottom: spacing.xs },
  subtitle:     { ...typography.body, color: colors.text.secondary },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  statCard: {
    flex: 1, borderRadius: radius.xl,
    padding: spacing.lg, alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 2,
  },
  statCardPublished: {
    backgroundColor: colors.secondary + '10',
    borderColor: colors.secondary + '30',
    shadowColor: colors.secondary,
  },
  statCardPending: {
    backgroundColor: colors.primary + '08',
    borderColor: colors.primary + '25',
    shadowColor: colors.primary,
  },
  statNum:   { ...typography.h1, fontSize: 32, fontWeight: '700', marginBottom: 2 },
  statLabel: { ...typography.caption, color: colors.text.secondary },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: colors.primary },
  sectionTitle:  { ...typography.h3, color: colors.text.primary, fontWeight: '600' },

  spacer: { height: spacing.xl },

  eventCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  eventLeft:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eventDotLine: { width: 3, height: 36, borderRadius: 2 },
  eventTitle:   { ...typography.label, color: colors.text.primary, fontWeight: '600', marginBottom: 3 },
  eventMeta:    { ...typography.caption, color: colors.text.secondary },
  eventStands:  { ...typography.caption, color: colors.primary, marginTop: 2, fontWeight: '600' },
  statusPill: {
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full, marginLeft: spacing.sm,
  },
  statusText: { ...typography.caption, fontWeight: '700', fontSize: 11 },

  appRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    gap: spacing.md,
  },
  appAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  appAvatarText: { ...typography.label, color: colors.primary, fontWeight: '700' },
  appName:       { ...typography.label, color: colors.text.primary, fontWeight: '600', marginBottom: 2 },
  appDate:       { ...typography.caption, color: colors.text.secondary },
  pendingPill: {
    backgroundColor: colors.text.secondary + '18',
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full,
  },
  pendingText: { ...typography.caption, color: colors.text.secondary, fontWeight: '600', fontSize: 11 },

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
