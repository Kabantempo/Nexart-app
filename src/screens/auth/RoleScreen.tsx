import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../stores/auth';
import { UserRole } from '../../types';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';
import { useThemeColors } from '../../stores/theme';

/** Parcours d'accueil, comme sur le site : rôle, identité, puis questions propres au rôle. */

const DRAFT_KEY = 'nexart.onboarding.draft';

// Mêmes disciplines que le parcours d'accueil du site.
const DISCIPLINES = [
  'Tatouage', 'Céramique', 'Gravure', 'Joaillerie', 'Bijoux', 'Illustration',
  'Textile', 'Maroquinerie', 'Sculpture', 'Photographie', 'Peinture', 'Poterie',
  'Broderie', 'Lutherie', 'Verrerie', 'Reliure', 'Cosmétique naturelle', 'Savonnerie',
  'Coutellerie', 'Bougies', 'Macramé', 'Origami', 'Calligraphie', 'Sérigraphie',
  'Dessin', 'Brocante', 'Musique', 'Prêt-à-porter', 'Décoration', 'Littérature',
  'Pop culture', 'Cinéma', 'Cabinet de curiosités', 'Restauration', 'Costumes',
];
const ORG_EVENT_TYPES = ['Marché artisanal', 'Pop-up', 'Salon', 'Festival', 'Autre'];
const EVENTS_PER_YEAR = ['1', '2-3', '4+'];
const CAPACITIES = [{ label: '< 20', value: '< 20' }, { label: '20 – 50', value: '20-50' }, { label: '50 – 100', value: '50-100' }, { label: '100+', value: '100+' }];

const ROLES: { value: UserRole; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'creator', label: 'Créateur', desc: 'Je veux participer à des marchés et vendre mes créations.', icon: 'brush-outline' },
  { value: 'organizer', label: 'Organisateur', desc: "J'organise des marchés et je cherche des exposants.", icon: 'business-outline' },
  { value: 'visitor', label: 'Visiteur', desc: 'Je découvre les créateurs et les événements près de chez moi.', icon: 'eye-outline' },
];

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);

