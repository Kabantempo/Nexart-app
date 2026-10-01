import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import { useEvents } from '../../hooks/useEvents';
import { usePublicCreators } from '../../hooks/usePublicCreators';
import { search, SearchEvent, SearchCreator } from '../../lib/searchUtils';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

type Tab = 'all' | 'events' | 'creators';
type Row =
  | { kind: 'header'; key: string; label: string }
  | { kind: 'event'; key: string; item: SearchEvent }
  | { kind: 'creator'; key: string; item: SearchCreator };

const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'events', label: 'Marchés' },
  { value: 'creators', label: 'Créateurs' },
];

export default function SearchScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const { events, loading: loadingEvents } = useEvents({ limit: 300 });
  const { creators, loading: loadingCreators } = usePublicCreators({ limit: 200 });
  const [text, setText] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  const results = useMemo(
    () => search(
      events as unknown as SearchEvent[],
      creators.map(c => ({ id: c.id, full_name: c.full_name ?? '', bio: c.bio ?? undefined, city: c.city ?? undefined, disciplines: c.disciplines ?? [] })),
      { text, type: tab },
    ),
    [events, creators, text, tab],
  );

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    if (tab !== 'creators' && results.events.length) {
      out.push({ kind: 'header', key: 'h-e', label: `Marchés (${results.events.length})` });
      results.events.forEach(e => out.push({ kind: 'event', key: `e-${e.id}`, item: e }));
    }
    if (tab !== 'events' && results.creators.length) {
      out.push({ kind: 'header', key: 'h-c', label: `Créateurs (${results.creators.length})` });
      results.creators.forEach(c => out.push({ kind: 'creator', key: `c-${c.id}`, item: c }));
    }
    return out;
  }, [results, tab]);

  const openEvent = (id: string) => {
    if (profile?.role === 'creator') {
      navigation.navigate('Creator', { screen: 'Marchés', params: { screen: 'EventDetail', params: { eventId: id } } });
    } else {
      Linking.openURL(`https://nexart.fr/events/${id}`);
    }
  };

  const loading = loadingEvents || loadingCreators;

  return (
    <View style={s.container}>
      <View style={s.searchBox}>
        <Ionicons name="search" size={18} color={colors.text.secondary} />
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder="Marché, ville, créateur, discipline…"
          placeholderTextColor={colors.text.secondary}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Rechercher"
        />
        {text ? (
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" onPress={() => setText('')} accessibilityLabel="Effacer">
            <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.value} style={[s.tab, tab === t.value && s.tabActive]} onPress={() => setTab(t.value)}
            accessibilityRole="tab" accessibilityState={{ selected: tab === t.value }}>
            <Text style={[s.tabText, tab === t.value && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={r => r.key}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={rows.length === 0 ? s.empty : { padding: spacing.md }}
          ListEmptyComponent={
            <Text style={s.emptyText}>
              {text.trim() ? `Aucun résultat pour « ${text.trim()} ».` : 'Saisissez un mot pour chercher un marché ou un créateur.'}
            </Text>
          }
          renderItem={({ item }) => {
            if (item.kind === 'header') return <Text style={s.header}>{item.label}</Text>;
            if (item.kind === 'event') {
              return (
                <TouchableOpacity style={s.card} onPress={() => openEvent(item.item.id)} activeOpacity={0.8}>
                  <Ionicons name="storefront-outline" size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{item.item.title}</Text>
                    <Text style={s.meta}>{[item.item.city, item.item.region].filter(Boolean).join(' · ')}</Text>
                  </View>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity style={s.card} activeOpacity={0.8}
                onPress={() => navigation.navigate('CreatorProfile', { creatorId: item.item.id })}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.item.full_name}</Text>
                  <Text style={s.meta}>
                    {[item.item.city, (item.item.disciplines ?? []).slice(0, 3).join(', ')].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, margin: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md,
  },
  input: { flex: 1, paddingVertical: spacing.sm, color: colors.text.primary, ...typography.body },
  tabs: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md },
  tab: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  tabActive: { borderColor: colors.primary, backgroundColor: colors.accent },
  tabText: { ...typography.label, color: colors.text.secondary },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  header: { ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: spacing.md, marginBottom: spacing.sm },
  empty: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.text.secondary },
});
