import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CreatorVerification, DisciplineProposal } from '../types';

/**
 * Badge « Créateur vérifié » — table `creator_verifications`.
 * Un admin approuve/refuse depuis le back-office du site ; l'app affiche
 * l'état et permet de déposer une demande.
 */
export function useCreatorVerification(creatorId: string | undefined) {
  const [verification, setVerification] = useState<CreatorVerification | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!creatorId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('creator_verifications')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setVerification((data as CreatorVerification | null) ?? null);
    setLoading(false);
  }, [creatorId]);

  useEffect(() => { fetch(); }, [fetch]);

  const submit = async (siret: string, documentUrl?: string | null) => {
    if (!creatorId) return { error: 'Non connecté' };
    const { error } = await supabase.from('creator_verifications').insert({
      creator_id: creatorId,
      siret: siret.replace(/\s/g, ''),
      document_url: documentUrl ?? null,
      status: 'pending',
    });
    if (!error) await fetch();
    return { error: error?.message ?? null };
  };

  return {
    verification,
    status: verification?.status ?? null,
    isVerified: verification?.status === 'approved',
    isPending:  verification?.status === 'pending',
    isRejected: verification?.status === 'rejected',
    rejectionReason: verification?.rejection_reason ?? null,
    loading,
    submit,
    refetch: fetch,
  };
}

/**
 * Disciplines hors liste proposées par le créateur (`discipline_proposals`),
 * validées par un admin avant d'apparaître sur le profil.
 */
export function useDisciplineProposals(creatorId: string | undefined) {
  const [proposals, setProposals] = useState<DisciplineProposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!creatorId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('discipline_proposals')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });
    setProposals((data ?? []) as DisciplineProposal[]);
    setLoading(false);
  }, [creatorId]);

  useEffect(() => { fetch(); }, [fetch]);

  const propose = async (name: string) => {
    if (!creatorId || !name.trim()) return { error: 'Nom vide' };
    const { error } = await supabase.from('discipline_proposals').insert({
      creator_id: creatorId,
      name: name.trim(),
      status: 'pending',
    });
    if (!error) await fetch();
    return { error: error?.message ?? null };
  };

  return {
    proposals,
    approved: proposals.filter(p => p.status === 'approved'),
    pending:  proposals.filter(p => p.status === 'pending'),
    loading,
    propose,
    refetch: fetch,
  };
}
