import React, { useEffect, useMemo } from 'react';
import { AppState, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import { useAuth } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import { useSubscription } from '../../hooks/useSubscription';
import { useCheckout } from '../../hooks/useCheckout';
import { CAN_BUY_DIGITAL_IN_APP } from '../../constants/billing';
import {
  CREATOR_TIERS, ORGANIZER_TIERS, TIER_LABELS, TIER_LIMITS, TIER_MONTHLY_PRICE, TIER_PRICE_IDS, TierLimits, formatPrice,
} from '../../constants/plans';
import { SubscriptionTier } from '../../types';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

/** Lignes de description d'une offre, tirées de la table de limites. */
export function describeLimits(l: TierLimits): string[] {
  const out: string[] = [];
  out.push(l.candidatures_per_month === 'unlimited' ? 'Candidatures illimitées' : `${l.candidatures_per_month} candidature${l.candidatures_per_month > 1 ? 's' : ''} par mois`);
  out.push(l.portfolio_photos === 'unlimited' ? 'Photos de portfolio illimitées' : `${l.portfolio_photos} photos de portfolio`);
  if (l.boutique_items) out.push(`Boutique : ${l.boutique_items} produits${l.boutique_commission ? ` (commission ${Math.round(l.boutique_commission * 100)} %)` : ''}`);
  if (l.analytics !== 'none') out.push(l.analytics === 'advanced' ? 'Statistiques avancées' : 'Statistiques de base');
  if (l.early_access_hours > 0) out.push(`Accès anticipé aux marchés : ${l.early_access_hours} h`);
  out.push(l.events_active === 'unlimited' ? 'Événements actifs illimités' : `${l.events_active} événement actif`);
  return out;
}

export default function PlansScreen({ navigation }: any) {
  const { profile, refetchProfile } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const sub = useSubscription();
  const { buy, openPortal, busy } = useCheckout();
  const tiers: SubscriptionTier[] = profile?.role === 'organizer' ? ORGANIZER_TIERS : CREATOR_TIERS;

  // Après un paiement dans le navigateur, on relit le profil dès le retour dans l'app.
  useEffect(() => {
    const sub = AppState.addEventListener('change', st => { if (st === 'active') refetchProfile(); });
    return () => sub.remove();
  }, [refetchProfile]);

  const choose = async (tier: SubscriptionTier) => {
    const priceId = TIER_PRICE_IDS[tier];
    if (!priceId) return;
    const err = await buy(priceId, 'subscription');
    if (err) Alert.alert('Paiement impossible', err);
  };

  const manage = async () => {
    const err = await openPortal();
    if (err) Alert.alert('Gestion impossible', err);
  };

  return (
    <EventScreenShell title="Offres" onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <Text style={s.intro}>
          Offre actuelle : <Text style={s.strong}>{sub.label}</Text>
          {sub.isCancelling && sub.endsAt ? ` (se termine le ${new Date(sub.endsAt).toLocaleDateString('fr-FR')})` : ''}
          {sub.isPastDue ? ' (paiement en échec)' : ''}
        </Text>

        {tiers.map(tier => {
          const current = tier === sub.tier;
          return (
            <View key={tier} style={[s.card, current && s.cardCurrent]}>
              <View style={s.top}>
                <Text style={s.name}>{TIER_LABELS[tier]}</Text>
                <Text style={s.price}>{tier === 'free' ? 'Gratuit' : `${formatPrice(TIER_MONTHLY_PRICE[tier])} / mois`}</Text>
              </View>
              {describeLimits(TIER_LIMITS[tier]).map(line => <Text key={line} style={s.line}>• {line}</Text>)}
              {current ? (
                <Text style={s.badge}>Offre actuelle</Text>
              ) : tier !== 'free' && CAN_BUY_DIGITAL_IN_APP ? (
                <TouchableOpacity style={[s.btn, busy && { opacity: 0.6 }]} onPress={() => choose(tier)} disabled={busy} accessibilityRole="button">
                  <Text style={s.btnText}>Choisir cette offre</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}

        {!CAN_BUY_DIGITAL_IN_APP ? (
          <Text style={s.note}>Les abonnements se gèrent depuis un navigateur, sur votre compte Nexart.</Text>
        ) : sub.isPaid ? (
          <TouchableOpacity style={s.secondary} onPress={manage} disabled={busy} accessibilityRole="button">
            <Text style={s.secondaryText}>Gérer ou résilier mon abonnement</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={s.note}>Le paiement s'ouvre dans votre navigateur et se règle sur la page sécurisée de Stripe.</Text>
      </ScrollView>
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  intro: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.md },
  strong: { color: colors.text.primary, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, gap: spacing.xs,
  },
  cardCurrent: { borderColor: colors.primary },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.xs },
  name: { ...typography.h3, color: colors.text.primary },
  price: { ...typography.label, color: colors.primary, fontWeight: '700' },
  line: { ...typography.body, color: colors.text.secondary },
  badge: { ...typography.caption, color: colors.primary, fontWeight: '700', marginTop: spacing.sm },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
  secondary: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  secondaryText: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  note: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.md, textAlign: 'center' },
});
