import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import { useTheme } from '../../stores/theme';
import { siteFetch } from '../../lib/siteApi';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_admin: boolean | null;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = { creator: 'Créateur', organizer: 'Organisateur', visitor: 'Visiteur', admin: 'Admin' };

/** Recherche d'utilisateurs en lecture seule, via la route admin du site (refusée aux non-admins). */
export default function AdminUsersScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await siteFetch(`/api/admin/users?limit=50&search=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      setUsers((json.data ?? []) as AdminUser[]);
      setTotal(json.count ?? 0);
      setError(null);
    } catch {
      setError('Impossible de charger les utilisateurs (accès réservé aux administrateurs).');
    }
    setLoading(false);
  }, []);

  // Recherche différée pour ne pas appeler le site à chaque frappe.
  useEffect(() => {
    const id = setTimeout(() => load(query), 350);
    return () => clearTimeout(id);
  }, [query, load]);

  return (
    <EventScreenShell title="Utilisateurs" subtitle={`${total} compte${total > 1 ? 's' : ''}`} onBack={() => navigation.goBack()}
      error={error} onRetry={() => load(query)}>
      <TextInput style={s.input} value={query} onChangeText={setQuery} placeholder="Nom ou e-mail" placeholderTextColor={colors.text.secondary}
        autoCapitalize="none" accessibilityLabel="Rechercher un utilisateur" />
      <FlatList
        data={users}
        keyExtractor={u => u.id}
        refreshing={loading}
        onRefresh={() => load(query)}
        contentContainerStyle={{ padding: spacing.md, paddingTop: 0 }}
        ListEmptyComponent={<Text style={s.empty}>{loading ? 'Chargement…' : 'Aucun utilisateur.'}</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.full_name ?? 'Sans nom'}</Text>
              <Text style={s.meta} selectable>{item.email ?? '—'}</Text>
              <Text style={s.meta}>Inscrit le {new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeText}>{item.is_admin ? 'Admin' : ROLE_LABELS[item.role ?? ''] ?? item.role ?? '—'}</Text>
            </View>
          </View>
        )}
      />
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  input: {
    margin: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.sm, color: colors.text.primary, ...typography.body,
  },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xl },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.text.secondary },
  badge: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});
