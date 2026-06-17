import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { submitReview } from '../../hooks/useReviews';
import { CREATOR_REVIEW_TAGS, ORGANIZER_REVIEW_TAGS, ReviewerRole } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

export type ReviewScreenParams = {
  eventId: string;
  reviewedId: string;
  reviewedName: string;
  reviewerRole: ReviewerRole;
};

type Props = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<{ Review: ReviewScreenParams }, 'Review'>;
};

const RATING_LABELS = ['', 'Très décevant', 'Décevant', 'Correct', 'Bien', 'Excellent'];

export default function ReviewScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { eventId, reviewedId, reviewedName, reviewerRole } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const availableTags = reviewerRole === 'creator'
    ? [...CREATOR_REVIEW_TAGS]
    : [...ORGANIZER_REVIEW_TAGS];

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Note requise', 'Sélectionnez une note entre 1 et 5.'); return; }
    if (!profile?.id) return;
    setSaving(true);
    const { error } = await submitReview({
      eventId,
      reviewerId: profile.id,
      reviewedId,
      reviewerRole,
      rating,
      comment,
      tags,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Erreur', error);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.successWrap}>
          <View style={s.successIconCircle}>
            <Text style={s.successIcon}>★</Text>
          </View>
          <Text style={s.successTitle}>Avis envoyé !</Text>
          <Text style={s.successSub}>Merci pour votre évaluation de {reviewedName}.</Text>
          <TouchableOpacity style={s.btnBack} onPress={() => navigation.goBack()}>
            <Text style={s.btnBackText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {reviewerRole === 'creator' ? 'Évaluer l\'organisateur' : 'Évaluer le créateur'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.reviewingName}>{reviewedName}</Text>

        {/* Stars */}
        <Text style={s.sectionLabel}>NOTE</Text>
        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity key={n} onPress={() => setRating(n)} style={s.starBtn} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
              <Text style={[s.star, n <= rating && s.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.ratingLabel, rating === 0 && { color: 'transparent' }]}>
          {rating > 0 ? RATING_LABELS[rating] : 'x'}
        </Text>

        {/* Tags */}
        <Text style={s.sectionLabel}>TAGS <Text style={s.optional}>(optionnel)</Text></Text>
        <View style={s.tagWrap}>
          {availableTags.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.tag, tags.includes(t) && s.tagActive]}
              onPress={() => toggleTag(t)}
            >
              <Text style={[s.tagText, tags.includes(t) && s.tagTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Comment */}
        <Text style={s.sectionLabel}>COMMENTAIRE <Text style={s.optional}>(optionnel, 100 max)</Text></Text>
        <TextInput
          style={s.input}
          value={comment}
          onChangeText={setComment}
          placeholder="Votre avis en quelques mots…"
          placeholderTextColor={colors.text.secondary}
          maxLength={100}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <Text style={s.charCount}>{comment.length}/100</Text>

        {/* Submit */}
        <TouchableOpacity
          style={[s.btnSubmit, (saving || rating === 0) && s.btnDisabled]}
          onPress={handleSubmit}
          disabled={saving || rating === 0}
        >
          {saving
            ? <ActivityIndicator color={colors.text.inverse} size="small" />
            : <Text style={s.btnSubmitText}>Envoyer l'avis</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderColor: colors.border,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backArrow: { fontSize: 22, color: colors.text.secondary },
  headerTitle: { ...typography.h3, color: colors.text.primary, flex: 1, textAlign: 'center' },

  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },

  reviewingName: {
    ...typography.h2, color: colors.text.primary,
    textAlign: 'center', marginBottom: spacing.xl,
  },

  sectionLabel: {
    ...typography.caption, color: colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700',
    marginBottom: spacing.sm, marginTop: spacing.lg,
  },
  optional: { fontWeight: '400', textTransform: 'none', letterSpacing: 0 },

  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  starBtn: { padding: 4 },
  star: { fontSize: 42, color: colors.border },
  starActive: { color: colors.primary },
  ratingLabel: {
    ...typography.label, color: colors.primary,
    textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xs,
    fontWeight: '600',
  },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 8,
  },
  tagActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  tagText: { ...typography.label, color: colors.text.secondary },
  tagTextActive: { color: colors.text.inverse, fontWeight: '600' },

  input: {
    backgroundColor: colors.surface, color: colors.text.primary,
    borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    minHeight: 90, fontSize: 14, lineHeight: 20,
    marginTop: 0,
  },
  charCount: {
    ...typography.caption, color: colors.text.secondary,
    textAlign: 'right', marginTop: 4,
  },

  btnSubmit: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingVertical: 16, alignItems: 'center', marginTop: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  btnDisabled: { opacity: 0.45 },
  btnSubmitText: { ...typography.label, color: colors.text.inverse, fontWeight: '700', fontSize: 15 },

  // Success state
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  successIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successIcon: { fontSize: 36, color: colors.primary },
  successTitle: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm, textAlign: 'center' },
  successSub: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  btnBack: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, paddingVertical: 14, paddingHorizontal: spacing.xl,
  },
  btnBackText: { ...typography.label, color: colors.text.primary },
});
