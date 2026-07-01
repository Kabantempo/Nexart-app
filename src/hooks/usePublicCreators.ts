import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PublicCreatorProfile } from '../types';
import { DEMO_MODE, DEMO_CREATORS } from '../lib/demoData';

export function usePublicCreators(opts: { discipline?: string; city?: string; search?: string; limit?: number } = {}) {
  const [creators, setCreators] = useState<PublicCreatorProfile[]>([]);
  const [loading, setLoading]   = useState(true);

  const matchesSearch = useCallback((c: PublicCreatorProfile, q: string) => {
    const needle = q.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(needle) ||
      c.bio?.toLowerCase().includes(needle) ||
      c.city?.toLowerCase().includes(needle) ||
      c.region?.toLowerCase().includes(needle) ||
      c.disciplines?.some(d => d.toLowerCase().includes(needle))
    );
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select(`
        id, full_name, avatar_url, bio,
        creator_profile:creator_profiles(
          disciplines, city, region, portfolio_images,
          instagram, website, siret_verified, insurance_verified
        )
      `)
      .eq('role', 'creator')
      .not('creator_profile', 'is', null)
      .limit(opts.limit ?? 40);

    const { data } = await query;

    let result = (data ?? []).map((p: any) => ({
      id:                p.id,
      full_name:         p.full_name,
      avatar_url:        p.avatar_url,
      bio:               p.bio,
      disciplines:       p.creator_profile?.[0]?.disciplines ?? p.creator_profile?.disciplines ?? [],
      city:              p.creator_profile?.[0]?.city ?? p.creator_profile?.city ?? null,
      region:            p.creator_profile?.[0]?.region ?? p.creator_profile?.region ?? null,
      portfolio_images:  p.creator_profile?.[0]?.portfolio_images ?? p.creator_profile?.portfolio_images ?? [],
      instagram:         p.creator_profile?.[0]?.instagram ?? null,
      website:           p.creator_profile?.[0]?.website ?? null,
      siret_verified:    p.creator_profile?.[0]?.siret_verified ?? false,
      insurance_verified:p.creator_profile?.[0]?.insurance_verified ?? false,
    })) as PublicCreatorProfile[];

    if (opts.discipline) result = result.filter(c => c.disciplines.includes(opts.discipline!));
    if (opts.city)       result = result.filter(c => c.city?.toLowerCase().includes(opts.city!.toLowerCase()));
    if (opts.search?.trim()) result = result.filter(c => matchesSearch(c, opts.search!.trim()));

    if (DEMO_MODE && result.length === 0) {
      let demo = DEMO_CREATORS as unknown as PublicCreatorProfile[];
      if (opts.discipline) demo = demo.filter(c => c.disciplines.includes(opts.discipline!));
      if (opts.city)       demo = demo.filter(c => c.city?.toLowerCase().includes(opts.city!.toLowerCase()));
      if (opts.search?.trim()) demo = demo.filter(c => matchesSearch(c, opts.search!.trim()));
      setCreators(demo.slice(0, opts.limit ?? 40));
    } else {
      setCreators(result);
    }
    setLoading(false);
  }, [opts.discipline, opts.city, opts.search, opts.limit, matchesSearch]);

  useEffect(() => { fetch(); }, [fetch]);

  return { creators, loading, refetch: fetch };
}

export function usePublicCreatorProfile(creatorId: string | undefined) {
  const [creator, setCreator]         = useState<PublicCreatorProfile | null>(null);
  const [upcomingEvents, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!creatorId) return;
    Promise.all([
      supabase.from('profiles').select(`
        id, full_name, avatar_url, bio, created_at,
        creator_profile:creator_profiles(
          disciplines, city, region, portfolio_images,
          instagram, website, siret_verified, insurance_verified, page_settings
        )
      `).eq('id', creatorId).single(),

      supabase.from('applications')
        .select('event:events(id, title, city, start_date, end_date, stand_price, discipline_tags)')
        .eq('creator_id', creatorId)
        .eq('status', 'accepted')
        .gte('event.start_date', new Date().toISOString().slice(0, 10))
        .order('event.start_date', { ascending: true })
        .limit(5),
    ]).then(([{ data: p }, { data: apps }]) => {
      if (p) {
        const cp = (p as any).creator_profile;
        const profile = Array.isArray(cp) ? cp[0] : cp;
        setCreator({
          id: p.id, full_name: (p as any).full_name, avatar_url: (p as any).avatar_url, bio: (p as any).bio,
          disciplines: profile?.disciplines ?? [], city: profile?.city ?? null, region: profile?.region ?? null,
          portfolio_images: profile?.portfolio_images ?? [], instagram: profile?.instagram ?? null,
          website: profile?.website ?? null, siret_verified: profile?.siret_verified ?? false,
          insurance_verified: profile?.insurance_verified ?? false,
          page_settings: profile?.page_settings ?? null,
          created_at: (p as any).created_at ?? null,
        });
      }
      setUpcoming((apps ?? []).map((a: any) => a.event).filter(Boolean));
      setLoading(false);
    });
  }, [creatorId]);

  return { creator, upcomingEvents, loading };
}
