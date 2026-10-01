import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

interface Version {
  version: string;
  date: string;
  name: string;
  features?: string[];
  improvements?: string[];
  fixes?: string[];
}

const SECTIONS: { key: 'features' | 'improvements' | 'fixes'; label: string }[] = [
  { key: 'features', label: 'Nouveautés' },
  { key: 'improvements', label: 'Améliorations' },
  { key: 'fixes', label: 'Corrections' },
];

/** Notes de version publiées par le site (`/patch-notes.json`, public). */
export default function PatchNotesScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const siteUrl = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://nexart.fr';
      const res = await fetch(`${siteUrl}/patch-notes.json`);
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setVersions((json.versions ?? []) as Version[]);
      setError(false);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={s.container}><ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} /></View>;

  if (error) {
    return (
      <View style={[s.container, s.center]}>
        <Text style={s.empty}>Impossible de charger les notes de version.</Text>
        <TouchableOpacity style={s.retry} onPress={load}><Text style={s.retryText}>Réessayer</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
      {versions.map(v => (
        <View key={v.version} style={s.card}>
          <Text style={s.title}>{v.name}</Text>
          <Text style={s.date}>{new Date(v.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          {SECTIONS.map(sec => (v[sec.key]?.length ? (
            <View key={sec.key} style={{ marginTop: spacing.sm }}>
              <Text style={s.section}>{sec.label}</Text>
              {v[sec.key]!.map((line, i) => <Text key={i} style={s.line}>• {line}</Text>)}
            </View>
          ) : null))}
        </View>
      ))}
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  retry: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  retryText: { ...typography.label, color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md,
  },
  title: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  date: { ...typography.caption, color: colors.text.secondary },
  section: { ...typography.caption, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  line: { ...typography.body, color: colors.text.secondary, marginBottom: 2 },
});
