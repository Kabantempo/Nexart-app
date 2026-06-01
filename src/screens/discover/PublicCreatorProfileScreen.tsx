import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, TextInput, ActivityIndicator, FlatList, Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { DiscoverStackParams } from '../../navigation/DiscoverStack';
import { useAuth } from '../../stores/auth';
import { usePublicCreatorProfile } from '../../hooks/usePublicCreators';
import { useProfileReviews } from '../../hooks/useReviews';
import { useFavoriteCreator } from '../../hooks/useFavorites';
import { useVisitorInquiry } from '../../hooks/useVisitorInquiry';
import { useFollow, useFollowCounts } from '../../hooks/useFollow';
import { usePosts } from '../../hooks/usePosts';
import PostCard from '../../components/PostCard';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<DiscoverStackParams, 'PublicCreatorProfile'>;
  route: RouteProp<DiscoverStackParams, 'PublicCreatorProfile'>;
};

const W = Dimensions.get('window').width;
const IMG = (W - 2 * spacing.xl - 2 * spacing.xs) / 3;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function ContactSection({ visitorId, creatorId }: { visitorId: string; creatorId: string }) {
  const { inquiry, loading, saving, send, edit } = useVisitorInquiry(visitorId, creatorId);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />;

  // Creator has replied → show full exchange
  if (inquiry?.reply) {
    return (
      <View style={c.box}>
        <Text style={c.label}>Votre message</Text>
        <Text style={c.msgText}>{inquiry.message}</Text>
        <View style={c.divider} />
        <Text style={c.label}>Réponse du créateur</Text>
        <Text style={c.replyText}>{inquiry.reply}</Text>
      </View>
    );
  }

  // Message sent, no reply yet
  if (inquiry && !editing) {
    return (
      <View style={c.box}>
        <Text style={c.label}>Message envoyé · En attente de réponse</Text>
        <Text style={c.msgText}>{inquiry.message}</Text>
        <TouchableOpacity style={c.editBtn} onPress={() => { setEditing(true); setText(inquiry.message); }}>
          <Text style={c.editBtnText}>Modifier</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Edit mode
  if (editing) {
    const handleEdit = async () => {
      const { error } = await edit(text.trim());
      if (error) Alert.alert('Erreur', error);
      else setEditing(false);
    };
    return (
      <View style={c.box}>
        <Text style={c.label}>Modifier votre message</Text>
        <TextInput style={c.input} value={text} onChangeText={setText} multiline maxLength={500} placeholder="Votre message…" placeholderTextColor={colors.text.secondary} />
        <Text style={c.chars}>{text.length}/500</Text>
        <View style={c.row}><TouchableOpacity style={c.cancelBtn} onPress={() => setEditing(false)}><Text style={c.cancelText}>Annuler</Text></TouchableOpacity>
          <TouchableOpacity style={[c.sendBtn, saving && { opacity: 0.6 }]} onPress={handleEdit} disabled={saving}><Text style={c.sendText}>{saving ? 'Envoi…' : 'Modifier'}</Text></TouchableOpacity></View>
      </View>
    );
  }

  // No message yet → form
  const handleSend = async () => {
    if (!text.trim()) return;
    const { error } = await send(text.trim());
    if (error) Alert.alert('Erreur', error);
    else setText('');
  };

  return (
    <View style={c.box}>
      <Text style={c.label}>Envoyer un message</Text>
      <Text style={c.hint}>Vous pouvez modifier votre message jusqu'à ce que le créateur réponde.</Text>
      <TextInput style={c.input} value={text} onChangeText={setText} multiline maxLength={500} placeholder="Bonjour, je suis intéressé par votre travail…" placeholderTextColor={colors.text.secondary} />
      <Text style={c.chars}>{text.length}/500</Text>
      <TouchableOpacity style={[c.sendBtn, (!text.trim() || saving) && { opacity: 0.5 }]} onPress={handleSend} disabled={!text.trim() || saving}>
        <Text style={c.sendText}>{saving ? 'Envoi…' : 'Envoyer'}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PublicCreatorProfileScreen({ navigation, route }: Props) {
  const { creatorId } = route.params;
  const { profile } = useAuth();
  const { creator, upcomingEvents, loading } = usePublicCreatorProfile(creatorId);
  const { average, count, isTrusted } = useProfileReviews(creatorId);
  const { isFav, toggle } = useFavoriteCreator(profile?.id, creatorId);
  const { isFollowing, toggle: toggleFollow, followers } = useFollow(profile?.id, creatorId);
  const { posts } = usePosts({ creatorId, limit: 6 });

  const [showContact, setShowContact] = useState(false);

  const handleContact = () => {
    if (!profile) {
      Alert.alert(
        'Compte requis',
        'Créez un compte visiteur pour contacter les artisans.',
        [{ text: 'Annuler', style: 'cancel' }, { text: 'S\'inscrire', onPress: () => navigation.getParent()?.navigate('Auth') }],
      );
      return;
    }
    setShowContact(true);
  };

  if (loading) {
    return <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  if (!creator) {
    return <View style={s.centered}><Text style={{ color: colors.error }}>Créateur introuvable</Text></View>;
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
        <Text style={s.backText}>← Retour</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={s.header}>
        <View style={s.avatarWrap}>
          {creator.avatar_url
            ? <Image source={{ uri: creator.avatar_url }} style={s.avatarImg} />
            : <View style={s.avatar}><Text style={s.avatarText}>{creator.full_name[0]?.toUpperCase()}</Text></View>
          }
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.nameRow}>
            <Text style={s.name}>{creator.full_name}</Text>
            {isTrusted && <View style={s.trustBadge}><Text style={s.trustText}>✓ Confiance</Text></View>}
          </View>
          {creator.city && <Text style={s.city}>📍 {creator.city}{creator.region ? `, ${creator.region}` : ''}</Text>}
          {average !== null && <Text style={s.rating}>{'★'.repeat(Math.round(average))} {average}/5 · {count} avis</Text>}
          <View style={s.badges}>
            {creator.siret_verified    && <View style={s.badge}><Text style={s.badgeText}>SIRET ✓</Text></View>}
            {creator.insurance_verified && <View style={s.badge}><Text style={s.badgeText}>Assuré ✓</Text></View>}
          </View>
        </View>
        <View style={{ gap: 6, alignItems: 'flex-end' }}>
          <TouchableOpacity
            style={[s.followBtn, isFollowing && s.followBtnActive]}
            onPress={() => profile ? toggleFollow() : Alert.alert('Compte requis', 'Créez un compte pour suivre des créateurs.')}
          >
            <Text style={[s.followBtnText, isFollowing && s.followBtnTextActive]}>
              {isFollowing ? '✓ Suivi' : '+ Suivre'}
            </Text>
          </TouchableOpacity>
          <Text style={s.followersCount}>{followers} abonnés</Text>
          <TouchableOpacity onPress={profile ? toggle : () => Alert.alert('Compte requis')}>
            <Text style={[s.favBtn, isFav && s.favBtnActive]}>{isFav ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio */}
      {creator.bio && <Text style={s.bio}>{creator.bio}</Text>}

      {/* Disciplines */}
      <View style={s.tagRow}>
        {creator.disciplines.map(d => (
          <View key={d} style={s.tag}><Text style={s.tagText}>{d}</Text></View>
        ))}
      </View>

      {/* Links */}
      {(creator.instagram || creator.website) && (
        <View style={s.links}>
          {creator.instagram && <Text style={s.link}>@{creator.instagram}</Text>}
          {creator.website   && <Text style={s.link}>{creator.website}</Text>}
        </View>
      )}

      {/* Portfolio */}
      {creator.portfolio_images.length > 0 && (
        <>
          <Text style={s.section}>Portfolio</Text>
          <View style={s.grid}>
            {creator.portfolio_images.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={s.gridImg} />
            ))}
          </View>
        </>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <>
          <Text style={s.section}>Prochains marchés</Text>
          {upcomingEvents.map((e: any) => (
            <TouchableOpacity key={e.id} style={s.eventRow} onPress={() => navigation.navigate('PublicEventDetail', { eventId: e.id })}>
              <Text style={s.eventDate}>{formatDate(e.start_date)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.eventTitle} numberOfLines={1}>{e.title}</Text>
                <Text style={s.eventCity}>{e.city}</Text>
              </View>
              <Text style={s.eventArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Posts récents */}
      {posts.length > 0 && (
        <>
          <Text style={s.section}>Posts récents</Text>
          {posts.slice(0, 3).map(post => <PostCard key={post.id} post={post} showCreator={false} />)}
        </>
      )}

      {/* Contact */}
      <Text style={s.section}>Contacter</Text>
      {!showContact
        ? <TouchableOpacity style={s.contactBtn} onPress={handleContact}>
            <Text style={s.contactBtnText}>✉ Envoyer un message</Text>
          </TouchableOpacity>
        : <ContactSection visitorId={profile!.id} creatorId={creatorId} />
      }

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { padding: spacing.xl, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  back:      { marginBottom: spacing.lg },
  backText:  { color: colors.text.secondary },
  header:    { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg, alignItems: 'flex-start' },
  avatarWrap:{ position: 'relative' },
  avatar:    { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary + '25', alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 72, height: 72, borderRadius: 36 },
  avatarText:{ ...typography.h1, color: colors.primary },
  nameRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  name:      { ...typography.h3, color: colors.text.primary, fontWeight: '700' },
  trustBadge:{ backgroundColor: colors.secondary + '20', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: colors.secondary + '50' },
  trustText: { ...typography.caption, color: colors.secondary, fontWeight: '700', fontSize: 10 },
  city:      { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  rating:    { ...typography.caption, color: colors.primary, marginTop: 2 },
  badges:    { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  badge:     { backgroundColor: colors.secondary + '15', borderRadius: radius.sm, paddingHorizontal: spacing.xs, paddingVertical: 2 },
  badgeText: { ...typography.caption, color: colors.secondary, fontSize: 10, fontWeight: '600' },
  followBtn: { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  followBtnActive: { backgroundColor: colors.primary },
  followBtnText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  followBtnTextActive: { color: colors.text.inverse },
  followersCount: { ...typography.caption, color: colors.text.secondary },
  favBtn:    { fontSize: 24, color: colors.border },
  favBtnActive: { color: colors.error },
  bio:       { ...typography.body, color: colors.text.secondary, lineHeight: 22, marginBottom: spacing.md },
  tagRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  tag:       { backgroundColor: colors.primary + '15', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  tagText:   { ...typography.caption, color: colors.primary, fontWeight: '600' },
  links:     { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl },
  link:      { ...typography.caption, color: colors.primary },
  section:   { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md, marginTop: spacing.xl, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: spacing.xs },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  gridImg:   { width: IMG, height: IMG, borderRadius: radius.sm, backgroundColor: colors.surface },
  eventRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  eventDate: { ...typography.label, color: colors.primary, width: 50 },
  eventTitle:{ ...typography.label, color: colors.text.primary },
  eventCity: { ...typography.caption, color: colors.text.secondary },
  eventArrow:{ color: colors.text.secondary },
  contactBtn:{ backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  contactBtnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700', fontSize: 15 },
});

const c = StyleSheet.create({
  box:      { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  label:    { ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.sm },
  hint:     { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm, lineHeight: 16 },
  msgText:  { ...typography.body, color: colors.text.primary },
  replyText:{ ...typography.body, color: colors.secondary },
  divider:  { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  input:    { backgroundColor: colors.background, color: colors.text.primary, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 90, textAlignVertical: 'top', marginBottom: 4 },
  chars:    { ...typography.caption, color: colors.text.secondary, textAlign: 'right', marginBottom: spacing.md },
  row:      { flexDirection: 'row', gap: spacing.sm },
  cancelBtn:{ flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelText:{ ...typography.label, color: colors.text.secondary },
  sendBtn:  { flex: 2, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  sendText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
  editBtn:  { marginTop: spacing.sm, alignSelf: 'flex-end' },
  editBtnText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});
