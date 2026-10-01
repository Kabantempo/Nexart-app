import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

/** Lecture JSON d'une route API du site avec le jeton de la session (tableaux de bord en lecture seule). */
export function useSiteData<T>(path: string, errorMessage: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(path);
      setData((await res.json()) as T);
      setError(null);
    } catch {
      setError(errorMessage);
    }
    setLoading(false);
  }, [path, errorMessage]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

export const euros = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
