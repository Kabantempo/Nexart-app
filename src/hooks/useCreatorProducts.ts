import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demoData';

export interface Product {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[] | null;
  category: string | null;
  stock: number | null;
  is_available: boolean;
  featured_event_id: string | null;
}

export interface FeaturedEvent { id: string; title: string; city: string | null; start_date: string }

const demoProducts = (creatorId: string): Product[] => [
  { id: 'demo-p1', creator_id: creatorId, title: 'Bol en grès émaillé', description: 'Pièce unique tournée à la main, émail bleu cendré. Passe au lave-vaisselle.', price: 38, images: [], category: 'Céramique', stock: 2, is_available: true, featured_event_id: null },
  { id: 'demo-p2', creator_id: creatorId, title: 'Tasse à thé', description: 'Porcelaine fine, 15 cl.', price: 24, images: [], category: 'Céramique', stock: 12, is_available: true, featured_event_id: null },
];

/** Produits disponibles d'un créateur (`products`), lecture publique comme sur le site. */
export function useCreatorProducts(creatorId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Record<string, FeaturedEvent>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!creatorId) { setLoading(false); return; }
    if (DEMO_MODE) { setProducts(demoProducts(creatorId)); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('is_available', true)
      .order('created_at', { ascending: false });
    const list = (data ?? []) as Product[];
    setProducts(list);

    const ids = [...new Set(list.map(p => p.featured_event_id).filter((x): x is string => !!x))];
    if (ids.length) {
      const { data: evs } = await supabase.from('events').select('id, title, city, start_date').in('id', ids);
      const map: Record<string, FeaturedEvent> = {};
      ((evs ?? []) as FeaturedEvent[]).forEach(e => { map[e.id] = e; });
      setEvents(map);
    }
    setLoading(false);
  }, [creatorId]);

  useEffect(() => { load(); }, [load]);

  return { products, events, loading, refetch: load };
}
