import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../stores/theme';
import { useEventWaitlist, WaitlistEntry } from '../../hooks/useEventWaitlist';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

export default function EventWaitlistScreen({ route, navigation }: any) {
  const { eventId, eventTitle } = route.params as { eventId: string; eventTitle: string };
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { waiting, promoted, loading, error, busyId, promote, remove, refetch } = useEventWaitlist(eventId);

  const onPromote = (e: WaitlistEntry) =>
    Alert.alert(
      'Proposer la place ?',
      `${e.profiles?.full_name ?? 'Cet exposant'} sera prévenu par notification, push et e-mail.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Proposer',
          onPress: async () => {
            const err = await promote(e.id);
            if (err) Alert.alert('Erreur', err);
          },
        },
      ],
    );

  const onRemove = (e: WaitlistEntry) =>
    Alert.alert('Retirer de la liste ?', e.profiles?.full_name ?? '', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          const err = await remove(e.id);
          if (err) Alert.alert('Erreur', err);
        },
      },
    ]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Retour" accessibilityRole="button" onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Liste d'attente</Text>
          <Text style={s.subtitle} numberOfLines={1}>{eventTitle}</Text>
        </View>
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
          data={waiting}
          keyExtractor={e => e.id}
          contentContainerStyle={waiting.length === 0 ? s.center : { padding: spacing.md }}
          ListHeaderComponent={
            waiting.length > 0 ? (
              <Text style={s.count}>
                {waiting.length} en attente · {promoted.length} {promoted.length > 1 ? 'promus' : 'promu'}
              </Text>
            ) : null
          }
          ListEmptyComponent={<Text style={s.empty}>Personne n'est en attente.</Text>}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.rank}><Text style={s.rankText}>{item.position}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.profiles?.full_name ?? 'Exposant'}</Text>
                {item.profiles?.email ? <Text style={s.mail}>{item.profiles.email}</Text> : null}
              </View>
              {busyId === item.id ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <View style={s.actions}>
                  <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" style={s.promoteBtn} onPress={() => onPromote(item)} accessibilityLabel="Proposer la place">
                    <Ionicons name="arrow-up" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" style={s.removeBtn} onPress={() => onRemove(item)} accessibilityLabel="Retirer">
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
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
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  retry: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  retryText: { ...typography.label, color: '#fff', fontWeight: '600' },
  count: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  rank: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { ...typography.label, color: colors.primary, fontWeight: '700' },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  mail: { ...typography.caption, color: colors.text.secondary },
  actions: { flexDirection: 'row', gap: spacing.sm },
  promoteBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  removeBtn: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.error + '60',
    alignItems: 'center', justifyContent: 'center',
  },
});
