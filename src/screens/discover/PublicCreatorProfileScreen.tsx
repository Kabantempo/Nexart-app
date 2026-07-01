import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, TextInput, ActivityIndicator, FlatList,
  Dimensions, Animated,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { DiscoverStackParams } from '../../navigation/DiscoverStack';
import { useAuth } from '../../stores/auth';
import { usePublicCreatorProfile } from '../../hooks/usePublicCreators';
import { useProfileReviews } from '../../hooks/useReviews';
import { useFavoriteCreator } from '../../hooks/useFavorites';
import { useVisitorInquiry } from '../../hooks/useVisitorInquiry';
import { useFollow, useFollowCounts } from '../../hooks/useFollow';
import { usePosts } from '../../hooks/usePosts';
import PostCard from '../../components/PostCard';
import { PageSettings, DEFAULT_PAGE_SETTINGS } from '../../types';
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

// ─── Music player (floating) ──────────────────────────────────────────────────

function MusicPlayer({ settings }: { settings: PageSettings }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync().catch(() => {}); };
  }, []);

  useEffect(() => {
    if (playing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [playing]);

  const toggle = async () => {
    if (loading) return;
    if (playing) {
      await soundRef.current?.pauseAsync();
      setPlaying(false);
      return;
    }
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setPlaying(true);
      return;
    }
    setLoading(true);
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: settings.music_url! },
        { shouldPlay: true, volume: 0.7 },
      );
      soundRef.current = sound;
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate(status => {
        if ('didJustFinish' in status && status.didJustFinish) setPlaying(false);
      });
    } catch {
      Alert.alert('Audio indisponible', 'Le fichier audio n\'est pas accessible.');
    } finally {
      setLoading(false);
    }
  };

  if (!settings.music_url) return null;

  return (
    <Animated.View style={[mp.container, { borderColor: settings.accent_color + '60', transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity style={[mp.btn, { backgroundColor: settings.accent_color }]} onPress={toggle} activeOpacity={0.85}>
        {loading
          ? <ActivityIndicator size="small" color="#fff" />
          : <Ionicons name={playing ? 'pause' : 'play'} size={16} color="#fff" />}
      </TouchableOpacity>
      {settings.music_label && (
        <Text style={[mp.label, { color: settings.accent_color }]} numberOfLines={1}>{settings.music_label}</Text>
      )}
    </Animated.View>
  );
}

const mp = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 90, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface + 'EE',
    borderRadius: radius.full, borderWidth: 1,
    paddingRight: 10, paddingLeft: 4, paddingVertical: 4,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
    maxWidth: 220,
  },
  btn:   { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { ...typography.caption, fontSize: 11, fontWeight: '600', flexShrink: 1 },
});

// ─── Contact section ──────────────────────────────────────────────────────────

