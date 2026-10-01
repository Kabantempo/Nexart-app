import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from './supabase';

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://nexart.fr';

export interface InvoiceSource {
  id: string;
  created_at: string;
  application_id: string | null;
  stripe_payment_id: string | null;
}

/** Numéro de facture, calculé comme sur le site. */
export const invoiceNumber = (p: InvoiceSource) =>
  `NX-${new Date(p.created_at).getFullYear()}-${(p.stripe_payment_id ?? p.id).slice(-8).toUpperCase()}`;

/**
 * Télécharge la facture PDF d'un paiement, générée par le site, puis l'ouvre :
 * enregistrement du fichier sur le web, feuille de partage sur téléphone.
 * Renvoie un message d'erreur, ou null en cas de succès.
 */
export async function downloadInvoice(p: InvoiceSource): Promise<string | null> {
  if (!p.application_id) return 'Aucune facture pour ce paiement.';
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return 'Non connecté';
    const res = await fetch(`${SITE_URL}/api/invoices/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ application_id: p.application_id, transaction_id: p.stripe_payment_id }),
    });
    if (!res.ok) return 'La facture n\'a pas pu être générée.';
    const name = `facture-nexart-${invoiceNumber(p)}.pdf`;
    const buffer = await res.arrayBuffer();

    if (Platform.OS === 'web') {
      const url = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      return null;
    }

    const file = new File(Paths.cache, name);
    if (file.exists) file.delete();
    file.create();
    file.write(new Uint8Array(buffer));
    if (!(await Sharing.isAvailableAsync())) return 'Le partage de fichiers n\'est pas disponible sur cet appareil.';
    await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: name, UTI: 'com.adobe.pdf' });
    return null;
  } catch {
    return 'Téléchargement impossible pour le moment.';
  }
}
