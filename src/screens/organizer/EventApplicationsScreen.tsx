import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal, Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { OrganizerEventStackParams } from '../../navigation/OrganizerEventStack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../stores/auth';
import { getOrCreateConversation } from '../../hooks/useConversations';
import { useHasReviewed } from '../../hooks/useReviews';
import { getPushTokenForUser, sendPushNotification } from '../../hooks/usePushNotifications';
import { ApplicationStatus } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { DEMO_MODE, DEMO_ORGANIZER_APPLICATIONS } from '../../lib/demoData';

type Props = {
  navigation: StackNavigationProp<OrganizerEventStackParams, 'EventApplications'>;
  route: RouteProp<OrganizerEventStackParams, 'EventApplications'>;
};

interface ApplicationItem {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  refusal_reason: string | null;
  stripe_payment_id: string | null;
  created_at: string;
  creator: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    creator_profile: { disciplines: string[]; city: string | null } | null;
  };
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'En attente', color: colors.text.secondary, bg: colors.border },
  accepted: { label: 'Acceptée',   color: colors.secondary,      bg: colors.secondary + '25' },
  refused:  { label: 'Refusée',    color: colors.error,          bg: colors.error + '20' },
};

const FILTERS: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'Toutes',     value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'Acceptées',  value: 'accepted' },
  { label: 'Refusées',   value: 'refused' },
];

// ─── Refusal modal ────────────────────────────────────────────────────────────

