import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../constants/theme';

const SLIDES = [
  {
    icon: 'sparkles-outline' as const,
    color: '#6366F1',
    title: 'Bienvenue sur Nexart',
    body: "La plateforme qui connecte les artisans aux marchés en France. En quelques étapes, vous serez prêt à candidater.",
    action: 'Suivant',
  },
  {
    icon: 'search-outline' as const,
    color: '#10B981',
    title: 'Découvrez les marchés',
    body: "Parcourez des marchés partout en France, filtrez par région, discipline et budget. Candidatez en un seul clic.",
    action: 'Suivant',
  },
  {
    icon: 'person-add-outline' as const,
    color: '#F59E0B',
    title: 'Créez votre profil',
    body: "Les organisateurs consultent votre profil avant de vous accepter. Ajoutez vos disciplines, votre portfolio et vos disponibilités.",
    action: 'Commencer',
  },
];

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function OnboardingModal({ visible, onDismiss }: Props) {
  const [step, setStep] = useState(0);

  const slide  = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) { onDismiss(); setStep(0); }
    else setStep(s => s + 1);
  };

  const handleSkip = () => { onDismiss(); setStep(0); };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={s.overlay}>
        <View style={s.card}>
          {/* Icône */}
          <View style={[s.iconWrap, { backgroundColor: slide.color + '18', borderColor: slide.color + '30' }]}>
            <Ionicons name={slide.icon} size={38} color={slide.color} />
          </View>

          {/* Texte */}
          <Text style={s.title}>{slide.title}</Text>
          <Text style={s.body}>{slide.body}</Text>

          {/* Dots progression */}
          <View style={s.dotsRow}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[s.dot, i === step && { ...s.dotActive, backgroundColor: slide.color }]} />
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[s.btn, { backgroundColor: slide.color }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>{slide.action}</Text>
          </TouchableOpacity>

          {!isLast && (
            <TouchableOpacity onPress={handleSkip} style={s.skipBtn}>
              <Text style={s.skipText}>Passer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  body: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    borderRadius: 3,
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  btnText: {
    ...typography.label,
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  skipBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  skipText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
