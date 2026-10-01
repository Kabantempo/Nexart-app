import { Platform } from 'react-native';

/**
 * Abonnements et crédits sont des biens numériques : sur iOS, l'App Store impose
 * l'achat intégré et interdit de renvoyer vers un paiement Stripe. On masque donc
 * l'achat sur iOS. Le paiement d'un stand (service réel, hors de l'app) reste
 * disponible partout. Passer à `true` seulement après décision sur la politique de l'App Store.
 */
export const CAN_BUY_DIGITAL_IN_APP: boolean = Platform.OS !== 'ios';
