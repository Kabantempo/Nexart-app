import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../stores/theme';
import { useEventExhibitors, EXHIBITOR_STATUS_LABELS } from '../../hooks/useEventExhibitors';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

export default function EventExhibitorsScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { exhibitors, loading, error, toCsv, refetch } = useEventExhibitors(eventId);

  const exportCsv = async () => {
    try {
      await Share.share({ title: `Exposants — ${eventTitle}`, message: toCsv() });
    } catch {
      Alert.alert('Export impossible', 'Le partage a échoué.');
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Retour" accessibilityRole="button" onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Exposants</Text>
          <Text style={s.subtitle} numberOfLines={1}>{eventTitle}</Text>
        </View>
        <TouchableOpacity onPress={exportCsv} disabled={exhibitors.length === 0} style={exhibitors.length === 0 && { opacity: 0.4 }}>
          <Text style={s.action}>Exporter CSV</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : error ? (
        <View style={s.center}>
          <Text style={s.empty}>{error}</Text>
          <TouchableOpacity style={s.retry} onPress={refetch}><Text style={s.retryText}>Réessayer</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={exhibitors}
          keyExtractor={e => e.id}
          contentContainerStyle={exhibitors.length === 0 ? s.center : { padding: spacing.md }}
          ListEmptyComponent={<Text style={s.empty}>Aucun exposant pour cet événement.</Text>}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.profiles.full_name ?? 'Exposant'}</Text>
                {item.profiles.email ? <Text style={s.mail} selectable>{item.profiles.email}</Text> : null}
                {item.proposed_stand ? (
                  <Text style={s.mail}>Stand {item.proposed_stand.size} · {item.proposed_stand.price} €</Text>
                ) : null}
              </View>
              <View style={s.badge}>
                <Text style={s.badgeText}>{EXHIBITOR_STATUS_LABELS[item.status] ?? item.status}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: { width: 32 },
  title: { ...typography.h3, color: colors.text.primary },
  subtitle: { ...typography.caption, color: colors.text.secondary },
  action: { ...typography.label, color: colors.primary, fontWeight: '600' },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  retry: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  retryText: { ...typography.label, color: '#fff', fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  mail: { ...typography.caption, color: colors.text.secondary },
  badge: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});
