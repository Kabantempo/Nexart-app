import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Review, ReviewerRole } from '../types';

export function useProfileReviews(userId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false });
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const average = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  const isTrusted = reviews.length >= 5 && average !== null && average >= 4;

  return { reviews, loading, average, count: reviews.length, isTrusted, refetch: fetch };
}

export function useEventReviews(eventId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    supabase
      .from('reviews')
      .select('*')
      .eq('event_id', eventId)
      .eq('reviewer_role', 'creator')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => { setReviews((data as Review[]) ?? []); setLoading(false); });
  }, [eventId]);

  const average = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  return { reviews, average, count: reviews.length, loading };
}

export function useHasReviewed(eventId: string, reviewerId: string | undefined) {
  const [hasReviewed, setHasReviewed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!reviewerId) return;
    supabase
      .from('reviews')
      .select('id')
      .eq('event_id', eventId)
      .eq('reviewer_id', reviewerId)
      .maybeSingle()
      .then(({ data }) => setHasReviewed(!!data));
  }, [eventId, reviewerId]);

  return hasReviewed;
}

export async function submitReview(params: {
  eventId: string;
  reviewerId: string;
  reviewedId: string;
  reviewerRole: ReviewerRole;
  rating: number;
  comment: string;
  tags: string[];
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reviews').insert({
    event_id:      params.eventId,
    reviewer_id:   params.reviewerId,
    reviewed_id:   params.reviewedId,
    reviewer_role: params.reviewerRole,
    rating:        params.rating,
    comment:       params.comment.trim() || null,
    tags:          params.tags,
  });
  return { error: error?.message ?? null };
}
