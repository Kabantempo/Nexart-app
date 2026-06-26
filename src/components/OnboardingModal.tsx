import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../types';
import { colors, spacing, typography, radius } from '../constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STEPS: Record<UserRole, Array<{ icon: IoniconName; title: string; body: string }>> = {
  creator: [
    { icon: 'brush-outline', title: 'Bienvenue sur Nexart !', body: 'La plateforme qui connecte créateurs et marchés artisanaux en France.' },
    { icon: 'clipboard-outline', title: 'Complétez votre profil', body: 'Ajoutez vos disciplines, votre ville et vos photos de portfolio — les organisateurs vous trouveront plus facilement.' },
    { icon: 'search-outline', title: 'Trouvez vos marchés', body: 'Parcourez les marchés disponibles dans l\'onglet Marchés, filtrez par discipline, ville ou date.' },
    { icon: 'checkmark-circle-outline', title: 'Candidatez en 1 clic', body: 'Envoyez votre candidature directement depuis la fiche du marché. L\'organisateur vous répondra par message.' },
  ],
  organizer: [
    { icon: 'calendar-outline', title: 'Bienvenue sur Nexart !', body: 'La plateforme pour trouver les meilleurs artisans pour vos marchés.' },
    { icon: 'create-outline', title: 'Créez votre premier marché', body: 'Utilisez l\'onglet "Créer" pour publier votre marché avec dates, stands et disciplines recherchées.' },
    { icon: 'mail-outline', title: 'Recevez des candidatures', body: 'Les artisans candidatent directement. Acceptez ou refusez depuis "Mes marchés".' },
    { icon: 'chatbubbles-outline', title: 'Échangez par message', body: 'Contactez les artisans acceptés via la messagerie intégrée pour organiser les détails.' },
  ],
  visitor: [
    { icon: 'star-outline', title: 'Bienvenue sur Nexart !', body: 'Découvrez les marchés artisanaux et les créateurs indépendants près de chez vous.' },
    { icon: 'search-outline', title: 'Explorez les marchés', body: 'Recherchez par ville, discipline ou date. Sauvegardez vos favoris.' },
    { icon: 'person-outline', title: 'Découvrez les créateurs', body: 'Parcourez les portfolios, voyez leurs prochains marchés, et contactez-les directement.' },
    { icon: 'heart-outline', title: 'Sauvegardez vos favoris', body: 'Gardez une trace des marchés et créateurs qui vous inspirent.' },
  ],
};

const STORAGE_KEY = 'nexart_onboarding_seen';

function getStorage() {
  if (Platform.OS === 'web') {
    return {
      getItem: (k: string) => Promise.resolve(localStorage.getItem(k)),
      setItem: (k: string, v: string) => { localStorage.setItem(k, v); return Promise.resolve(); },
    };
  }
  return require('@react-native-async-storage/async-storage').default;
}

export function useOnboarding(role: UserRole | undefined) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!role) return;
    getStorage().getItem(`${STORAGE_KEY}_${role}`)
      .then((val: string | null) => { if (!val) setVisible(true); });
  }, [role]);

  const dismiss = () => {
    if (!role) return;
    getStorage().setItem(`${STORAGE_KEY}_${role}`, '1');
    setVisible(false);
  };

  return { visible, dismiss };
}

export default function OnboardingModal({ role, visible, onDismiss }: { role: UserRole; visible: boolean; onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const steps = STEPS[role] ?? STEPS.visitor;
  const current = steps[step];
  const isLast  = step === steps.length - 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={s.overlay}>
        <View style={s.panel}>
          <Ionicons name={current.icon} size={52} color={colors.primary} style={s.icon} />
          <Text style={s.title}>{current.title}</Text>
          <Text style={s.body}>{current.body}</Text>

          <View style={s.dots}>
            {steps.map((_, i) => (
              <View key={i} style={[s.dot, i === step && s.dotActive]} />
            ))}
          </View>

          <View style={s.actions}>
            {!isLast ? (
              <>
                <TouchableOpacity style={s.skipBtn} onPress={onDismiss}>
                  <Text style={s.skipText}>Passer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.nextBtn} onPress={() => setStep(s => s + 1)}>
                  <Text style={s.nextText}>Suivant →</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[s.nextBtn, { flex: 1 }]} onPress={onDismiss}>
                <Text style={s.nextText}>C'est parti !</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  panel:   { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, width: '100%', maxWidth: 400, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  icon:    { marginBottom: spacing.lg },
  title:   { ...typography.h2, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.md },
  body:    { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl },
  dots:    { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  dot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  actions: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  skipBtn: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  skipText:{ ...typography.label, color: colors.text.secondary },
  nextBtn: { flex: 2, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  nextText:{ ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
