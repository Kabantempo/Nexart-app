import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useCreatorApplications } from '../../hooks/useApplications';
import { getOrCreateConversation } from '../../hooks/useConversations';
import { useHasReviewed } from '../../hooks/useReviews';
import { supabase } from '../../lib/supabase';
import { ApplicationStatus } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

async function createCheckoutSession(applicationId: string, eventTitle: string, standPrice: number): Promise<{ url: string | null; error: string | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { url: null, error: 'Non connecté' };
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ application_id: applicationId, event_title: eventTitle, stand_price: standPrice }),
      },
    );
    const data = await res.json();
    if (data.error) return { url: null, error: data.error };
    return { url: data.url, error: null };
  } catch (e: any) {
    return { url: null, error: e.message };
  }
}

const FILTERS: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'Acceptées', value: 'accepted' },
  { label: 'Refusées', value: 'refused' },
];

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'En attente', color: colors.text.secondary, bg: colors.border },
  accepted: { label: 'Acceptée',   color: colors.secondary,      bg: colors.secondary + '25' },
  refused:  { label: 'Refusée',    color: colors.error,          bg: colors.error + '20' },
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const e = new Date(end).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  return start === end ? s : `${s} → ${e}`;
}

function ApplicationCard({ item, userId }: { item: any; userId: string }) {
  const cfg = STATUS_CONFIG[item.status as ApplicationStatus];
  const nav = useNavigation<any>();
  const event = item.event;
  const isPast = event?.end_date && new Date(event.end_date) < new Date();
  const hasReviewed = useHasReviewed(event?.id ?? '', userId);
  const [paying, setPaying] = useState(false);

  const organizerId = event?.organizer_id ?? '';

  const isPaid    = !!item.stripe_payment_id && !item.stripe_payment_id.startsWith('pending_');
  const isPending = item.stripe_payment_id?.startsWith('pending_') ?? false;
  const needsPayment = item.status === 'accepted'
    && event?.stripe_enabled
    && (event?.stand_price ?? 0) > 0
    && !isPaid;

  const handlePay = async () => {
    if (!event?.stand_price) return;
    setPaying(true);
    const { url, error } = await createCheckoutSession(item.id, event.title, event.stand_price);
    setPaying(false);
    if (error || !url) { Alert.alert('Erreur', error ?? 'Impossible de créer la session de paiement'); return; }
    Linking.openURL(url);
  };

  const openChat = async () => {
    if (!event?.id || !userId || !organizerId) return;
    const convId = await getOrCreateConversation(event.id, userId, organizerId);
    if (!convId) { Alert.alert('Erreur', 'Conversation introuvable.'); return; }
    nav.getParent()?.navigate('Messages', {
      screen: 'Conversation',
      params: { conversationId: convId, eventTitle: event.title ?? 'Marché', otherPartyName: 'Organisateur', otherPartyId: organizerId },
    });
  };

  const openReview = () => {
    nav.navigate('Review', {
      eventId: event.id,
      reviewedId: organizerId,
      reviewedName: 'L\'organisateur',
      reviewerRole: 'creator',
    });
  };

  return (
    <View style={s.card}>
      {item.status === 'accepted' && (
        <View style={s.acceptedBanner}><Text style={s.acceptedBannerText}>Candidature acceptée</Text></View>
      )}
      <View style={s.cardHeader}>
        {event?.start_date && (
          <View style={s.dateBadge}>
            <Text style={s.dateBadgeDay}>{new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit' })}</Text>
            <Text style={s.dateBadgeMonth}>{new Date(event.start_date).toLocaleDateString('fr-FR', { month: 'short' })}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.eventTitle} numberOfLines={2}>{event?.title ?? '—'}</Text>
          {event?.city && <Text style={s.eventMeta}>{event.city}{event.start_date ? `  ·  ${formatDateRange(event.start_date, event.end_date ?? event.start_date)}` : ''}</Text>}
          <Text style={s.appliedDate}>Candidaté le {new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
      {item.message && (
        <View style={s.messageBox}>
          <Text style={s.messageLabel}>Votre message</Text>
          <Text style={s.messageText} numberOfLines={2}>{item.message}</Text>
        </View>
      )}
      {item.status === 'refused' && item.refusal_reason && (
        <View style={s.refusalBox}>
          <View style={s.refusalHeader}>
            <Ionicons name="close" size={11} color={colors.error} />
            <Text style={s.refusalLabel}>Motif du refus</Text>
          </View>
          <Text style={s.refusalText}>{item.refusal_reason}</Text>
        </View>
      )}
      {item.status === 'accepted' && (
        <View style={s.actionRow}>
          <TouchableOpacity style={s.btnMsg} onPress={openChat}>
            <Text style={s.btnMsgText}>Message</Text>
          </TouchableOpacity>
          {needsPayment && !isPending && (
            <TouchableOpacity style={[s.btnPay, paying && { opacity: 0.6 }]} onPress={handlePay} disabled={paying}>
              <Ionicons name="card-outline" size={13} color={colors.text.inverse} />
              <Text style={s.btnPayText}>{paying ? '…' : `Payer ${event.stand_price} €`}</Text>
            </TouchableOpacity>
          )}
          {isPending && (
            <View style={s.badgePending}>
              <Ionicons name="time-outline" size={12} color={colors.text.secondary} />
              <Text style={s.badgePendingText}>Paiement en attente</Text>
            </View>
          )}
          {isPaid && (
            <View style={s.badgePaid}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <Text style={s.badgePaidText}>Stand payé</Text>
            </View>
          )}
          {isPast && hasReviewed === false && (
            <TouchableOpacity style={s.btnReview} onPress={openReview}>
              <Text style={s.btnReviewText}>Évaluer</Text>
            </TouchableOpacity>
          )}
          {isPast && hasReviewed === true && (
            <View style={s.reviewedBadge}><Text style={s.reviewedText}>Évalué</Text></View>
          )}
        </View>
      )}
    </View>
  );
}

export default function ApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { applications, loading, refetch } = useCreatorApplications(profile?.id);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);
  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    refused: applications.filter(a => a.status === 'refused').length,
  };

  const pastAcceptedCount = applications.filter(a =>
    a.status === 'accepted' &&
    a.event?.end_date &&
    new Date(a.event.end_date) < new Date()
  ).length;

  const showReviewBanner = pastAcceptedCount > 0 && filter !== 'accepted';

  return (
    <View style={[s.container, { paddingTop: insets.top + spacing.sm }]}>
      <Text style={s.title}>Mes candidatures</Text>

      {/* Bannière avis en attente */}
      {showReviewBanner && (
        <TouchableOpacity
          style={s.reviewBanner}
          onPress={() => setFilter('accepted')}
          activeOpacity={0.85}
        >
          <View style={s.reviewBannerIcon}>
            <Ionicons name="star-outline" size={16} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.reviewBannerTitle}>
              {pastAcceptedCount} marché{pastAcceptedCount > 1 ? 's' : ''} à évaluer
            </Text>
            <Text style={s.reviewBannerSub}>Laissez un avis pour aider la communauté</Text>
          </View>
          <Ionicons name="chevron-forward" size={15} color={colors.secondary} />
        </TouchableOpacity>
      )}

      {applications.length > 0 && (
        <View style={s.statsRow}>
          <View style={s.statItem}><Text style={s.statNum}>{counts.pending}</Text><Text style={s.statLabel}>En attente</Text></View>
          <View style={[s.statItem, s.statDivider]}><Text style={[s.statNum, { color: colors.secondary }]}>{counts.accepted}</Text><Text style={s.statLabel}>Acceptées</Text></View>
          <View style={s.statItem}><Text style={[s.statNum, { color: colors.error }]}>{counts.refused}</Text><Text style={s.statLabel}>Refusées</Text></View>
        </View>
      )}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.value} style={[s.filterTab, filter === f.value && s.filterTabActive]} onPress={() => setFilter(f.value)}>
            <Text style={[s.filterTabText, filter === f.value && s.filterTabTextActive]}>{f.label}{counts[f.value] > 0 ? ` (${counts[f.value]})` : ''}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <ApplicationCard item={item} userId={profile?.id ?? ''} />}
          contentContainerStyle={s.list}
          onRefresh={refetch}
          refreshing={loading}
          ListEmptyComponent={
            <View style={s.empty}>
              {applications.length === 0
                ? <><Text style={s.emptyTitle}>Aucune candidature</Text><Text style={s.emptySubtitle}>Parcourez les marchés et candidatez en 1 clic</Text></>
                : <Text style={s.emptyTitle}>Aucune candidature dans cette catégorie</Text>
              }
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },
  title: { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', marginHorizontal: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  statNum: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.xs, marginBottom: spacing.md },
  filterTab: { flex: 1, paddingVertical: 7, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  filterTabTextActive: { color: colors.text.inverse, fontWeight: '700' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  acceptedBanner: { backgroundColor: colors.secondary + '20', borderBottomWidth: 1, borderColor: colors.secondary + '40', paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  acceptedBannerText: { ...typography.caption, color: colors.secondary, fontWeight: '600' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg },
  dateBadge: { width: 44, alignItems: 'center', backgroundColor: colors.primary + '15', borderRadius: radius.sm, padding: spacing.xs },
  dateBadgeDay: { ...typography.h3, color: colors.primary, lineHeight: 22 },
  dateBadgeMonth: { ...typography.caption, color: colors.primary, textTransform: 'uppercase' },
  eventTitle: { ...typography.label, color: colors.text.primary, fontWeight: '700', marginBottom: 3 },
  eventMeta: { ...typography.caption, color: colors.text.secondary, marginBottom: 2 },
  appliedDate: { ...typography.caption, color: colors.text.secondary + '99' },
  statusBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { ...typography.caption, fontWeight: '700' },
  messageBox: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.sm, borderLeftWidth: 2, borderColor: colors.primary + '50' },
  messageLabel: { ...typography.caption, color: colors.text.secondary, marginBottom: 2 },
  messageText: { ...typography.caption, color: colors.text.primary, lineHeight: 18 },
  refusalBox: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.error + '08', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.error + '30' },
  refusalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  refusalIcon: { fontSize: 11, color: colors.error, fontWeight: '700' },
  refusalLabel: { ...typography.caption, color: colors.error, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  refusalText: { ...typography.caption, color: colors.text.primary, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  btnMsg: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  btnMsgText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  btnPay: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.success },
  btnPayText: { ...typography.caption, color: colors.text.inverse, fontWeight: '700' },
  badgePending: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  badgePendingText: { ...typography.caption, color: colors.text.secondary },
  badgePaid: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.success + '15', borderWidth: 1, borderColor: colors.success + '40' },
  badgePaidText: { ...typography.caption, color: colors.success, fontWeight: '600' },
  btnReview: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.secondary, alignItems: 'center' },
  btnReviewText: { ...typography.caption, color: colors.secondary, fontWeight: '600' },
  reviewedBadge: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  reviewedText: { ...typography.caption, color: colors.text.secondary },
  reviewBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginHorizontal: spacing.xl, marginBottom: spacing.md,
    backgroundColor: colors.secondary + '12',
    borderWidth: 1, borderColor: colors.secondary + '40',
    borderRadius: radius.lg, padding: spacing.md,
  },
  reviewBannerIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.secondary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  reviewBannerTitle: { ...typography.label, color: colors.secondary, fontWeight: '700', marginBottom: 2 },
  reviewBannerSub:   { ...typography.caption, color: colors.text.secondary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl },
  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
  emptySubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
});
