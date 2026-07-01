import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAuth } from '../../stores/auth';
import { useCreatorProfile } from '../../hooks/useCreatorProfile';
import { supabase } from '../../lib/supabase';
import { PageSettings, PageFont, DEFAULT_PAGE_SETTINGS } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

// ─── Presets ──────────────────────────────────────────────────────────────────

const BG_PRESETS = [
  { label: 'Nuit',    value: '#0D0D0D' },
  { label: 'Encre',  value: '#0A0A14' },
  { label: 'Forêt',  value: '#0A120A' },
  { label: 'Braise', value: '#120A0A' },
  { label: 'Ardoise',value: '#0E1016' },
  { label: 'Ivoire', value: '#F5F0E8' },
];

const ACCENT_PRESETS = [
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Or',     value: '#C9A84C' },
  { label: 'Sauge',  value: '#7A9E87' },
  { label: 'Rose',   value: '#EC4899' },
  { label: 'Cyan',   value: '#06B6D4' },
  { label: 'Ambre',  value: '#F59E0B' },
];

const TEXT_PRESETS = [
  { label: 'Blanc',  value: '#F5F3EF' },
  { label: 'Crème',  value: '#E8E0D0' },
  { label: 'Grisé',  value: '#A0A0A0' },
];

const FONTS: { label: string; value: PageFont; sample: string; fontFamily?: string }[] = [
  { label: 'Par défaut', value: 'default',  sample: 'Céramiste passionnée',  fontFamily: undefined },
  { label: 'Serif',      value: 'serif',    sample: 'Céramiste passionnée',  fontFamily: 'serif' },
  { label: 'Mono',       value: 'mono',     sample: 'Céramiste passionnée',  fontFamily: 'monospace' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={sc.sectionRow}>
      <Ionicons name={icon as any} size={14} color={colors.primary} />
      <Text style={sc.sectionTitle}>{title}</Text>
    </View>
  );
}

