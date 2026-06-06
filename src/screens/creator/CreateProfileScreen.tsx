'use client';

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, Image, Platform, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../stores/auth';
import { DISCIPLINE_TAGS, TravelRadius } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = { navigation: StackNavigationProp<any, 'CreateProfile'> };

const FRENCH_REGIONS = [
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne',
  'Centre-Val de Loire', 'Corse', 'Grand Est', 'Hauts-de-France',
  'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie',
  'Pays de la Loire', "Provence-Alpes-Côte d'Azur",
];

const RADIUS_OPTIONS: { label: string; value: TravelRadius }[] = [
  { label: '5 km', value: '5' },
  { label: '10 km', value: '10' },
  { label: '25 km', value: '25' },
  { label: 'National', value: 'national' },
];

export default function CreateProfileScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [step, setStep] = useState(1); // 1: basic | 2: disciplines | 3: location | 4: photo

  // Form data
  const [bio, setBio] = useState('');
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [region, setRegion] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [travelRadius, setTravelRadius] = useState<TravelRadius>('10');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const toggleDiscipline = (tag: string) => {
    if (disciplines.includes(tag)) {
      setDisciplines(disciplines.filter(t => t !== tag));
    } else if (disciplines.length < 5) {
      setDisciplines([...disciplines, tag]);
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Accès à la galerie photo requis');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (bio.trim().length < 10) {
        Alert.alert('Bio requise', 'Écrivez une bio d\'au moins 10 caractères');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (disciplines.length === 0) {
        Alert.alert('Disciplines requises', 'Sélectionnez au moins une discipline');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!region || city.trim().length === 0) {
        Alert.alert('Localisation requise', 'Remplissez région et ville');
        return;
      }
      setStep(4);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error: profileError } = await supabase.from('creator_profiles').upsert({
        user_id: profile?.id,
        bio: bio.trim(),
        disciplines: disciplines,
        region,
        city: city.trim(),
        travel_radius: travelRadius,
      });

      if (profileError) throw profileError;

      Alert.alert('Profil créé', 'Bienvenue sur Nexart!');
      navigation.replace('Creator');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 1: BIO ─────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <View style={s.header}>
            <Text style={s.title}>Raconte-nous qui tu es</Text>
            <Text style={s.subtitle}>Étape 1/4 — Présentation</Text>
          </View>

          <View style={s.section}>
            <Text style={s.label}>Bio (à minima)</Text>
            <TextInput
              style={s.textarea}
              placeholder="Ex: Je suis céramiste depuis 5 ans, spécialisée en grès et porcelaine"
              placeholderTextColor={colors.text.secondary + '80'}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={5}
              maxLength={300}
            />
            <Text style={s.charCount}>{bio.length}/300</Text>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.btn, { opacity: bio.trim().length >= 10 ? 1 : 0.5 }]}
            onPress={handleNext}
            disabled={bio.trim().length < 10}
          >
            <Text style={s.btnText}>Suivant</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── STEP 2: DISCIPLINES ─────────────────────────────────────────────────
  if (step === 2) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <View style={s.header}>
            <Text style={s.title}>Tes disciplines</Text>
            <Text style={s.subtitle}>Étape 2/4 — Max 5 disciplines</Text>
          </View>

          <View style={s.section}>
            <View style={s.tagGrid}>
              {DISCIPLINE_TAGS.map(tag => {
                const active = disciplines.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[s.tag, active && s.tagActive]}
                    onPress={() => toggleDiscipline(tag)}
                    disabled={!active && disciplines.length >= 5}
                  >
                    <Text style={[s.tagText, active && s.tagTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.hint}>Sélectionnées : {disciplines.length}/5</Text>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={() => setStep(1)}>
            <Text style={s.btnSecondaryText}>← Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, { opacity: disciplines.length > 0 ? 1 : 0.5, flex: 1.5 }]}
            onPress={handleNext}
            disabled={disciplines.length === 0}
          >
            <Text style={s.btnText}>Suivant</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── STEP 3: LOCALISATION ────────────────────────────────────────────────
  if (step === 3) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <View style={s.header}>
            <Text style={s.title}>Où travailles-tu?</Text>
            <Text style={s.subtitle}>Étape 3/4 — Localisation & rayon</Text>
          </View>

          <View style={s.section}>
            <Text style={s.label}>Région</Text>
            <TouchableOpacity
              style={s.inputBtn}
              onPress={() => setShowRegionPicker(true)}
            >
              <Text style={[s.inputText, !region && { color: colors.text.secondary }]}>
                {region ?? 'Sélectionner une région'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={s.section}>
            <Text style={s.label}>Ville</Text>
            <TextInput
              style={s.input}
              placeholder="Ex: Paris, Lyon, Marseille"
              placeholderTextColor={colors.text.secondary + '80'}
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={s.section}>
            <Text style={s.label}>Rayon de déplacement</Text>
            <View style={s.radioGroup}>
              {RADIUS_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={s.radioRow}
                  onPress={() => setTravelRadius(opt.value)}
                >
                  <View style={[s.radio, travelRadius === opt.value && s.radioActive]}>
                    {travelRadius === opt.value && <View style={s.radioDot} />}
                  </View>
                  <Text style={s.radioLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={() => setStep(2)}>
            <Text style={s.btnSecondaryText}>← Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, { opacity: region && city.trim().length > 0 ? 1 : 0.5, flex: 1.5 }]}
            onPress={handleNext}
            disabled={!region || city.trim().length === 0}
          >
            <Text style={s.btnText}>Suivant</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showRegionPicker} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Sélectionner une région</Text>
                <TouchableOpacity onPress={() => setShowRegionPicker(false)}>
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={FRENCH_REGIONS}
                keyExtractor={r => r}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.regionOption}
                    onPress={() => {
                      setRegion(item);
                      setShowRegionPicker(false);
                    }}
                  >
                    <Text style={[s.regionOptionText, item === region && s.regionOptionTextActive]}>
                      {item}
                    </Text>
                    {item === region && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ─── STEP 4: PHOTO (optionnel) ───────────────────────────────────────────
  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.header}>
          <Text style={s.title}>Ta photo de profil</Text>
          <Text style={s.subtitle}>Étape 4/4 — Optionnel mais recommandé</Text>
        </View>

        <View style={s.section}>
          {photoUri ? (
            <>
              <Image source={{ uri: photoUri }} style={s.photoPreview} />
              <TouchableOpacity style={[s.btn, s.btnSecondary, { marginTop: spacing.md }]} onPress={pickImage}>
                <Text style={s.btnSecondaryText}>Changer la photo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={s.photoPicker} onPress={pickImage}>
              <Ionicons name="camera" size={40} color={colors.primary} />
              <Text style={s.photoPickerText}>Ajouter une photo</Text>
              <Text style={s.photoPickerHint}>JPG ou PNG — Max 5 MB</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.hint}>Une photo rend ton profil plus attrayant et augmente tes chances d'être sélectionné!</Text>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={() => setStep(3)}>
          <Text style={s.btnSecondaryText}>← Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.btn, { flex: 1.5, opacity: loading ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={s.btnText}>Terminer 🎉</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },

  header: { marginBottom: spacing.xxl },
  title: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary },

  section: { marginBottom: spacing.xl },
  label: { ...typography.label, color: colors.text.primary, marginBottom: spacing.sm, fontWeight: '600' },
  hint: { ...typography.caption, color: colors.text.secondary, fontStyle: 'italic' },

  // Bio / TextInput
  textarea: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text.primary,
    ...typography.body,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'right' },

  // Disciplines tags
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  tagTextActive: { color: colors.text.inverse, fontWeight: '600' },

  // Region / City inputs
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text.primary,
    ...typography.body,
  },
  inputBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: { ...typography.body, color: colors.text.primary },

  // Radio group
  radioGroup: { gap: spacing.md },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  radioLabel: { ...typography.body, color: colors.text.primary, flex: 1 },

  // Photo
  photoPicker: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  photoPickerText: { ...typography.h3, color: colors.text.primary, marginTop: spacing.md },
  photoPickerHint: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xs },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Footer
  footer: { flexDirection: 'row', gap: spacing.md, padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  btnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
  btnSecondaryText: { ...typography.label, color: colors.text.primary, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { ...typography.h3, color: colors.text.primary, fontWeight: '700' },
  regionOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border + '40' },
  regionOptionText: { ...typography.body, color: colors.text.primary },
  regionOptionTextActive: { color: colors.primary, fontWeight: '600' },
});
