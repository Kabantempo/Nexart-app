import { useState } from 'react';
import { Linking } from 'react-native';
import { siteFetch } from '../lib/siteApi';
import { useAuth } from '../stores/auth';

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://nexart.fr';

type Kind = 'subscription' | 'credits';

/**
 * Lance un paiement Stripe en passant par les routes du site (mêmes règles, mêmes
 * commissions que sur PC), puis ouvre la page de paiement dans le navigateur.
 * Le retour se fait sur les pages du site ; l'app se met à jour à son retour au premier plan.
 */
export function useCheckout() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const run = async (path: string, body: object): Promise<string | null> => {
    setBusy(true);
    try {
      const res = await siteFetch(path, { method: 'POST', body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.url) throw new Error('Aucune page de paiement reçue');
      await Linking.openURL(json.url);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Paiement impossible pour le moment.';
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    /** Abonnement mensuel ou achat de crédits. */
    buy: (priceId: string, kind: Kind) => {
      if (!user) return Promise.resolve('Non connecté');
      return run('/api/stripe/checkout', {
        priceId,
        mode: kind === 'subscription' ? 'subscription' : 'payment',
        userId: user.id,
        successUrl: `${SITE_URL}/stripe/success?type=${kind}`,
        cancelUrl: `${SITE_URL}/offres?payment=cancelled`,
      });
    },
    /** Gérer ou résilier l'abonnement (portail Stripe). */
    openPortal: () => run('/api/stripe/portal', { returnUrl: `${SITE_URL}/dashboard` }),
    /** Régler le stand d'une candidature acceptée. */
    payStand: (applicationId: string) => run('/api/stripe/stand-checkout', { application_id: applicationId }),
  };
}
