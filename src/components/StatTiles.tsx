import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../constants/theme';

export interface Tile { label: string; value: string }

/** Grille de chiffres clés, deux par ligne. */
export default function StatTiles({ tiles }: { tiles: Tile[] }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={s.grid}>
      {tiles.map(t => (
        <View key={t.label} style={s.tile}>
          <Text style={s.value}>{t.value}</Text>
          <Text style={s.label}>{t.label}</Text>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    flexBasis: '48%', flexGrow: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md,
  },
  value: { ...typography.h2, color: colors.text.primary },
  label: { ...typography.caption, color: colors.text.secondary },
});
