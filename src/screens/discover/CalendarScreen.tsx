import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import { useEvents } from '../../hooks/useEvents';
import { Event } from '../../types';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (d: Date) =>
  d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

const dayRange = (e: Event) => {
  const a = new Date(e.start_date);
  const b = new Date(e.end_date);
  const day = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return a.toDateString() === b.toDateString() ? day(a) : `${day(a)} → ${day(b)}`;
};

/** Un événement apparaît dans chaque mois qu'il traverse. */
const overlapsMonth = (e: Event, key: string) => {
  const [y, m] = key.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0, 23, 59, 59);
  return new Date(e.start_date) <= last && new Date(e.end_date) >= first;
};

export default function CalendarScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const { events, loading } = useEvents({ limit: 300 });
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const shift = (delta: number) => setCursor(c => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  const key = monthKey(cursor);
  const list = events.filter(e => overlapsMonth(e, key));

  const open = (e: Event) => {
    if (profile?.role === 'creator') {
      navigation.navigate('Creator', { screen: 'Marchés', params: { screen: 'EventDetail', params: { eventId: e.id } } });
    } else {
      Linking.openURL(`https://nexart.fr/events/${e.id}`);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.pager}>
        <TouchableOpacity onPress={() => shift(-1)} style={s.pagerBtn} accessibilityLabel="Mois précédent">
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.month}>{monthLabel(cursor)}</Text>
        <TouchableOpacity onPress={() => shift(1)} style={s.pagerBtn} accessibilityLabel="Mois suivant">
          <Ionicons name="chevron-forward" size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={e => e.id}
          contentContainerStyle={list.length === 0 ? s.empty : { padding: spacing.md }}
          ListEmptyComponent={<Text style={s.emptyText}>Aucun marché en {monthLabel(cursor)}.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => open(item)} activeOpacity={0.8}>
              <Text style={s.date}>{dayRange(item)}</Text>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.meta}>{[item.city, item.region].filter(Boolean).join(' · ')}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pager: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pagerBtn: { padding: spacing.sm },
  month: { ...typography.h3, color: colors.text.primary, textTransform: 'capitalize' },
  empty: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: 2,
  },
  date: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  title: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.text.secondary },
});
