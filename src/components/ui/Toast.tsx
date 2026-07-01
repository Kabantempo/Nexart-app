import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ─── Single toast ─────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ComponentProps<typeof Ionicons>['name']> = {
  success: 'checkmark-circle',
  error:   'close-circle',
  info:    'information-circle',
};

const BG: Record<ToastType, string> = {
  success: colors.secondary,
  error:   colors.error,
  info:    colors.primary,
};

function Toast({ message, type, onHide }: { message: string; type: ToastType; onHide: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 20 }),
      Animated.delay(2200),
      Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onHide);
  }, []);

  return (
    <Animated.View style={[
      t.wrap,
      { backgroundColor: BG[type] },
      {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      },
    ]}>
      <Ionicons name={ICONS[type]} size={18} color="#fff" />
      <Text style={t.text} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current;
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const hide = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={t.container} pointerEvents="none">
        {toasts.map(item => (
          <Toast key={item.id} message={item.message} type={item.type} onHide={() => hide(item.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const t = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 90, left: spacing.xl, right: spacing.xl,
    zIndex: 9999, gap: spacing.xs,
  },
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  text: { ...typography.label, color: '#fff', flex: 1, fontWeight: '600' },
});
