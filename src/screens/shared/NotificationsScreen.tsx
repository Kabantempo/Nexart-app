import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import { useNotifications } from '../../hooks/useNotifications';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { notifications, unread, loading, markRead, markAllRead } = useNotifications(user?.id);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerSide}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead} style={[s.headerSide, { alignItems: 'flex-end' }]} disabled={unread === 0}>
          <Text style={[s.action, unread === 0 && { opacity: 0.4 }]}>Tout lire</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={n => n.id}
          contentContainerStyle={notifications.length === 0 ? s.emptyWrap : { padding: spacing.md }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="notifications-off-outline" size={40} color={colors.text.secondary} />
              <Text style={s.emptyText}>Aucune notification pour l'instant.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.card, !item.read_at && s.cardUnread]}
              onPress={() => { if (!item.read_at) markRead(item.id); }}
              activeOpacity={0.8}
            >
              {!item.read_at && <View style={s.dot} />}
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{item.title}</Text>
                {item.body ? <Text style={s.cardBody}>{item.body}</Text> : null}
                <Text style={s.cardDate}>{formatDate(item.created_at)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerSide: { width: 80 },
  title: { ...typography.h3, color: colors.text.primary },
  action: { ...typography.label, color: colors.primary, fontWeight: '600' },
  emptyWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, color: colors.text.secondary, marginTop: spacing.md },
  card: {
    flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  cardUnread: { borderColor: colors.primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
  cardTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  cardBody: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  cardDate: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xs },
});
