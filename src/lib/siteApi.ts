import { supabase } from './supabase';

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://nexart.fr';

/** Appelle une route API du site avec le jeton de la session Supabase. */
export async function siteFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Non connecté');
  const res = await fetch(`${SITE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res;
}
