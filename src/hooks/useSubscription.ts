import { useMemo } from 'react';
import { useAuth } from '../stores/auth';
import { TIER_LABELS, TIER_LIMITS, TierLimits } from '../constants/plans';
import { SubscriptionTier } from '../types';

/**
 * Abonnement de l'utilisateur courant, lu depuis `profiles`
 * (`subscription_tier`, `subscription_status`, `subscription_ends_at`).
 *
 * ⚠️ Les limites renvoyées ici servent à l'affichage. La règle qui fait foi
 * est appliquée côté serveur par le site — ne jamais s'appuyer sur ce hook
 * seul pour autoriser une action payante.
 */
export function useSubscription() {
  const { profile } = useAuth();

  return useMemo(() => {
    const tier: SubscriptionTier = profile?.subscription_tier ?? 'free';
    const status = profile?.subscription_status ?? null;
    const endsAt = profile?.subscription_ends_at ?? null;

    const isActive = status === 'active' || status === 'trialing';
    const isPaid   = tier !== 'free' && isActive;
    const limits: TierLimits = TIER_LIMITS[tier] ?? TIER_LIMITS.free;

    return {
      tier,
      label: TIER_LABELS[tier] ?? TIER_LABELS.free,
      status,
      endsAt,
      isActive,
      isPaid,
      limits,
      /** L'abonnement est résilié mais court encore jusqu'à `endsAt`. */
      isCancelling: status === 'cancelled' && !!endsAt && new Date(endsAt) > new Date(),
      /** Paiement en échec — à signaler à l'utilisateur. */
      isPastDue: status === 'past_due',
    };
  }, [profile?.subscription_tier, profile?.subscription_status, profile?.subscription_ends_at]);
}

/** Le quota de photos portfolio est-il atteint ? */
export function isPortfolioFull(limits: TierLimits, currentCount: number): boolean {
  return limits.portfolio_photos !== 'unlimited' && currentCount >= limits.portfolio_photos;
}
