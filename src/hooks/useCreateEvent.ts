import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { EventType, EventStatus } from '../types';
import { geocodeCity } from '../utils/geocode';

export interface EventFormData {
  title: string;
  description: string;
  event_type: EventType;
  city: string;
  region: string;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  stand_count: string;
  stand_price: string;
  stand_dimensions: string;
  discipline_tags: string[];
  rules: string;
  stripe_enabled: boolean;
}

export const EMPTY_FORM: EventFormData = {
  title: '',
  description: '',
  event_type: 'popup',
  city: '',
  region: '',
  location: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  stand_count: '',
  stand_price: '',
  stand_dimensions: '',
  discipline_tags: [],
  rules: '',
  stripe_enabled: false,
};

export function useCreateEvent() {
  const [saving, setSaving] = useState(false);

  const validate = (form: EventFormData): string | null => {
    if (!form.title.trim())       return 'Le titre est requis';
    if (!form.city.trim())        return 'La ville est requise';
    if (!form.start_date.match(/^\d{4}-\d{2}-\d{2}$/)) return 'Date de début invalide (format AAAA-MM-JJ)';
    if (!form.end_date.match(/^\d{4}-\d{2}-\d{2}$/))   return 'Date de fin invalide (format AAAA-MM-JJ)';
    if (form.end_date < form.start_date)                return 'La date de fin doit être après la date de début';
    if (!form.stand_count || isNaN(Number(form.stand_count))) return 'Nombre de stands invalide';
    if (form.discipline_tags.length === 0)              return 'Sélectionnez au moins une discipline';
    return null;
  };

  const save = async (
    organizerId: string,
    form: EventFormData,
    status: EventStatus = 'draft',
  ) => {
    const err = validate(form);
    if (err) return { error: err, data: null };

    setSaving(true);
    const payload = { organizer_id: organizerId, ...(await toPayload(form)), status };
    const { data, error } = await supabase.from('events').insert(payload).select().single();
    setSaving(false);
    return { error: error?.message ?? null, data };
  };

  /** Modifie un événement existant ; le statut (brouillon, publié, fermé) n'est pas touché. */
  const update = async (eventId: string, form: EventFormData) => {
    const err = validate(form);
    if (err) return { error: err, data: null };

    setSaving(true);
    const { data, error } = await supabase
      .from('events')
      .update(await toPayload(form))
      .eq('id', eventId)
      .select()
      .single();
    setSaving(false);
    return { error: error?.message ?? null, data };
  };

  return { save, update, saving };
}

async function toPayload(form: EventFormData) {
  const geo = form.city ? await geocodeCity(form.city, form.region) : null;
  return {
    lat:              geo?.lat ?? null,
    lng:              geo?.lng ?? null,
    title:            form.title.trim(),
    description:      form.description.trim() || null,
    event_type:       form.event_type,
    city:             form.city.trim(),
    region:           form.region.trim() || null,
    location:         form.location.trim() || null,
    start_date:       form.start_date,
    end_date:         form.end_date,
    start_time:       form.start_time || null,
    end_time:         form.end_time || null,
    stand_count:      Number(form.stand_count),
    stand_price:      form.stand_price !== '' ? Number(form.stand_price) : null,
    stand_dimensions: form.stand_dimensions.trim() || null,
    discipline_tags:  form.discipline_tags,
    rules:            form.rules.trim() || null,
    stripe_enabled:   form.stripe_enabled,
  };
}

/** Remplit le formulaire à partir d'un événement existant. */
export function formFromEvent(e: {
  title: string; description?: string | null; event_type: EventType; city?: string | null;
  region?: string | null; location?: string | null; start_date: string; end_date: string;
  start_time?: string | null; end_time?: string | null; stand_count?: number | null;
  stand_price?: number | null; stand_dimensions?: string | null; discipline_tags?: string[] | null;
  rules?: string | null; stripe_enabled?: boolean | null;
}): EventFormData {
  return {
    title:            e.title,
    description:      e.description ?? '',
    event_type:       e.event_type,
    city:             e.city ?? '',
    region:           e.region ?? '',
    location:         e.location ?? '',
    start_date:       e.start_date.slice(0, 10),
    end_date:         e.end_date.slice(0, 10),
    start_time:       e.start_time?.slice(0, 5) ?? '',
    end_time:         e.end_time?.slice(0, 5) ?? '',
    stand_count:      e.stand_count != null ? String(e.stand_count) : '',
    stand_price:      e.stand_price != null ? String(e.stand_price) : '',
    stand_dimensions: e.stand_dimensions ?? '',
    discipline_tags:  e.discipline_tags ?? [],
    rules:            e.rules ?? '',
    stripe_enabled:   !!e.stripe_enabled,
  };
}
