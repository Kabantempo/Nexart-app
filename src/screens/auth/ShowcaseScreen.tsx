import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LogoMark from '../../components/ui/LogoMark';
import { useThemeColors } from '../../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

/** Page vitrine : la page d'accueil du site, avant d'avoir un compte. */

const STEPS = [
  { n: '01', title: 'Créez votre profil', desc: 'Photos, disciplines, tarifs, en moins de 10 minutes.' },
  { n: '02', title: 'Explorez les événements', desc: 'Filtrez par type, date, ville ou nombre de stands.' },
  { n: '03', title: 'Postulez et exposez', desc: 'Recevez une réponse et préparez votre stand.' },
];

type Face = {
  key: string; label: string; tagline: string; desc: string; cta: string; action: 'register' | 'discover';
  features: { icon: keyof typeof Ionicons.glyphMap; label: string; desc: string }[];
};

const FACES: Face[] = [
  {
    key: 'creators', label: 'Créateurs', tagline: 'Exposez sans galère.', cta: 'Créer mon profil', action: 'register',
    desc: 'Un profil, toutes les opportunités. Candidatez en 2 minutes, suivez vos réponses en temps réel.',
    features: [
      { icon: 'flash-outline', label: 'Candidature en 2 min', desc: 'Aucun e-mail, aucun formulaire à rallonge.' },
      { icon: 'locate-outline', label: 'Matching intelligent', desc: 'Les événements qui vous correspondent remontent en priorité.' },
      { icon: 'notifications-outline', label: 'Suivi en temps réel', desc: 'Notifications et statut de candidature instantanés.' },
      { icon: 'ribbon-outline', label: 'Profil vérifiable', desc: 'SIRET, portfolio, avis : tout en un seul endroit.' },
    ],
  },
  {
    key: 'organizers', label: 'Organisateurs', tagline: 'Remplissez vos stands.', cta: 'Publier un événement', action: 'register',
    desc: 'Publiez votre événement, recevez des candidatures qualifiées et gérez tout depuis votre tableau de bord.',
    features: [
      { icon: 'calendar-outline', label: 'Publication en 5 min', desc: 'Dates, stands, critères : votre événement est en ligne.' },
      { icon: 'people-outline', label: 'Candidatures triées', desc: 'Filtrez par discipline, ville, profil vérifié.' },
      { icon: 'shield-checkmark-outline', label: 'Événement validé', desc: 'Notre équipe vérifie chaque publication.' },
      { icon: 'flash-outline', label: 'Gestion centralisée', desc: 'Acceptez, refusez, communiquez depuis un seul endroit.' },
    ],
  },
  {
    key: 'visitors', label: 'Visiteurs', tagline: 'Découvrez. Réservez. Soutenez.', cta: 'Explorer les événements', action: 'discover',
    desc: 'Trouvez les marchés et événements artisanaux près de chez vous et explorez les créateurs.',
    features: [
      { icon: 'location-outline', label: 'Événements près de vous', desc: 'Géolocalisation et filtres par type, date, distance.' },
      { icon: 'people-outline', label: 'Portfolios créateurs', desc: 'Parcourez les artisans avant même le jour J.' },
      { icon: 'checkmark-circle-outline', label: 'Réservation de place', desc: 'Réservez votre entrée en quelques secondes.' },
      { icon: 'notifications-outline', label: 'Alertes personnalisées', desc: "Soyez notifié dès qu'un événement vous correspond." },
    ],
  },
];

export default function ShowcaseScreen({ navigation }: any) {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const go = (action: Face['action']) =>
    action === 'register' ? navigation.navigate('Register') : navigation.getParent()?.navigate('Discover');

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button" accessibilityLabel="Retour" style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <LogoMark size={28} />
        <Text style={s.brand}>Nexart</Text>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        <View style={s.badge}><Text style={s.badgeText}>La plateforme des artisans</Text></View>
        <Text style={s.hero}>Exposez vos <Text style={s.heroAccent}>créations</Text></Text>
        <Text style={s.heroSub}>dans les meilleurs événements</Text>
        <Text style={s.lead}>
          Nexart connecte créateurs et organisateurs d'événements artisanaux : marchés, pop-ups, salons, festivals.
        </Text>
        <TouchableOpacity style={s.primary} onPress={() => navigation.navigate('Register')} accessibilityRole="button">
          <Text style={s.primaryText}>Créer un compte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondary} onPress={() => navigation.navigate('Login')} accessibilityRole="button">
          <Text style={s.secondaryText}>Se connecter</Text>
        </TouchableOpacity>

        <Text style={s.eyebrow}>En 3 étapes</Text>
        <Text style={s.h2}>Simple comme bonjour</Text>
        {STEPS.map(st => (
          <View key={st.n} style={s.step}>
            <View style={s.stepNum}><Text style={s.stepNumText}>{st.n}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.stepTitle}>{st.title}</Text>
              <Text style={s.muted}>{st.desc}</Text>
            </View>
          </View>
        ))}

        <Text style={s.eyebrow}>Créateurs · Organisateurs · Visiteurs</Text>
        <Text style={s.h2}>Pour qui est Nexart ?</Text>
        {FACES.map(f => (
          <View key={f.key} style={s.face}>
            <Text style={s.faceLabel}>{f.label}</Text>
            <Text style={s.faceTagline}>{f.tagline}</Text>
            <Text style={s.muted}>{f.desc}</Text>
            {f.features.map(ft => (
              <View key={ft.label} style={s.feature}>
                <Ionicons name={ft.icon} size={18} color={colors.primary} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.featureLabel}>{ft.label}</Text>
                  <Text style={s.muted}>{ft.desc}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={s.faceCta} onPress={() => go(f.action)} accessibilityRole="button">
              <Text style={s.faceCtaText}>{f.cta}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={s.eyebrow}>Rejoignez la communauté</Text>
        <TouchableOpacity style={s.primary} onPress={() => navigation.navigate('Register')} accessibilityRole="button">
          <Text style={s.primaryText}>Commencer gratuitement</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  back: { width: 32, minHeight: 44, justifyContent: 'center' },
  brand: { ...typography.h3, color: colors.text.primary },
  body: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 6, marginBottom: spacing.lg },
  badgeText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  hero: { fontSize: 40, fontWeight: '900', lineHeight: 44, letterSpacing: -1.2, color: colors.text.primary },
  heroAccent: { color: colors.primary },
  heroSub: { ...typography.h3, color: colors.text.secondary, marginTop: spacing.xs, marginBottom: spacing.md },
  lead: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl },
  primary: { backgroundColor: colors.primary, borderRadius: radius.md, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  primaryText: { ...typography.label, color: '#fff', fontWeight: '700' },
  secondary: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  eyebrow: { ...typography.caption, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xxl, marginBottom: spacing.sm },
  h2: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.lg },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  stepNum: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { ...typography.h3, color: colors.primary, fontWeight: '900' },
  stepTitle: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  muted: { ...typography.body, color: colors.text.secondary },
  face: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  faceLabel: { ...typography.caption, color: colors.primary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  faceTagline: { ...typography.h2, color: colors.text.primary },
  feature: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  featureLabel: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  faceCta: { marginTop: spacing.md, borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  faceCtaText: { ...typography.label, color: colors.primary, fontWeight: '700' },
});
