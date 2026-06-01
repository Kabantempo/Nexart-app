import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { DiscoverStackParams } from '../../navigation/DiscoverStack';
import { useAuth } from '../../stores/auth';
import { useEvent } from '../../hooks/useEvent';
import { useFavoriteEvent } from '../../hooks/useFavorites';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<DiscoverStackParams, 'PublicEventDetail'>;
  route: RouteProp<DiscoverStackParams, 'PublicEventDetail'>;
};

const TYPE_LABEL: Record<string, string> = {
  permanent: 'Marché permanent', seasonal: 'Marché saisonnier',
  popup: 'Pop-up', salon: 'Salon', fair: 'Foire',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

export default function PublicEventDetailScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { profile }  = useAuth();
  const { event, loading } = useEvent(eventId);
  const { isFav, toggle } = useFavoriteEvent(profile?.id, eventId);

  const handleFav = () => {
    if (!profile) {
      Alert.alert('Compte requis', 'Créez un compte visiteur pour sauvegarder des marchés.',
        [{ text: 'Annuler', style: 'cancel' }, { text: "S'inscrire", onPress: () => navigation.getParent()?.navigate('Auth') }]);
      return;
    }
    toggle();
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;
  if (!event)  return <View style={s.centered}><Text style={{ color: colors.error }}>Événement introuvable</Text></View>;

  const org = event.organizer;
  const orgName = org?.organizer_profile?.organization_name ?? org?.full_name ?? '—';

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Retour</Text></TouchableOpacity>
        <TouchableOpacity onPress={handleFav}><Text style={[s.fav, isFav && s.favActive]}>{isFav ? '♥' : '♡'}</Text></TouchableOpacity>
      </View>

      <View style={s.typeBadge}><Text style={s.typeBadgeText}>{TYPE_LABEL[event.event_type] ?? event.event_type}</Text></View>
      <Text style={s.title}>{event.title}</Text>
      <Text style={s.location}>📍 {[event.location, event.city, event.region].filter(Boolean).join(', ')}</Text>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Dates</Text>
        <Text style={s.field}>{fmt(event.start_date)}</Text>
        {event.start_date !== event.end_date && <Text style={s.field}>→ {fmt(event.end_date)}</Text>}
        {event.start_time && <Text style={s.field}>🕐 {event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}</Text>}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Stands</Text>
        <Text style={s.field}>{event.stand_count} stands disponibles</Text>
        {event.stand_price != null && <Text style={s.field}>Tarif : {event.stand_price === 0 ? 'Gratuit' : `${event.stand_price} €`}</Text>}
      </View>

      {event.discipline_tags.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Disciplines</Text>
          <View style={s.tagRow}>
            {event.discipline_tags.map(t => (
              <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>
            ))}
          </View>
        </View>
      )}

      {event.description && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Description</Text>
          <Text style={s.body}>{event.description}</Text>
        </View>
      )}

      <View style={s.section}>
        <Text style={s.sectionTitle}>Organisé par</Text>
        <Text style={s.field}>{orgName}</Text>
      </View>

      <View style={s.infoBanner}>
        <Text style={s.infoBannerText}>
          Vous êtes artisan et souhaitez participer ? Créez un compte créateur pour candidater.
        </Text>
        <TouchableOpacity style={s.infoBtn} onPress={() => navigation.getParent()?.navigate('Auth')}>
          <Text style={s.infoBtnText}>Créer un compte →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  topRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  back:      { color: colors.text.secondary },
  fav:       { fontSize: 28, color: colors.border },
  favActive: { color: colors.error },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary + '20', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3, marginBottom: spacing.sm },
  typeBadgeText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  title:     { ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm },
  location:  { ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl },
  section:   { marginBottom: spacing.xl },
  sectionTitle: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: spacing.xs },
  field:     { ...typography.body, color: colors.text.primary, marginBottom: 4 },
  body:      { ...typography.body, color: colors.text.primary, lineHeight: 22 },
  tagRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag:       { borderWidth: 1, borderColor: colors.primary + '60', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  tagText:   { ...typography.caption, color: colors.primary },
  infoBanner:{ backgroundColor: colors.secondary + '15', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.secondary + '40', marginTop: spacing.xl },
  infoBannerText: { ...typography.body, color: colors.text.primary, marginBottom: spacing.md },
  infoBtn:   { alignSelf: 'flex-start', backgroundColor: colors.secondary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  infoBtnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
