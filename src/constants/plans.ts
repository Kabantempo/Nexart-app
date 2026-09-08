import { SubscriptionTier } from '../types';

/**
 * Offres et limites — miroir de `lib/stripe.ts` du site.
 * Les montants sont en centimes, comme chez Stripe.
 *
 * ⚠️ Cette table doit rester alignée sur le site : c'est lui qui crée les
 * sessions de paiement et applique les limites côté serveur. Ici, elles
 * servent uniquement à afficher la bonne offre et à griser ce qui est verrouillé.
 */

export interface TierLimits {
  candidatures_per_month: number | 'unlimited';
  portfolio_photos: number | 'unlimited';
  boutique_items: number | false;
  boutique_commission: number | false;
  analytics: 'none' | 'basic' | 'advanced';
  early_access_hours: number;
  events_active: number | 'unlimited';
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free:       { candidatures_per_month: 1,           portfolio_photos: 10,          boutique_items: false, boutique_commission: false, analytics: 'none',     early_access_hours: 0,  events_active: 1 },
  boost:      { candidatures_per_month: 4,           portfolio_photos: 30,          boutique_items: false, boutique_commission: false, analytics: 'basic',    early_access_hours: 24, events_active: 1 },
  pro:        { candidatures_per_month: 'unlimited', portfolio_photos: 'unlimited', boutique_items: 20,    boutique_commission: 0.08,  analytics: 'advanced', early_access_hours: 48, events_active: 1 },
  premium:    { candidatures_per_month: 'unlimited', portfolio_photos: 'unlimited', boutique_items: 50,    boutique_commission: 0.06,  analytics: 'advanced', early_access_hours: 48, events_active: 1 },
  org_pro:    { candidatures_per_month: 'unlimited', portfolio_photos: 'unlimited', boutique_items: false, boutique_commission: false, analytics: 'basic',    early_access_hours: 0,  events_active: 'unlimited' },
  org_studio: { candidatures_per_month: 'unlimited', portfolio_photos: 'unlimited', boutique_items: false, boutique_commission: false, analytics: 'advanced', early_access_hours: 0,  events_active: 'unlimited' },
};

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free:       'Gratuit',
  boost:      'Boost',
  pro:        'Pro',
  premium:    'Premium',
  org_pro:    'Pro',
  org_studio: 'Studio',
};

/** Prix mensuels affichés, en centimes (identiques à STRIPE_PRICES du site). */
export const TIER_MONTHLY_PRICE: Record<SubscriptionTier, number> = {
  free:       0,
  boost:      599,
  pro:        1499,
  premium:    2999,
  org_pro:    2900,
  org_studio: 7900,
};

export const CREATOR_TIERS: SubscriptionTier[]   = ['free', 'boost', 'pro', 'premium'];
export const ORGANIZER_TIERS: SubscriptionTier[] = ['free', 'org_pro', 'org_studio'];

/** Packs de crédits pay-as-you-go — miroir de STRIPE_CREDIT_PRICES du site. */
export const CREDIT_PACKS = [
  { key: 'boost_x1',  amount: 299,  credits: 1,  label: '1 boost candidature' },
  { key: 'boost_x5',  amount: 1299, credits: 5,  label: '5 boosts candidature' },
  { key: 'boost_x10', amount: 2499, credits: 10, label: '10 boosts candidature' },
  { key: 'boost_x20', amount: 4499, credits: 20, label: '20 boosts candidature' },
  { key: 'event_x1',  amount: 999,  credits: 1,  label: '1 événement à la carte' },
  { key: 'event_x3',  amount: 2499, credits: 3,  label: '3 événements à la carte' },
] as const;

/** 1499 → « 14,99 € » */
export function formatPrice(cents: number): string {
  if (cents === 0) return 'Gratuit';
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`;
}
