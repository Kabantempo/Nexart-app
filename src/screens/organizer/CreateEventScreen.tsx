import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Switch,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../stores/auth';
import { useCreateEvent, EMPTY_FORM, EventFormData, formFromEvent } from '../../hooks/useCreateEvent';
import { DISCIPLINE_TAGS, EventType } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

const EVENT_TYPES: { label: string; value: EventType }[] = [
  { label: 'Marché',     value: 'marche' },
  { label: 'Pop-up',     value: 'popup' },
  { label: 'Salon',      value: 'salon' },
  { label: 'Foire',      value: 'fair' },
  { label: 'Permanent',  value: 'permanent' },
  { label: 'Saisonnier', value: 'seasonal' },
];

// ─── Reusable field components ────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: spacing.xs, marginTop: spacing.lg }}>
      <Text style={styles.label}>{children}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

function Field({
  label, hint, value, onChange, placeholder, multiline, keyboardType, maxLength,
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  multiline?: boolean; keyboardType?: any; maxLength?: number;
}) {
  return (
    <>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      />
    </>
  );
}

// ─── Discipline picker ────────────────────────────────────────────────────────

function DisciplinePicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) onChange(selected.filter(t => t !== tag));
    else onChange([...selected, tag]);
  };
  return (
    <View style={styles.tagWrap}>
      {DISCIPLINE_TAGS.map(tag => {
        const active = selected.includes(tag);
        return (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, active && styles.tagActive]}
            onPress={() => toggle(tag)}
          >
            <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CreateEventScreen({ route, navigation }: any) {
  const { profile } = useAuth();
  const { save, update, saving } = useCreateEvent();
  const [form, setForm] = useState<EventFormData>({ ...EMPTY_FORM });
  const eventId: string | undefined = route?.params?.eventId;
  const [loadingEvent, setLoadingEvent] = useState(!!eventId);

  useEffect(() => {
    if (!eventId) return;
    supabase.from('events').select('*').eq('id', eventId).single().then(({ data }) => {
      if (data) setForm(formFromEvent(data as any));
      setLoadingEvent(false);
    });
  }, [eventId]);

  const set = (key: keyof EventFormData) => (value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleUpdate = async () => {
    if (!eventId) return;
    const { error } = await update(eventId, form);
    if (error) { Alert.alert('Erreur', error); return; }
    Alert.alert('Modifications enregistrées', undefined, [{ text: 'OK', onPress: () => navigation?.goBack() }]);
  };

  const handleSave = async (publish: boolean) => {
    if (!profile?.id) return;
    const { error, data } = await save(profile.id, form, publish ? 'published' : 'draft');
    if (error) { Alert.alert('Erreur', error); return; }
    Alert.alert(
      publish ? 'Marché publié !' : 'Brouillon enregistré',
      publish
        ? 'Votre marché est maintenant visible par les artisans.'
        : 'Vous pourrez le publier depuis "Mes marchés".',
      [{ text: 'OK', onPress: () => setForm({ ...EMPTY_FORM }) }],
    );
  };

  if (loadingEvent) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{eventId ? 'Modifier le marché' : 'Créer un marché'}</Text>

      {/* Infos générales */}
      <Field label="Nom du marché" value={form.title} onChange={set('title')} placeholder="Ex : Marché de Noël de Lyon" />

      <FieldLabel>Type d'événement</FieldLabel>
      <View style={styles.typeRow}>
        {EVENT_TYPES.map(t => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeChip, form.event_type === t.value && styles.typeChipActive]}
            onPress={() => setForm(f => ({ ...f, event_type: t.value }))}
          >
            <Text style={[styles.typeChipText, form.event_type === t.value && styles.typeChipTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Description" hint="(optionnel)" value={form.description} onChange={set('description')} placeholder="Décrivez votre marché…" multiline />

      {/* Localisation */}
      <Text style={styles.sectionTitle}>Localisation</Text>
      <Field label="Adresse / lieu" hint="(optionnel)" value={form.location} onChange={set('location')} placeholder="Ex : Parc de la Tête d'Or" />
      <Field label="Ville" value={form.city} onChange={set('city')} placeholder="Ex : Lyon" />
      <Field label="Région" hint="(optionnel)" value={form.region} onChange={set('region')} placeholder="Ex : Auvergne-Rhône-Alpes" />

      {/* Dates */}
      <Text style={styles.sectionTitle}>Dates</Text>
      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <Field label="Date de début" value={form.start_date} onChange={set('start_date')} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Date de fin" value={form.end_date} onChange={set('end_date')} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
        </View>
      </View>
      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <Field label="Heure ouverture" hint="(optionnel)" value={form.start_time} onChange={set('start_time')} placeholder="09:00" keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Heure fermeture" hint="(optionnel)" value={form.end_time} onChange={set('end_time')} placeholder="18:00" keyboardType="numeric" />
        </View>
      </View>

      {/* Stands */}
      <Text style={styles.sectionTitle}>Stands</Text>
      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <Field label="Nombre de stands" value={form.stand_count} onChange={set('stand_count')} placeholder="Ex : 40" keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Prix du stand (€)" hint="0 = gratuit" value={form.stand_price} onChange={set('stand_price')} placeholder="Ex : 80" keyboardType="numeric" />
        </View>
      </View>
      <Field label="Dimensions" hint="(optionnel)" value={form.stand_dimensions} onChange={set('stand_dimensions')} placeholder="Ex : 3m × 2m" />

      {/* Disciplines */}
      <Text style={styles.sectionTitle}>Disciplines recherchées</Text>
      <DisciplinePicker
        selected={form.discipline_tags}
        onChange={tags => setForm(f => ({ ...f, discipline_tags: tags }))}
      />
      <Text style={styles.selectedCount}>{form.discipline_tags.length} discipline{form.discipline_tags.length !== 1 ? 's' : ''} sélectionnée{form.discipline_tags.length !== 1 ? 's' : ''}</Text>

      {/* Règlement */}
      <Field label="Règlement" hint="(optionnel)" value={form.rules} onChange={set('rules')} placeholder="Commission, assurance requise, setup…" multiline />

      {/* Paiement en ligne */}
      <Text style={styles.sectionTitle}>Paiement en ligne</Text>
      <View style={styles.stripeCard}>
        <View style={styles.stripeRow}>
          <View style={styles.stripeIconWrap}>
            <Ionicons name="card-outline" size={20} color={form.stripe_enabled ? colors.primary : colors.text.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stripeLabel}>Activer le paiement Stripe</Text>
            <Text style={styles.stripeSub}>Le créateur paie son stand en ligne à la validation</Text>
          </View>
          <Switch
            value={form.stripe_enabled}
            onValueChange={v => setForm(f => ({ ...f, stripe_enabled: v }))}
            trackColor={{ false: colors.border, true: colors.primary + '60' }}
            thumbColor={form.stripe_enabled ? colors.primary : colors.text.secondary}
          />
        </View>
        {form.stripe_enabled && (
          <View style={styles.stripeInfo}>
            <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
            <Text style={styles.stripeInfoText}>
              Le montant facturé sera le prix du stand renseigné ci-dessus ({form.stand_price || '0'} €).
              Assurez-vous que votre compte Stripe est actif.
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {eventId ? (
          <TouchableOpacity
            style={[styles.btnPublish, saving && { opacity: 0.5 }]}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color={colors.text.inverse} />
              : <Text style={styles.btnPublishText}>Enregistrer les modifications</Text>
            }
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.btnDraft, saving && { opacity: 0.5 }]}
              onPress={() => handleSave(false)}
              disabled={saving}
            >
              <Text style={styles.btnDraftText}>Enregistrer en brouillon</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPublish, saving && { opacity: 0.5 }]}
              onPress={() => handleSave(true)}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={colors.text.inverse} />
                : <Text style={styles.btnPublishText}>Publier maintenant</Text>
              }
            </TouchableOpacity>
          </>
        )}
        {eventId && (
          <TouchableOpacity style={styles.btnDraft} onPress={() => navigation?.goBack()}>
            <Text style={styles.btnDraftText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xl },

  sectionTitle: {
    ...typography.label, color: colors.text.secondary, textTransform: 'uppercase',
    letterSpacing: 1, marginTop: spacing.xl, marginBottom: 0,
    borderBottomWidth: 1, borderColor: colors.border, paddingBottom: spacing.xs,
  },

  label: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11 },
  hint:  { ...typography.caption, color: colors.text.secondary + '99' },

  input: {
    backgroundColor: colors.surface, color: colors.text.primary,
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top' },

  dateRow: { flexDirection: 'row', gap: spacing.sm },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  typeChip: {
    paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  typeChipTextActive: { color: colors.text.inverse, fontWeight: '700' },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { ...typography.caption, color: colors.text.secondary },
  tagTextActive: { color: colors.text.inverse, fontWeight: '600' },
  selectedCount: { ...typography.caption, color: colors.primary, marginTop: spacing.sm },

  stripeCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginTop: spacing.sm,
  },
  stripeRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stripeIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  stripeLabel: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  stripeSub:   { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  stripeInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
    marginTop: spacing.md, backgroundColor: colors.primary + '10',
    borderRadius: radius.sm, padding: spacing.sm,
  },
  stripeInfoText: { ...typography.caption, color: colors.primary, flex: 1, lineHeight: 16 },

  actions: { gap: spacing.sm, marginTop: spacing.xxl },
  btnDraft: {
    padding: spacing.md, borderRadius: radius.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  btnDraftText: { ...typography.label, color: colors.text.secondary, fontWeight: '600' },
  btnPublish: {
    padding: spacing.md, borderRadius: radius.md, alignItems: 'center',
    backgroundColor: colors.primary,
  },
  btnPublishText: { ...typography.label, color: colors.text.inverse, fontWeight: '700', fontSize: 15 },
});
