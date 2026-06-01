import React from 'react';
import {
  View, FlatList, StyleSheet, Text, TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

const CARD_RATIO = 0.78; // 78% de la largeur écran
const ITEM_GAP   = spacing.md;

interface HorizontalCardListProps<T> {
  data:         T[];
  renderCard:   (item: T, index: number) => React.ReactElement;
  title?:       string;
  seeAllLabel?: string;
  onSeeAll?:    () => void;
  emptyText?:   string;
  keyExtractor: (item: T) => string;
}

export function HorizontalCardList<T>({
  data, renderCard, title, seeAllLabel = 'Voir tout',
  onSeeAll, emptyText = 'Aucun résultat', keyExtractor,
}: HorizontalCardListProps<T>) {
  const { width: W } = useWindowDimensions();
  const cardWidth    = Math.min(W * CARD_RATIO, 300);

  return (
    <View style={s.container}>
      {title && (
        <View style={s.header}>
          <View style={s.headerAccent} />
          <Text style={s.headerTitle}>{title}</Text>
          {onSeeAll && (
            <TouchableOpacity onPress={onSeeAll} style={s.seeAllBtn}>
              <Text style={s.seeAllText}>{seeAllLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={data}
        horizontal
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + ITEM_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ width: ITEM_GAP }} />}
        renderItem={({ item, index }) => renderCard(item, index)}
        ListEmptyComponent={
          <View style={[s.empty, { width: cardWidth }]}>
            <Text style={s.emptyText}>{emptyText}</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: spacing.xl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  headerAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: colors.primary },
  headerTitle:  { ...typography.h3, color: colors.text.primary, fontWeight: '600', flex: 1 },
  seeAllBtn:    { paddingVertical: 4, paddingHorizontal: spacing.sm },
  seeAllText:   { ...typography.caption, color: colors.primary, fontWeight: '600' },
  list:         { paddingHorizontal: spacing.xl, paddingVertical: spacing.xs },
  empty: {
    height: 160, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24, borderWidth: 1,
    borderColor: colors.border, borderStyle: 'dashed',
  },
  emptyText: { ...typography.body, color: colors.text.secondary, fontStyle: 'italic' },
});