function RefusalModal({
  visible, creatorName, onClose, onConfirm,
}: {
  visible: boolean;
  creatorName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState('');

  const handleClose = () => { setReason(''); onClose(); };
  const handleConfirm = () => { onConfirm(reason.trim()); setReason(''); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={modal.overlay}>
        <View style={modal.panel}>
          <View style={modal.panelHandle} />

          <View style={modal.refusalIconWrap}>
            <Text style={modal.refusalIconText}>✕</Text>
          </View>
          <Text style={modal.title}>Refuser la candidature</Text>
          <Text style={modal.refusalSubtitle}>de {creatorName}</Text>

          <Text style={modal.label}>Motif du refus</Text>
          <Text style={modal.hint}>
            Expliquer votre décision aide le créateur à progresser.{'\n'}Ce message lui sera transmis directement.
          </Text>
          <TextInput
            style={modal.textArea}
            value={reason}
            onChangeText={setReason}
            placeholder="Ex : Nous avons déjà sélectionné plusieurs artisans dans votre discipline pour cette édition. N'hésitez pas à repostuler pour nos prochains marchés !"
            placeholderTextColor={colors.text.secondary + '60'}
            multiline
            numberOfLines={4}
            maxLength={300}
            textAlignVertical="top"
          />
          <Text style={modal.charCount}>{reason.length}/300</Text>

          <View style={modal.actions}>
            <TouchableOpacity style={modal.btnCancel} onPress={handleClose}>
              <Text style={modal.btnCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modal.btnRefuse} onPress={handleConfirm}>
              <Text style={modal.btnRefuseText}>
                {reason.trim() ? 'Refuser avec motif' : 'Refuser'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Acceptance + auto-post modal ─────────────────────────────────────────────

function AcceptancePostModal({
  visible, creatorName, eventTitle, eventCity, eventStart, eventEnd,
  onClose, onAccept,
}: {
  visible: boolean;
  creatorName: string;
  eventTitle: string;
  eventCity: string | null;
  eventStart: string;
  eventEnd: string;
  onClose: () => void;
  onAccept: (publishPost: boolean) => void;
}) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const dates = eventStart === eventEnd
    ? `le ${fmt(eventStart)}`
    : `du ${fmt(eventStart)} au ${fmt(eventEnd)}`;
  const cityStr = eventCity ? ` à ${eventCity}` : '';
  const postPreview = `🎉 ${creatorName} sera présent·e au ${eventTitle}${cityStr} — ${dates} !\n\nVenez les découvrir sur place et soutenir leur travail artisanal. ✨`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.panel}>
          <View style={modal.panelHandle} />

          <View style={modal.acceptIconWrap}>
            <Text style={modal.acceptIconText}>🎉</Text>
          </View>
          <Text style={modal.title}>Accepter la candidature ?</Text>
          <Text style={modal.acceptSubtitle}>
            {creatorName} sera notifié·e immédiatement.
          </Text>

          <View style={modal.postPreviewBox}>
            <View style={modal.postPreviewHeader}>
              <Text style={modal.postPreviewIcon}>📢</Text>
              <View>
                <Text style={modal.postPreviewTitle}>Annonce dans le fil</Text>
                <Text style={modal.postPreviewMeta}>Visible par les abonnés de {creatorName}</Text>
              </View>
            </View>
            <View style={modal.postPreviewDivider} />
            <Text style={modal.postPreviewText}>{postPreview}</Text>
          </View>

          <TouchableOpacity
            style={modal.btnAcceptPost}
            onPress={() => onAccept(true)}
            activeOpacity={0.85}
          >
            <Text style={modal.btnAcceptPostText}>✓ Accepter et publier l'annonce</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={modal.btnAcceptSilent}
            onPress={() => onAccept(false)}
            activeOpacity={0.85}
          >
            <Text style={modal.btnAcceptSilentText}>Accepter sans publier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modal.btnCancelCenter} onPress={onClose} activeOpacity={0.7}>
            <Text style={modal.btnCancelCenterText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Application card ─────────────────────────────────────────────────────────

function ApplicationCard({
  item, eventId, organizerId,
  onDecide, onOpenConversation, onConfirmPayment, onReview,
}: {
  item: ApplicationItem;
  eventId: string;
  organizerId: string;
  eventTitle: string;
  onDecide: (id: string, status: ApplicationStatus) => void;
  onOpenConversation: (creatorId: string, creatorName: string) => void;
  onConfirmPayment?: (applicationId: string) => void;
  onReview: (creatorId: string, creatorName: string) => void;
}) {
  const cfg = STATUS_CONFIG[item.status];
  const disciplines = item.creator?.creator_profile?.disciplines ?? [];
  const city = item.creator?.creator_profile?.city;
  const hasReviewed = useHasReviewed(eventId, organizerId);
  const swipeRef = useRef<Swipeable>(null);

  // Swipe actions (only for pending cards)
  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1], extrapolate: 'clamp' });
    return (
      <Animated.View style={[styles.swipeAcceptWrap, { transform: [{ scale }] }]}>
        <Text style={styles.swipeAcceptIcon}>✓</Text>
        <Text style={styles.swipeAcceptLabel}>Accepter</Text>
      </Animated.View>
    );
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1], extrapolate: 'clamp' });
    return (
      <Animated.View style={[styles.swipeRefuseWrap, { transform: [{ scale }] }]}>
        <Text style={styles.swipeRefuseIcon}>✕</Text>
        <Text style={styles.swipeRefuseLabel}>Refuser</Text>
      </Animated.View>
    );
  };

  const cardContent = (
    <View style={styles.card}>
      {item.status === 'pending' && (
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>← Refuser  ·  Accepter →</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.creator?.full_name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.creatorName}>{item.creator?.full_name ?? '—'}</Text>
          {city && <Text style={styles.creatorCity}>📍 {city}</Text>}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {disciplines.length > 0 && (
        <View style={styles.tagRow}>
          {disciplines.slice(0, 4).map(d => (
            <View key={d} style={styles.tag}><Text style={styles.tagText}>{d}</Text></View>
          ))}
          {disciplines.length > 4 && <Text style={styles.tagMore}>+{disciplines.length - 4}</Text>}
        </View>
      )}

      {item.message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText} numberOfLines={3}>{item.message}</Text>
        </View>
      )}

      {item.status === 'refused' && item.refusal_reason && (
        <View style={styles.refusalBox}>
          <View style={styles.refusalHeader}>
            <Text style={styles.refusalHeaderIcon}>✕</Text>
            <Text style={styles.refusalHeaderLabel}>Motif communiqué</Text>
          </View>
          <Text style={styles.refusalText}>{item.refusal_reason}</Text>
        </View>
      )}

      <Text style={styles.date}>
        Candidature le {new Date(item.created_at).toLocaleDateString('fr-FR')}
      </Text>

      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnRefuse} onPress={() => onDecide(item.id, 'refused')}>
            <Text style={styles.btnRefuseText}>✕ Refuser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAccept} onPress={() => onDecide(item.id, 'accepted')}>
            <Text style={styles.btnAcceptText}>✓ Accepter</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'accepted' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnMsg} onPress={() => onOpenConversation(item.creator.id, item.creator.full_name)}>
            <Text style={styles.btnMsgText}>💬 Message</Text>
          </TouchableOpacity>
          {onConfirmPayment && item.stripe_payment_id?.startsWith('pending_') && (
            <TouchableOpacity style={styles.btnConfirmPay} onPress={() => onConfirmPayment(item.id)}>
              <Text style={styles.btnConfirmPayText}>✓ Paiement reçu</Text>
            </TouchableOpacity>
          )}
          {item.stripe_payment_id && !item.stripe_payment_id.startsWith('pending_') && (
            <View style={styles.paidBadge}><Text style={styles.paidBadgeText}>💳 Payé</Text></View>
          )}
          {hasReviewed === false && (
            <TouchableOpacity style={styles.btnReview} onPress={() => onReview(item.creator.id, item.creator.full_name)}>
              <Text style={styles.btnReviewText}>★ Évaluer</Text>
            </TouchableOpacity>
          )}
          {hasReviewed === true && (
            <View style={styles.reviewedBadge}><Text style={styles.reviewedText}>✓ Évalué</Text></View>
          )}
        </View>
      )}

    </View>
  );

  if (item.status !== 'pending') return <View style={{ marginBottom: spacing.md }}>{cardContent}</View>;

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={80}
      rightThreshold={80}
      onSwipeableOpen={(direction) => {
        swipeRef.current?.close();
        setTimeout(() => {
          onDecide(item.id, direction === 'left' ? 'accepted' : 'refused');
        }, 150);
      }}
      containerStyle={{ marginBottom: spacing.md }}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
    >
      {cardContent}
    </Swipeable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EventApplicationsScreen({ navigation, route }: Props) {
  const { eventId, eventTitle } = route.params;
  const { profile } = useAuth();
  const rootNav = useNavigation<any>();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<ApplicationStatus | 'all'>('all');

  // Modal states
  const [refusalTarget, setRefusalTarget]     = useState<ApplicationItem | null>(null);
  const [acceptanceTarget, setAcceptanceTarget] = useState<ApplicationItem | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);

    if (DEMO_MODE) {
      const demo = DEMO_ORGANIZER_APPLICATIONS.filter(a => a.event_id === eventId);
      if (demo.length > 0) {
        setApplications(demo as unknown as ApplicationItem[]);
        setLoading(false);
        return;
      }
    }

    const { data } = await supabase
      .from('applications')
      .select(`
        id, status, message, refusal_reason, created_at,
        creator:profiles!creator_id (
          id, full_name, avatar_url,
          creator_profile:creator_profiles (disciplines, city)
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    setApplications((data as unknown as ApplicationItem[]) ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleDecide = (applicationId: string, newStatus: ApplicationStatus) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;
    if (newStatus === 'refused') {
      setRefusalTarget(app);
    } else {
      setAcceptanceTarget(app);
    }
  };

  const commitRefusal = async (reason: string) => {
    if (!refusalTarget) return;
    setRefusalTarget(null);

    if (!DEMO_MODE) {
      await supabase.from('applications')
        .update({ status: 'refused', refusal_reason: reason || null })
        .eq('id', refusalTarget.id);
      const token = await getPushTokenForUser(refusalTarget.creator.id);
      if (token) sendPushNotification(
        token, 'Candidature non retenue',
        `Votre candidature pour "${eventTitle}" n'a pas été retenue.${reason ? ` Motif : ${reason.slice(0, 80)}` : ''}`,
      );
      fetchApplications();
    } else {
      setApplications(prev => prev.map(a =>
        a.id === refusalTarget.id
          ? { ...a, status: 'refused', refusal_reason: reason || null }
          : a,
      ));
    }
  };

  const commitAcceptance = async (publishPost: boolean) => {
    if (!acceptanceTarget) return;
    const app = acceptanceTarget;
    setAcceptanceTarget(null);

    if (!DEMO_MODE) {
      await supabase.from('applications')
        .update({ status: 'accepted' })
        .eq('id', app.id);

      if (publishPost) {
        const { data: ev } = await supabase.from('events')
          .select('start_date, end_date, city')
          .eq('id', eventId).single();
        const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        const dates = ev?.start_date === ev?.end_date
          ? `le ${fmt(ev?.start_date)}`
          : `du ${fmt(ev?.start_date)} au ${fmt(ev?.end_date)}`;
        const cityStr = ev?.city ? ` à ${ev.city}` : '';
        const content = `🎉 ${app.creator.full_name} sera présent·e au ${eventTitle}${cityStr} — ${dates} !\n\nVenez les découvrir sur place et soutenir leur travail artisanal. ✨`;
        await supabase.from('posts').insert({
          creator_id: app.creator.id,
          content,
          images: [],
          hashtags: ['artisanat', 'marché'],
          post_type: 'guest_appearance',
          event_ref: eventTitle,
          location_name: ev?.city ?? null,
        });
      }

      const token = await getPushTokenForUser(app.creator.id);
      if (token) sendPushNotification(
        token, '🎉 Candidature acceptée !',
        `Votre candidature pour "${eventTitle}" a été acceptée.`,
      );
      fetchApplications();
    } else {
      setApplications(prev => prev.map(a =>
        a.id === app.id ? { ...a, status: 'accepted' } : a,
      ));
      if (publishPost) {
        Alert.alert(
          '📢 Annonce publiée !',
          `Une annonce a été publiée dans le fil de ${app.creator.full_name}. Ses abonnés peuvent maintenant la voir.`,
        );
      }
    }
  };

  const handleConfirmPayment = async (applicationId: string) => {
    Alert.alert(
      'Confirmer le paiement ?',
      'Le créateur sera notifié que son paiement a été validé.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', onPress: async () => {
            await supabase
              .from('applications')
              .update({ stripe_payment_id: `confirmed_${Date.now()}` })
              .eq('id', applicationId);
            fetchApplications();
          },
        },
      ],
    );
  };

  const handleOpenConversation = async (creatorId: string, creatorName: string) => {
    if (!profile?.id) return;
    const convId = await getOrCreateConversation(eventId, creatorId, profile.id);
    if (!convId) { Alert.alert('Erreur', 'Impossible d\'ouvrir la conversation.'); return; }
    rootNav.navigate('Messages', {
      screen: 'Conversation',
      params: { conversationId: convId, eventTitle, otherPartyName: creatorName },
    });
  };

  const handleOpenReview = (creatorId: string, creatorName: string) => {
    navigation.navigate('Review', {
      eventId,
      reviewedId: creatorId,
      reviewedName: creatorName,
      reviewerRole: 'organizer',
    });
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);
  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    refused:  applications.filter(a => a.status === 'refused').length,
  };

  const demoEvent = DEMO_MODE
    ? (require('../../lib/demoData').DEMO_EVENTS as any[]).find((e: any) => e.id === eventId)
    : null;

  return (
    <View style={styles.container}>
      <RefusalModal
        visible={!!refusalTarget}
        creatorName={refusalTarget?.creator.full_name ?? ''}
        onClose={() => setRefusalTarget(null)}
        onConfirm={commitRefusal}
      />
      <AcceptancePostModal
        visible={!!acceptanceTarget}
        creatorName={acceptanceTarget?.creator.full_name ?? ''}
        eventTitle={eventTitle}
        eventCity={demoEvent?.city ?? null}
        eventStart={demoEvent?.start_date ?? new Date().toISOString().slice(0, 10)}
        eventEnd={demoEvent?.end_date ?? new Date().toISOString().slice(0, 10)}
        onClose={() => setAcceptanceTarget(null)}
        onAccept={commitAcceptance}
      />

      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Mes marchés</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={2}>{eventTitle}</Text>
      <Text style={styles.subtitle}>{counts.all} candidature{counts.all !== 1 ? 's' : ''}</Text>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterTab, filter === f.value && styles.filterTabActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterTabText, filter === f.value && styles.filterTabTextActive]}>
              {f.label} ({counts[f.value]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <ApplicationCard
              item={item}
              eventId={eventId}
              organizerId={profile?.id ?? ''}
              eventTitle={eventTitle}
              onDecide={handleDecide}
              onOpenConversation={handleOpenConversation}
              onConfirmPayment={handleConfirmPayment}
              onReview={handleOpenReview}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucune candidature</Text>
              {filter !== 'all' && <Text style={styles.emptySubtitle}>dans cette catégorie</Text>}
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  backText: { color: colors.text.secondary },
  title: { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.text.secondary, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.xs, marginBottom: spacing.lg },
  filterTab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  filterTabTextActive: { color: colors.text.inverse, fontWeight: '700' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },

  // Swipe actions
  swipeAcceptWrap: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.secondary,
    width: 90, borderRadius: radius.lg,
    marginBottom: spacing.md, marginRight: spacing.xs,
  },
  swipeAcceptIcon:  { fontSize: 22, color: '#fff', fontWeight: '700' },
  swipeAcceptLabel: { ...typography.caption, color: '#fff', fontWeight: '700', marginTop: 2 },
  swipeRefuseWrap: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.error,
    width: 90, borderRadius: radius.lg,
    marginBottom: spacing.md, marginLeft: spacing.xs,
  },
  swipeRefuseIcon:  { fontSize: 22, color: '#fff', fontWeight: '700' },
  swipeRefuseLabel: { ...typography.caption, color: '#fff', fontWeight: '700', marginTop: 2 },
  swipeHint: { alignItems: 'center', marginBottom: spacing.xs },
  swipeHintText: { ...typography.caption, color: colors.text.secondary + '70', fontSize: 10, letterSpacing: 0.5 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '25', alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h3, color: colors.primary },
  creatorName: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  creatorCity: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  statusBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  statusText: { ...typography.caption, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  tagText: { ...typography.caption, color: colors.text.secondary },
  tagMore: { ...typography.caption, color: colors.text.secondary, alignSelf: 'center' },
  messageBox: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, borderLeftWidth: 2, borderColor: colors.primary + '60' },
  messageText: { ...typography.caption, color: colors.text.primary, lineHeight: 18 },
  refusalBox: { backgroundColor: colors.error + '08', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.error + '30' },
  refusalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 },
  refusalHeaderIcon: { fontSize: 10, color: colors.error, fontWeight: '700' },
  refusalHeaderLabel: { ...typography.caption, color: colors.error, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  refusalText: { ...typography.caption, color: colors.text.primary, lineHeight: 18 },
  date: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btnRefuse: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.error, alignItems: 'center' },
  btnRefuseText: { ...typography.label, color: colors.error, fontWeight: '600' },
  btnAccept: { flex: 2, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.secondary, alignItems: 'center' },
  btnAcceptText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
  btnMsg: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  btnMsgText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  btnReview: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.secondary, alignItems: 'center' },
  btnReviewText: { ...typography.caption, color: colors.secondary, fontWeight: '600' },
  reviewedBadge: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  reviewedText: { ...typography.caption, color: colors.text.secondary },
  btnConfirmPay: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.success, alignItems: 'center' },
  btnConfirmPayText: { ...typography.caption, color: colors.text.inverse, fontWeight: '700' },
  paidBadge: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.success + '15', borderWidth: 1, borderColor: colors.success + '40' },
  paidBadgeText: { ...typography.caption, color: colors.success, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.text.secondary },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg + 4, borderTopRightRadius: radius.lg + 4,
    padding: spacing.xl, paddingTop: spacing.md,
  },
  panelHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.xl,
  },

  // ── Refusal modal ──
  refusalIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.error + '15',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: spacing.md,
  },
  refusalIconText: { fontSize: 20, color: colors.error, fontWeight: '700' },
  refusalSubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl },

  // ── Acceptance modal ──
  acceptIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.secondary + '15',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: spacing.md,
  },
  acceptIconText: { fontSize: 26 },
  acceptSubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.lg },
  postPreviewBox: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  postPreviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  postPreviewIcon: { fontSize: 22 },
  postPreviewTitle: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  postPreviewMeta: { ...typography.caption, color: colors.text.secondary },
  postPreviewDivider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.sm },
  postPreviewText: { ...typography.body, color: colors.text.primary, lineHeight: 22 },
  btnAcceptPost: {
    backgroundColor: colors.secondary,
    paddingVertical: 14, borderRadius: radius.xl,
    alignItems: 'center', marginBottom: spacing.sm,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  btnAcceptPostText: { ...typography.label, color: colors.text.inverse, fontWeight: '700', fontSize: 15 },
  btnAcceptSilent: {
    paddingVertical: 14, borderRadius: radius.xl,
    alignItems: 'center', marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  btnAcceptSilentText: { ...typography.label, color: colors.text.primary },
  btnCancelCenter: { paddingVertical: spacing.md, alignItems: 'center' },
  btnCancelCenterText: { ...typography.label, color: colors.text.secondary },

  // ── Shared ──
  title: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
  label: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11, marginBottom: spacing.xs, marginTop: spacing.lg },
  hint: { ...typography.caption, color: colors.text.secondary, lineHeight: 18, marginBottom: spacing.sm },
  textArea: {
    backgroundColor: colors.background,
    color: colors.text.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    minHeight: 100,
    fontSize: 14, lineHeight: 20,
  },
  charCount: { ...typography.caption, color: colors.text.secondary, textAlign: 'right', marginTop: 4, marginBottom: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btnCancel: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  btnCancelText: { ...typography.label, color: colors.text.secondary },
  btnRefuse: { flex: 2, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.error, alignItems: 'center' },
  btnRefuseText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },

});
