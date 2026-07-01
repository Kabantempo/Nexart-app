import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Platform,
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
  const stepRef        = useRef(step);
  const lastScrollTime = useRef(0);
  stepRef.current = step;

  const slide  = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const handleNext = useCallback(() => {
    if (stepRef.current >= SLIDES.length - 1) { onDismiss(); setStep(0); }
    else setStep(s => s + 1);
  }, [onDismiss]);

  const handlePrev = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
  }, []);

  const handleSkip = useCallback(() => { onDismiss(); setStep(0); }, [onDismiss]);

  // Molette + flèches clavier — attachés sur document pour passer à travers la Modal
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;

    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 350) return;
      lastScrollTime.current = now;
      if (e.deltaY > 10 || e.deltaX > 10) handleNext();
      else if (e.deltaY < -10 || e.deltaX < -10) handlePrev();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
      else if (e.key === 'Escape') handleSkip();
      else if (e.key === 'Enter' || e.key === ' ') handleNext();
    };

    // document capture pour passer au dessus de la Modal RN Web
    document.addEventListener('wheel', onWheel, { passive: true, capture: true });
    document.addEventListener('keydown', onKey, { capture: true });
    return () => {
      document.removeEventListener('wheel', onWheel, { capture: true } as any);
      document.removeEventListener('keydown', onKey, { capture: true } as any);
    };
  }, [visible, handleNext, handlePrev, handleSkip]);

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
              <TouchableOpacity key={i} onPress={() => setStep(i)}>
                <View style={[s.dot, i === step && { ...s.dotActive, backgroundColor: slide.color }]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Navigation flèches (web) */}
          {Platform.OS === 'web' && (
            <View style={s.arrowRow}>
              <TouchableOpacity style={[s.arrowBtn, step === 0 && { opacity: 0.3 }]} onPress={handlePrev} disabled={step === 0}>
                <Ionicons name="chevron-back" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, { backgroundColor: slide.color, flex: 1 }]}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={s.btnText}>{slide.action}</Text>
              </TouchableOpacity>
              <View style={{ width: 40 }} />
            </View>
          )}

          {/* CTA mobile */}
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              style={[s.btn, { backgroundColor: slide.color }]}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={s.btnText}>{slide.action}</Text>
            </TouchableOpacity>
          )}

          {!isLast && (
            <TouchableOpacity onPress={handleSkip} style={s.skipBtn}>
              <Text style={s.skipText}>Passer</Text>
            </TouchableOpacity>
          )}

          {Platform.OS === 'web' && (
            <Text style={s.hint}>Molette ou flèches ← → pour naviguer</Text>
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
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.sm,
  },
  arrowBtn: {
    width: 40,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  hint: {
    ...typography.caption,
    color: colors.text.secondary + '66',
    marginTop: spacing.xs,
    fontSize: 11,
  },
});
