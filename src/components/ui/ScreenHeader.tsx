import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../constants/theme';

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.header, { paddingTop: insets.top + spacing.sm }]}>
      <View style={s.row}>
        {onBack ? (
          <TouchableOpacity style={s.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.placeholder} />
        )}
        {title ? <Text style={s.title} numberOfLines={1}>{title}</Text> : <View style={{ flex: 1 }} />}
        {right ? <View style={s.rightSlot}>{right}</View> : <View style={s.placeholder} />}
      </View>
    </View>
  );
}

export function useTopInset() {
  const insets = useSafeAreaInsets();
  return insets.top;
}

const s = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  row:         { flexDirection: 'row', alignItems: 'center' },
  backBtn:     { paddingVertical: spacing.xs, marginRight: spacing.sm },
  backText:    { ...typography.h2, color: colors.text.secondary, lineHeight: 28 },
  title:       { ...typography.h3, color: colors.text.primary, fontWeight: '700', flex: 1 },
  rightSlot:   { marginLeft: spacing.sm },
  placeholder: { width: 32 },
});
