import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import { useCreatorDocuments, EVENT_DOCUMENT_LABELS } from '../../hooks/useEventDocuments';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { documents, loading, markDownloaded } = useCreatorDocuments(user?.id);

  const open = async (id: string, url: string | null | undefined) => {
    if (url) await Linking.openURL(url);
    await markDownloaded(id);
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.title}>Mes documents</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} color={colors.primary} />
      ) : (
        <FlatList
          data={documents}
          keyExtractor={d => d.id}
          contentContainerStyle={documents.length === 0 ? s.emptyWrap : { padding: spacing.md }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="document-text-outline" size={40} color={colors.text.secondary} />
              <Text style={s.emptyText}>Aucun document reçu pour l'instant.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => open(item.id, item.pdf_url)} activeOpacity={0.8}>
              <Ionicons name="document-text-outline" size={22} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{EVENT_DOCUMENT_LABELS[item.type]}</Text>
                <Text style={s.cardSub}>{item.event?.title ?? item.file_name}</Text>
              </View>
              {item.downloaded_at === null && <View style={s.dot} />}
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
  backBtn: { width: 40, alignItems: 'flex-start' },
  title: { ...typography.h3, color: colors.text.primary },
  emptyWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, color: colors.text.secondary, marginTop: spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  cardTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  cardSub: { ...typography.caption, color: colors.text.secondary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
