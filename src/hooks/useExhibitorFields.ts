import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type FieldType = 'text' | 'textarea' | 'checkbox' | 'select' | 'number';

export interface ExhibitorField {
  id?: string;
  field_name: string;
  field_label: string;
  field_type: FieldType;
  options: string[] | null;
  required: boolean;
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Texte',
  textarea: 'Texte long',
  number: 'Nombre',
  checkbox: 'Case à cocher',
  select: 'Choix',
};

/** Identifiant technique d'un champ, dérivé de son libellé comme sur le site. */
export const fieldNameFromLabel = (label: string) => label.toLowerCase().replace(/[^a-z0-9]/g, '_');

/**
 * Champs personnalisés du formulaire exposant d'un événement.
 * Lecture et écriture passent directement par Supabase : les règles d'accès
 * limitent la modification à l'organisateur de l'événement.
 */
export function useExhibitorFields(eventId: string) {
  const [fields, setFields] = useState<ExhibitorField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('event_exhibitor_fields')
      .select('id, field_name, field_label, field_type, options, required')
      .eq('event_id', eventId)
      .order('field_order', { ascending: true });
    if (err) setError('Impossible de charger les champs.');
    else { setFields((data ?? []) as ExhibitorField[]); setError(null); }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchFields(); }, [fetchFields]);

  /** Remplace l'ensemble des champs, comme l'enregistrement en bloc du site. */
  const save = async (next: ExhibitorField[]): Promise<string | null> => {
    const { error: delErr } = await supabase.from('event_exhibitor_fields').delete().eq('event_id', eventId);
    if (delErr) return 'Enregistrement impossible.';
    if (next.length > 0) {
      const rows = next.map((f, i) => ({
        event_id: eventId,
        field_name: f.field_name,
        field_label: f.field_label,
        field_type: f.field_type,
        options: f.field_type === 'select' ? f.options : null,
        required: f.required,
        field_order: i,
      }));
      const { error: insErr } = await supabase.from('event_exhibitor_fields').insert(rows);
      if (insErr) return 'Enregistrement impossible.';
    }
    await fetchFields();
    return null;
  };

  return { fields, loading, error, save, refetch: fetchFields };
}
