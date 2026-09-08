import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { EventDocument, EventDocumentType } from '../types';

export const EVENT_DOCUMENT_LABELS: Record<EventDocumentType, string> = {
  contrat:     'Contrat',
  reglement:   'Règlement',
  convocation: 'Convocation',
  facture:     'Facture',
};

/**
 * Documents envoyés par l'organisateur au créateur (`event_documents`) :
 * contrat, règlement, convocation, facture — générés en PDF côté site.
 * La RLS laisse le créateur voir les siens et marquer le téléchargement.
 */
export function useCreatorDocuments(creatorId: string | undefined) {
  const [documents, setDocuments] = useState<EventDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!creatorId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('event_documents')
      .select('*, event:events(id, title, start_date, city)')
      .eq('creator_id', creatorId)
      .order('sent_at', { ascending: false });
    setDocuments((data ?? []) as EventDocument[]);
    setLoading(false);
  }, [creatorId]);

  useEffect(() => { fetch(); }, [fetch]);

  /** Horodate l'ouverture — l'organisateur voit qui a bien reçu son document. */
  const markDownloaded = async (documentId: string) => {
    await supabase
      .from('event_documents')
      .update({ downloaded_at: new Date().toISOString() })
      .eq('id', documentId);
    setDocuments(prev =>
      prev.map(d => (d.id === documentId ? { ...d, downloaded_at: new Date().toISOString() } : d)),
    );
  };

  return {
    documents,
    unread: documents.filter(d => d.downloaded_at === null).length,
    loading,
    markDownloaded,
    refetch: fetch,
  };
}