export default function RoleScreen() {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { profile, refetchProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgEventTypes, setOrgEventTypes] = useState<string[]>([]);
  const [eventsPerYear, setEventsPerYear] = useState('');
  const [capacity, setCapacity] = useState('');
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  const totalSteps = role === 'creator' ? 3 : role === 'organizer' ? 4 : 2;

  // Brouillon : on reprend où l'on s'était arrêté, comme sur le site.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          if (typeof d.step === 'number') setStep(d.step);
          if (d.role) setRole(d.role);
          if (d.fullName) setFullName(d.fullName);
          if (d.bio) setBio(d.bio);
          if (Array.isArray(d.disciplines)) setDisciplines(d.disciplines);
          if (d.city) setCity(d.city);
          if (d.orgName) setOrgName(d.orgName);
          if (Array.isArray(d.orgEventTypes)) setOrgEventTypes(d.orgEventTypes);
          if (d.eventsPerYear) setEventsPerYear(d.eventsPerYear);
          if (d.capacity) setCapacity(d.capacity);
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          const meta = profile?.full_name || user?.user_metadata?.full_name;
          if (typeof meta === 'string') setFullName(meta);
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({ step, role, fullName, bio, disciplines, city, orgName, orgEventTypes, eventsPerYear, capacity })).catch(() => {});
  }, [ready, step, role, fullName, bio, disciplines, city, orgName, orgEventTypes, eventsPerYear, capacity]);

  const canNext =
    step === 0 ? role !== null
    : step === 1 ? fullName.trim().length >= 2
    : step === 2 && role === 'organizer' ? orgName.trim().length >= 2
    : true;

  const finish = async () => {
    if (!role) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session expirée. Reconnectez-vous.');

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName.trim(),
        bio: bio.trim() || null,
        role,
        is_creator: role === 'creator',
        is_organizer: role === 'organizer',
        onboarding_done: true,
      });
      if (error) throw error;

      if (role === 'creator' && (disciplines.length || city.trim())) {
        const { error: e } = await supabase.from('creator_profiles')
          .upsert({ user_id: user.id, disciplines, city: city.trim() || null }, { onConflict: 'user_id' });
        if (e) throw e;
      }
      if (role === 'organizer' && orgName.trim()) {
        const { data: existing } = await supabase.from('organizer_profiles').select('user_id').eq('user_id', user.id).maybeSingle();
        const payload = {
          organization_name: orgName.trim(),
          event_types: orgEventTypes,
          events_per_year: eventsPerYear || null,
          typical_capacity: capacity || null,
        };
        const { error: e } = existing
          ? await supabase.from('organizer_profiles').update(payload).eq('user_id', user.id)
          : await supabase.from('organizer_profiles').insert({ user_id: user.id, ...payload });
        if (e) throw e;
      }

      await AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
      await refetchProfile();
    } catch (e) {
      Alert.alert('Enregistrement impossible', e instanceof Error ? e.message : 'Réessayez dans un instant.');
    }
    setSaving(false);
  };

  const next = () => (step < totalSteps - 1 ? setStep(step + 1) : finish());

  const chip = (label: string, active: boolean, onPress: () => void) => (
    <TouchableOpacity key={label} style={[s.chip, active && s.chipActive]} onPress={onPress}
      accessibilityRole="button" accessibilityState={{ selected: active }}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const input = (value: string, set: (v: string) => void, placeholder: string, multiline = false) => (
    <TextInput style={[s.input, multiline && { minHeight: 90, textAlignVertical: 'top' }]} value={value} onChangeText={set}
      placeholder={placeholder} placeholderTextColor={colors.text.secondary} multiline={multiline} />
  );

  if (!ready) return <View style={s.container}><ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} /></View>;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.progress}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View key={i} style={[s.bar, i <= step && s.barActive]} />
        ))}
      </View>
      <Text style={s.stepLabel}>Étape {step + 1} sur {totalSteps}</Text>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {step === 0 ? (
          <>
            <Text style={s.title}>Je suis…</Text>
            <Text style={s.subtitle}>Choisissez votre profil pour accéder aux bonnes fonctionnalités.</Text>
            {ROLES.map(r => (
              <TouchableOpacity key={r.value} style={[s.roleCard, role === r.value && s.roleCardActive]} onPress={() => setRole(r.value)}
                accessibilityRole="radio" accessibilityState={{ selected: role === r.value }}>
                <Ionicons name={r.icon} size={30} color={role === r.value ? colors.primary : colors.text.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={s.roleTitle}>{r.label}</Text>
                  <Text style={s.roleDesc}>{r.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Text style={s.title}>Faisons connaissance</Text>
            <Text style={s.subtitle}>Comment souhaitez-vous apparaître sur Nexart ?</Text>
            <Text style={s.label}>Nom complet</Text>
            {input(fullName, setFullName, 'Prénom Nom')}
            <Text style={s.label}>Présentation (optionnel)</Text>
            {input(bio, setBio, 'Quelques mots sur vous', true)}
          </>
        ) : null}

        {step === 2 && role === 'creator' ? (
          <>
            <Text style={s.title}>Votre univers</Text>
            <Text style={s.subtitle}>Choisissez vos disciplines pour être trouvé par les organisateurs.</Text>
            <View style={s.chips}>{DISCIPLINES.map(d => chip(d, disciplines.includes(d), () => setDisciplines(toggle(disciplines, d))))}</View>
            <Text style={s.label}>Ville (optionnel)</Text>
            {input(city, setCity, 'Ex : Lyon')}
          </>
        ) : null}

        {step === 2 && role === 'organizer' ? (
          <>
            <Text style={s.title}>Votre organisation</Text>
            <Text style={s.subtitle}>Le nom sous lequel les créateurs vous verront.</Text>
            <Text style={s.label}>Nom de l'organisation</Text>
            {input(orgName, setOrgName, 'Ex : Marché des Créateurs de Lyon')}
          </>
        ) : null}

        {step === 3 && role === 'organizer' ? (
          <>
            <Text style={s.title}>Vos événements</Text>
            <Text style={s.subtitle}>Dites-nous en plus sur les marchés que vous organisez.</Text>
            <Text style={s.label}>Types d'événements</Text>
            <View style={s.chips}>{ORG_EVENT_TYPES.map(t => chip(t, orgEventTypes.includes(t), () => setOrgEventTypes(toggle(orgEventTypes, t))))}</View>
            <Text style={s.label}>Événements par an</Text>
            <View style={s.chips}>{EVENTS_PER_YEAR.map(v => chip(v, eventsPerYear === v, () => setEventsPerYear(eventsPerYear === v ? '' : v)))}</View>
            <Text style={s.label}>Nombre d'exposants habituel</Text>
            <View style={s.chips}>{CAPACITIES.map(c => chip(c.label, capacity === c.value, () => setCapacity(capacity === c.value ? '' : c.value)))}</View>
          </>
        ) : null}
      </ScrollView>

      <View style={s.footer}>
        {step > 0 ? (
          <TouchableOpacity style={s.back} onPress={() => setStep(step - 1)} accessibilityRole="button" accessibilityLabel="Étape précédente">
            <Text style={s.backText}>Retour</Text>
          </TouchableOpacity>
        ) : <View style={s.back} />}
        <TouchableOpacity style={[s.next, (!canNext || saving) && { opacity: 0.45 }]} onPress={next} disabled={!canNext || saving} accessibilityRole="button">
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.nextText}>{step === totalSteps - 1 ? 'Terminer' : 'Continuer'}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  progress: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.lg },
  bar: { height: 6, width: 16, borderRadius: 3, backgroundColor: colors.border },
  barActive: { width: 32, backgroundColor: colors.primary },
  stepLabel: { ...typography.caption, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm },
  body: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { ...typography.h1, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl },
  label: { ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, color: colors.text.primary, ...typography.body,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.accent },
  chipText: { ...typography.label, color: colors.text.secondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 2, borderColor: colors.border,
  },
  roleCardActive: { borderColor: colors.primary },
  roleTitle: { ...typography.h3, color: colors.text.primary },
  roleDesc: { ...typography.body, color: colors.text.secondary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  back: { minWidth: 80, minHeight: 44, justifyContent: 'center' },
  backText: { ...typography.label, color: colors.text.secondary, fontWeight: '600' },
  next: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, minHeight: 48, alignItems: 'center', justifyContent: 'center', minWidth: 140 },
  nextText: { ...typography.label, color: '#fff', fontWeight: '700' },
});
