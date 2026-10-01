import { useCallback, useEffect, useState } from 'react';
import { siteFetch } from '../lib/siteApi';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  keywords: string[] | null;
}

/**
 * FAQ d'un événement, via l'API du site. Le site utilise ces questions pour
 * répondre automatiquement aux candidatures hors sujet ; il n'expose pas de
 * suppression, l'app se limite donc à la liste et à l'ajout.
 */
export function useEventFaqs(eventId: string) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/events/${eventId}/faqs?limit=200`);
      const json = await res.json();
      setFaqs((json.data ?? []) as Faq[]);
      setError(null);
    } catch {
      setError('Impossible de charger la FAQ.');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const add = async (question: string, answer: string, keywords: string) => {
    try {
      await siteFetch(`/api/events/${eventId}/faqs`, {
        method: 'POST',
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          keywords: keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean),
        }),
      });
      await fetchList();
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Action impossible pour le moment.';
    }
  };

  return { faqs, loading, error, add, refetch: fetchList };
}
