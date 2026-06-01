import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useCreatorApplications } from '../../hooks/useApplications';
import { getOrCreateConversation } from '../../hooks/useConversations';
import { submitReview, useHasReviewed } from '../../hooks/useReviews';
import { ApplicationStatus, CREATOR_REVIEW_TAGS } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

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

function ReviewModal({ visible, onClose, onSubmit }: { visible: boolean; onClose: () => void; onSubmit: (r: number, c: string, t: string[]) => Promise<void> }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const toggle = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const handle = async () => {
    if (!rating) { Alert.alert('Note requise'); return; }
    setSaving(true); await onSubmit(rating, comment, tags); setSaving(false);
    setRating(0); setComment(''); setTags([]);
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.panel}>
          <Text style={m.title}>Évaluer l'organisateur</Text>
          <Text style={m.label}>Note</Text>
          <View style={m.stars}>
            {[1,2,3,4,5].map(n => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Text style={[m.star, n <= rating && m.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={m.label}>Tags</Text>
          <View style={m.tagWrap}>
            {CREATOR_REVIEW_TAGS.map(t => (
              <TouchableOpacity key={t} style={[m.tag, tags.includes(t) && m.tagActive]} onPress={() => toggle(t)}>
                <Text style={[m.tagText, tags.includes(t) && m.tagTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={m.input} value={comment} onChangeText={setComment} placeholder="Votre avis… (100 max)" placeholderTextColor={colors.text.secondary} maxLength={100} />
          <View style={m.actions}>
            <TouchableOpacity style={m.btnCancel} onPress={onClose}><Text style={m.btnCancelText}>Annuler</Text></TouchableOpacity>
            <TouchableOpacity style={[m.btnSubmit, saving && { opacity: 0.6 }]} onPress={handle} disabled={saving}>
              <Text style={m.btnSubmitText}>{saving ? 'Envoi…' : 'Envoyer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ApplicationCard({ item, userId }: { item: any; userId: string }) {
  const cfg = STATUS_CONFIG[item.status as ApplicationStatus];
  const nav = useNavigation<any>();
  const event = item.event;
  const isPast = event?.end_date && new Date(event.end_date) < new Date();
  const hasReviewed = useHasReviewed(event?.id ?? '', userId);
  const [showReview, setShowReview] = useState(false);

  const organizerId = event?.organizer_id ?? '';

  const openChat = async () => {
    if (!event?.id || !userId || !organizerId) return;
    const convId = await getOrCreateConversation(event.id, userId, organizerId);
    if (!convId) { Alert.alert('Erreur', 'Conversation introuvable.'); return; }
    nav.getParent()?.navigate('Messages', {
      screen: 'Conversation',
      params: { conversationId: convId, eventTitle: event.title ?? 'Marché', otherPartyName: 'Organisateur', otherPartyId: organizerId },
    });
  };

  const handleReview = async (rating: number, comment: string, tags: string[]) => {
    if (!organizerId) { Alert.alert('Erreur', 'Organisateur introuvable.'); return; }
    const { error } = await submitReview({
      eventId: event.id, reviewerId: userId, reviewedId: organizerId,
      reviewerRole: 'creator', rating, comment, tags,
    });
    if (error) Alert.alert('Erreur', error);
    else { setShowReview(false); Alert.alert('Avis envoyé !'); }
  };

  return (
    <View style={s.card}>
      {item.status === 'accepted' && (
        <View style={s.acceptedBanner}><Text style={s.acceptedBannerText}>🎉 Candidature acceptée</Text></View>
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
          {event?.city && <Text style={s.eventMeta}>📍 {event.city}{event.start_date ? `  ·  ${formatDateRange(event.start_date, event.end_date ?? event.start_date)}` : ''}</Text>}
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
      {item.status === 'accepted' && (
        <View style={s.actionRow}>
          <TouchableOpacity style={s.btnMsg} onPress={openChat}>
            <Text style={s.btnMsgText}>💬 Message</Text>
          </TouchableOpacity>
          {isPast && hasReviewed === false && (
            <TouchableOpacity style={s.btnReview} onPress={() => setShowReview(true)}>
              <Text style={s.btnReviewText}>★ Évaluer</Text>
            </TouchableOpacity>
          )}
          {isPast && hasReviewed === true && (
            <View style={s.reviewedBadge}><Text style={s.reviewedText}>✓ Évalué</Text></View>
          )}
        </View>
      )}
      <ReviewModal visible={showReview} onClose={() => setShowReview(false)} onSubmit={handleReview} />
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

  return (
    <View style={[s.container, { paddingTop: insets.top + spacing.sm }]}>
      <Text style={s.title}>Mes candidatures</Text>
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
  messageBox: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.sm, borderLeftWidth: 2, borderColor: colors.primary + '50' },
  messageLabel: { ...typography.caption, color: colors.text.secondary, marginBottom: 2 },
  messageText: { ...typography.caption, color: colors.text.primary, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  btnMsg: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  btnMsgText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  btnReview: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.secondary, alignItems: 'center' },
  btnReviewText: { ...typography.caption, color: colors.secondary, fontWeight: '600' },
  reviewedBadge: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  reviewedText: { ...typography.caption, color: colors.text.secondary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl },
  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
  emptySubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  panel: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl },
  title: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11, marginBottom: spacing.sm, marginTop: spacing.md },
  stars: { flexDirection: 'row', gap: spacing.sm },
  star: { fontSize: 32, color: colors.border },
  starActive: { color: colors.primary },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  tagActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  tagText: { ...typography.caption, color: colors.text.secondary },
  tagTextActive: { color: colors.text.inverse, fontWeight: '600' },
  input: { backgroundColor: colors.background, color: colors.text.primary, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  btnCancel: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  btnCancelText: { ...typography.label, color: colors.text.secondary },
  btnSubmit: { flex: 2, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' },
  btnSubmitText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