function SwatchRow({ options, value, onChange }: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={sc.swatchRow}>
      {options.map(o => (
        <TouchableOpacity
          key={o.value}
          style={[sc.swatch, { backgroundColor: o.value }, value === o.value && sc.swatchActive]}
          onPress={() => onChange(o.value)}
          activeOpacity={0.8}
        >
          {value === o.value && <Ionicons name="checkmark" size={14} color={o.value === '#F5F0E8' || o.value === '#F5F3EF' || o.value === '#E8E0D0' ? '#000' : '#fff'} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Mini preview ─────────────────────────────────────────────────────────────

function MiniPreview({ settings, name, bio }: { settings: PageSettings; name: string; bio: string }) {
  const fontFamily = settings.bio_font === 'default' ? undefined
    : settings.bio_font === 'serif' ? 'serif'
    : 'monospace';

  return (
    <View style={[sc.preview, { backgroundColor: settings.bg_color }]}>
      <View style={sc.previewAvatar}>
        <Text style={[sc.previewAvatarText, { color: settings.accent_color }]}>{name[0]?.toUpperCase() ?? 'A'}</Text>
      </View>
      <Text style={[sc.previewName, { color: settings.bio_color }]} numberOfLines={1}>{name}</Text>
      {settings.tagline ? (
        <Text style={[sc.previewTagline, { color: settings.accent_color, fontFamily }]} numberOfLines={1}>{settings.tagline}</Text>
      ) : null}
      {bio ? (
        <Text style={[sc.previewBio, { color: settings.bio_color, fontFamily }]} numberOfLines={2}>{bio}</Text>
      ) : null}
      <View style={sc.previewChip}>
        <View style={[sc.previewChipInner, { backgroundColor: settings.accent_color + '25', borderColor: settings.accent_color + '50' }]}>
          <Text style={[sc.previewChipText, { color: settings.accent_color }]}>Céramique</Text>
        </View>
        <View style={[sc.previewChipInner, { backgroundColor: settings.accent_color + '25', borderColor: settings.accent_color + '50' }]}>
          <Text style={[sc.previewChipText, { color: settings.accent_color }]}>Poterie</Text>
        </View>
      </View>
      {settings.music_label && (
        <View style={[sc.previewMusic, { borderColor: settings.accent_color + '40' }]}>
          <Ionicons name="musical-notes" size={10} color={settings.accent_color} />
          <Text style={[sc.previewMusicText, { color: settings.accent_color }]} numberOfLines={1}>{settings.music_label}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PageCustomizationScreen() {
  const nav    = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { creatorProfile, loading } = useCreatorProfile(profile?.id);

  const [settings, setSettings] = useState<PageSettings>(DEFAULT_PAGE_SETTINGS);
  const [saving, setSaving]     = useState(false);
  const [testingAudio, setTestingAudio] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (creatorProfile?.page_settings) {
      setSettings({ ...DEFAULT_PAGE_SETTINGS, ...creatorProfile.page_settings });
    }
  }, [creatorProfile]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => { soundRef.current?.unloadAsync().catch(() => {}); };
  }, []);

  const set = (patch: Partial<PageSettings>) => setSettings(prev => ({ ...prev, ...patch }));

  const testAudio = async () => {
    if (!settings.music_url?.trim()) {
      Alert.alert('URL manquante', 'Collez d\'abord l\'URL d\'un fichier audio (.mp3, .m4a…)');
      return;
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setTestingAudio(true);
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: settings.music_url.trim() },
        { shouldPlay: true, volume: 0.8 },
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(status => {
        if ('didJustFinish' in status && status.didJustFinish) setTestingAudio(false);
        if ('error' in status) setTestingAudio(false);
      });
    } catch {
      Alert.alert('Audio introuvable', 'Vérifiez l\'URL — elle doit pointer vers un fichier MP3 ou M4A direct.');
    } finally {
      setTestingAudio(false);
    }
  };

  const stopAudio = async () => {
    await soundRef.current?.stopAsync();
    soundRef.current = null;
    setTestingAudio(false);
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from('creator_profiles')
      .update({ page_settings: settings })
      .eq('user_id', profile.id);
    setSaving(false);
    if (error) {
      Alert.alert('Erreur', 'La sauvegarde a échoué. Vérifiez que la colonne page_settings existe dans creator_profiles.');
      return;
    }
    nav.goBack();
  };

  if (loading) {
    return <View style={sc.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[sc.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={sc.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={sc.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={sc.headerTitle}>Ma page</Text>
          <TouchableOpacity
            style={[sc.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={sc.saveBtnText}>{saving ? 'Enreg…' : 'Enregistrer'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={sc.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Preview */}
          <MiniPreview settings={settings} name={profile?.full_name ?? 'Artisan'} bio={profile?.bio ?? 'Céramiste passionnée basée à Lyon, spécialisée en grès.'} />

          {/* ── Tagline ── */}
          <SectionHeader icon="text-outline" title="Phrase d'accroche" />
          <TextInput
            style={sc.input}
            placeholder="Ex : L'argile comme langage…"
            placeholderTextColor={colors.text.secondary}
            value={settings.tagline ?? ''}
            onChangeText={v => set({ tagline: v || null })}
            maxLength={80}
          />
          <Text style={sc.charCount}>{(settings.tagline ?? '').length}/80</Text>

          {/* ── Police ── */}
          <SectionHeader icon="text" title="Police du texte" />
          <View style={sc.fontRow}>
            {FONTS.map(f => (
              <TouchableOpacity
                key={f.value}
                style={[sc.fontCard, settings.bio_font === f.value && sc.fontCardActive]}
                onPress={() => set({ bio_font: f.value })}
                activeOpacity={0.8}
              >
                <Text style={[sc.fontSample, { fontFamily: f.fontFamily }, settings.bio_font === f.value && { color: colors.primary }]}>
                  {f.sample}
                </Text>
                <Text style={[sc.fontLabel, settings.bio_font === f.value && { color: colors.primary }]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Fond ── */}
          <SectionHeader icon="color-palette-outline" title="Couleur de fond" />
          <SwatchRow options={BG_PRESETS} value={settings.bg_color} onChange={v => set({ bg_color: v })} />

          {/* ── Accent ── */}
          <SectionHeader icon="sparkles-outline" title="Couleur d'accent" />
          <Text style={sc.hint}>Utilisée pour les chips disciplines, les badges et la musique.</Text>
          <SwatchRow options={ACCENT_PRESETS} value={settings.accent_color} onChange={v => set({ accent_color: v })} />

          {/* ── Texte ── */}
          <SectionHeader icon="create-outline" title="Couleur du texte" />
          <SwatchRow options={TEXT_PRESETS} value={settings.bio_color} onChange={v => set({ bio_color: v })} />

          {/* ── Musique ── */}
          <SectionHeader icon="musical-notes-outline" title="Musique de fond" />
          <Text style={sc.hint}>
            URL directe vers un fichier .mp3 ou .m4a (Dropbox, Google Drive en lien direct, etc.).
            Les visiteurs pourront déclencher la lecture eux-mêmes.
          </Text>
          <TextInput
            style={sc.input}
            placeholder="https://… .mp3"
            placeholderTextColor={colors.text.secondary}
            value={settings.music_url ?? ''}
            onChangeText={v => set({ music_url: v || null })}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[sc.input, { marginTop: spacing.xs }]}
            placeholder="Artiste — Titre (ex : Polo & Pan — Canopée)"
            placeholderTextColor={colors.text.secondary}
            value={settings.music_label ?? ''}
            onChangeText={v => set({ music_label: v || null })}
            maxLength={80}
          />
          <TouchableOpacity
            style={[sc.audioTestBtn, testingAudio && { backgroundColor: colors.error + '15', borderColor: colors.error + '50' }]}
            onPress={testingAudio ? stopAudio : testAudio}
          >
            <Ionicons
              name={testingAudio ? 'stop-circle-outline' : 'play-circle-outline'}
              size={16}
              color={testingAudio ? colors.error : colors.primary}
            />
            <Text style={[sc.audioTestText, testingAudio && { color: colors.error }]}>
              {testingAudio ? 'Arrêter' : 'Tester l\'audio'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sc = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn:     { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { ...typography.h3, color: colors.text.primary, fontWeight: '700', flex: 1 },
  saveBtn:     { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 8 },
  saveBtnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },

  content: { padding: spacing.xl, gap: spacing.lg },

  /* Preview */
  preview: {
    borderRadius: radius.xl, padding: spacing.lg,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.md,
  },
  previewAvatar: {
    width: 52, height: 52, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  previewAvatarText: { fontSize: 22, fontWeight: '700' },
  previewName:    { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  previewTagline: { fontSize: 12, fontStyle: 'italic', marginBottom: 6, opacity: 0.9 },
  previewBio:     { fontSize: 11, lineHeight: 16, textAlign: 'center', marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  previewChip:    { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: spacing.sm },
  previewChipInner: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  previewChipText:  { fontSize: 10, fontWeight: '600' },
  previewMusic: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
    marginTop: 4,
  },
  previewMusicText: { fontSize: 10 },

  /* Section */
  sectionRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  sectionTitle:{ ...typography.label, color: colors.text.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11 },
  hint:        { ...typography.caption, color: colors.text.secondary, lineHeight: 17, marginBottom: spacing.sm, marginTop: -spacing.xs },

  /* Input */
  input: {
    backgroundColor: colors.surface, color: colors.text.primary,
    borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    ...typography.body,
  },
  charCount: { ...typography.caption, color: colors.text.secondary, textAlign: 'right', marginTop: 2 },

  /* Font picker */
  fontRow:       { flexDirection: 'row', gap: spacing.sm },
  fontCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, alignItems: 'center', gap: spacing.xs,
  },
  fontCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  fontSample:    { fontSize: 13, color: colors.text.primary, textAlign: 'center' },
  fontLabel:     { ...typography.caption, color: colors.text.secondary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6 },

  /* Swatches */
  swatchRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  swatch: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  swatchActive: { borderColor: '#fff', shadowColor: '#fff', shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },

  /* Audio test */
  audioTestBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    alignSelf: 'flex-start', marginTop: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderWidth: 1, borderColor: colors.primary + '40',
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8,
  },
  audioTestText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});
