import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Referral } from '../types';

/** Lien de parrainage partagé — même forme que celui du site. */
export function referralLink(code: string): string {
  return `https://nexart.fr/register?ref=${encodeURIComponent(code)}`;
}

/**
 * Parrainage — `profiles.referral_code` + table `referrals`.
 * La RLS ne laisse voir que ses propres filleuls (`referrals_select_own`).
 */
export function useReferrals(userId: string | undefined) {
  const [code, setCode]           = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading]     = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    const [{ data: profile }, { data: rows }] = await Promise.all([
      supabase.from('profiles').select('referral_code').eq('id', userId).maybeSingle(),
      supabase.from('referrals').select('*').eq('referrer_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    setCode((profile as { referral_code: string | null } | null)?.referral_code ?? null);
    setReferrals((rows ?? []) as Referral[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const credited = referrals.filter(r => r.credited_at !== null).length;

  return {
    code,
    link: code ? referralLink(code) : null,
    referrals,
    total: referrals.length,
    /** Filleuls déjà transformés en crédits. */
    credited,
    /** Inscrits mais pas encore crédités. */
    pending: referrals.length - credited,
    loading,
    refetch: fetch,
  };
}
