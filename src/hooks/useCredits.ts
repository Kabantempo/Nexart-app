import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Credit, CreditTransaction } from '../types';

/**
 * Crédits utilisateur — miroir de `/api/credits/balance` du site.
 * Le solde est la SOMME des `credits.amount` (grand livre : les débits
 * sont des montants négatifs), pas une colonne dédiée.
 */
export function useCredits(userId: string | undefined) {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      const rows = (data ?? []) as Credit[];
      setBalance(rows.reduce((sum, r) => sum + r.amount, 0));
      setHistory(rows.slice(0, 20));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { balance, history, loading, error, refetch: fetch };
}

/** Achats de crédits Stripe (`credit_transactions`). */
export function useCreditTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setTransactions((data ?? []) as CreditTransaction[]);
        setLoading(false);
      });
  }, [userId]);

  return { transactions, loading };
}