function ContactSection({ visitorId, creatorId }: { visitorId: string; creatorId: string }) {
  const { inquiry, loading, saving, send, edit } = useVisitorInquiry(visitorId, creatorId);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />;

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
        <View style={c.row}>
          <TouchableOpacity style={c.cancelBtn} onPress={() => setEditing(false)}><Text style={c.cancelText}>Annuler</Text></TouchableOpacity>
          <TouchableOpacity style={[c.sendBtn, saving && { opacity: 0.6 }]} onPress={handleEdit} disabled={saving}><Text style={c.sendText}>{saving ? 'Envoi…' : 'Modifier'}</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

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

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PublicCreatorProfileScreen({ navigation, route }: Props) {
  const { creatorId } = route.params;
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const { creator, upcomingEvents, loading } = usePublicCreatorProfile(creatorId);
  const { average, count, isTrusted } = useProfileReviews(creatorId);
  const { isFav, toggle } = useFavoriteCreator(profile?.id, creatorId);
  const { isFollowing, toggle: toggleFollow, followers } = useFollow(profile?.id, creatorId);
  const { posts } = usePosts({ creatorId, limit: 6 });

  const [showContact, setShowContact] = useState(false);

  const settings: PageSettings = { ...DEFAULT_PAGE_SETTINGS, ...(creator?.page_settings ?? {}) };

  const bioFont = settings.bio_font === 'serif' ? 'serif'
    : settings.bio_font === 'mono' ? 'monospace'
    : undefined;

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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[s.container, { backgroundColor: settings.bg_color }]}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 100 }]}
      >
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={settings.bio_color} />
          <Text style={[s.backText, { color: settings.bio_color + 'AA' }]}>Retour</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={s.header}>
          <View style={s.avatarWrap}>
            {creator.avatar_url
              ? <Image source={{ uri: creator.avatar_url }} style={s.avatarImg} />
              : <View style={[s.avatar, { backgroundColor: settings.accent_color + '25' }]}>
                  <Text style={[s.avatarText, { color: settings.accent_color }]}>{creator.full_name[0]?.toUpperCase()}</Text>
                </View>
            }
          </View>
          <View style={{ flex: 1 }}>
            <View style={s.nameRow}>
              <Text style={[s.name, { color: settings.bio_color }]}>{creator.full_name}</Text>
              {isTrusted && (
                <View style={[s.trustBadge, { backgroundColor: settings.accent_color + '20', borderColor: settings.accent_color + '50' }]}>
                  <Text style={[s.trustText, { color: settings.accent_color }]}>✓ Confiance</Text>
                </View>
              )}
            </View>
            {creator.city && <Text style={[s.city, { color: settings.bio_color + '88' }]}>📍 {creator.city}{creator.region ? `, ${creator.region}` : ''}</Text>}
            {average !== null && <Text style={[s.rating, { color: settings.accent_color }]}>{'★'.repeat(Math.round(average))} {average}/5 · {count} avis</Text>}
            <View style={s.badges}>
              {creator.siret_verified    && <View style={[s.badge, { backgroundColor: colors.secondary + '15' }]}><Text style={[s.badgeText, { color: colors.secondary }]}>SIRET ✓</Text></View>}
              {creator.insurance_verified && <View style={[s.badge, { backgroundColor: colors.secondary + '15' }]}><Text style={[s.badgeText, { color: colors.secondary }]}>Assuré ✓</Text></View>}
            </View>
          </View>
          <View style={{ gap: 6, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={[s.followBtn, { borderColor: settings.accent_color }, isFollowing && { backgroundColor: settings.accent_color }]}
              onPress={() => profile ? toggleFollow() : Alert.alert('Compte requis', 'Créez un compte pour suivre des créateurs.')}
            >
              <Text style={[s.followBtnText, { color: isFollowing ? '#fff' : settings.accent_color }]}>
                {isFollowing ? '✓ Suivi' : '+ Suivre'}
              </Text>
            </TouchableOpacity>
            <Text style={[s.followersCount, { color: settings.bio_color + '66' }]}>{followers} abonnés</Text>
            <TouchableOpacity onPress={profile ? toggle : () => Alert.alert('Compte requis')}>
              <Text style={[s.favBtn, isFav && { color: colors.error }]}>{isFav ? '♥' : '♡'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tagline */}
        {settings.tagline && (
          <Text style={[s.tagline, { color: settings.accent_color, fontFamily: bioFont }]}>{settings.tagline}</Text>
        )}

        {/* Bio */}
        {creator.bio && (
          <Text style={[s.bio, { color: settings.bio_color + 'CC', fontFamily: bioFont }]}>{creator.bio}</Text>
        )}

        {/* Disciplines */}
        <View style={s.tagRow}>
          {creator.disciplines.map(d => (
            <View key={d} style={[s.tag, { backgroundColor: settings.accent_color + '20', borderColor: settings.accent_color + '40', borderWidth: 1 }]}>
              <Text style={[s.tagText, { color: settings.accent_color }]}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Links */}
        {(creator.instagram || creator.website) && (
          <View style={s.links}>
            {creator.instagram && <Text style={[s.link, { color: settings.accent_color }]}>@{creator.instagram}</Text>}
            {creator.website   && <Text style={[s.link, { color: settings.accent_color }]}>{creator.website}</Text>}
          </View>
        )}

        {/* Portfolio */}
        {creator.portfolio_images.length > 0 && (
          <>
            <Text style={[s.section, { color: settings.bio_color + '66', borderBottomColor: settings.accent_color + '30' }]}>Portfolio</Text>
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
            <Text style={[s.section, { color: settings.bio_color + '66', borderBottomColor: settings.accent_color + '30' }]}>Prochains marchés</Text>
            {upcomingEvents.map((e: any) => (
              <TouchableOpacity key={e.id} style={[s.eventRow, { backgroundColor: settings.accent_color + '10', borderColor: settings.accent_color + '25' }]} onPress={() => navigation.navigate('PublicEventDetail', { eventId: e.id })}>
                <Text style={[s.eventDate, { color: settings.accent_color }]}>{formatDate(e.start_date)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.eventTitle, { color: settings.bio_color }]} numberOfLines={1}>{e.title}</Text>
                  <Text style={[s.eventCity, { color: settings.bio_color + '77' }]}>{e.city}</Text>
                </View>
                <Text style={{ color: settings.bio_color + '77' }}>→</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Posts récents */}
        {posts.length > 0 && (
          <>
            <Text style={[s.section, { color: settings.bio_color + '66', borderBottomColor: settings.accent_color + '30' }]}>Posts récents</Text>
            {posts.slice(0, 3).map(post => <PostCard key={post.id} post={post} showCreator={false} />)}
          </>
        )}

        {/* Contact */}
        <Text style={[s.section, { color: settings.bio_color + '66', borderBottomColor: settings.accent_color + '30' }]}>Contacter</Text>
        {!showContact
          ? <TouchableOpacity style={[s.contactBtn, { backgroundColor: settings.accent_color }]} onPress={handleContact}>
              <Text style={s.contactBtnText}>✉ Envoyer un message</Text>
            </TouchableOpacity>
          : <ContactSection visitorId={profile!.id} creatorId={creatorId} />
        }
      </ScrollView>

      {/* Floating music player */}
      {settings.music_url && <MusicPlayer settings={settings} />}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: spacing.xl, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  back:      { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  backText:  { ...typography.caption },
  header:    { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg, alignItems: 'flex-start' },
  avatarWrap:{ position: 'relative' },
  avatar:    { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 72, height: 72, borderRadius: 36 },
  avatarText:{ ...typography.h1 },
  nameRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  name:      { ...typography.h3, fontWeight: '700' },
  trustBadge:{ borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1 },
  trustText: { ...typography.caption, fontWeight: '700', fontSize: 10 },
  city:      { ...typography.caption, marginTop: 2 },
  rating:    { ...typography.caption, marginTop: 2 },
  badges:    { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  badge:     { borderRadius: radius.sm, paddingHorizontal: spacing.xs, paddingVertical: 2 },
  badgeText: { ...typography.caption, fontSize: 10, fontWeight: '600' },
  followBtn: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  followBtnText: { ...typography.caption, fontWeight: '700' },
  followersCount: { ...typography.caption },
  favBtn:    { fontSize: 24, color: '#555' },
  tagline:   { ...typography.label, fontStyle: 'italic', marginBottom: spacing.sm, textAlign: 'center' },
  bio:       { ...typography.body, lineHeight: 22, marginBottom: spacing.md },
  tagRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  tag:       { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  tagText:   { ...typography.caption, fontWeight: '600' },
  links:     { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl },
  link:      { ...typography.caption },
  section:   { ...typography.label, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md, marginTop: spacing.xl, borderBottomWidth: 1, paddingBottom: spacing.xs },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  gridImg:   { width: IMG, height: IMG, borderRadius: radius.sm, backgroundColor: colors.surface },
  eventRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1 },
  eventDate: { ...typography.label, width: 50 },
  eventTitle:{ ...typography.label },
  eventCity: { ...typography.caption },
  contactBtn:{ borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  contactBtnText: { ...typography.label, color: '#fff', fontWeight: '700', fontSize: 15 },
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
