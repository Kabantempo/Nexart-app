import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme, ThemeColors, getColors } from '../constants/theme';

/**
 * Thème clair/sombre — pendant app du sélecteur de thème du site
 * (`lib/use-theme.ts` + `data-theme` sur <html>).
 *
 * 'system' suit le réglage iOS/Android ; 'light'/'dark' forcent.
 * La préférence est persistée dans AsyncStorage sous `nexart.theme`.
 */
export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'nexart.theme';

export interface ThemeState {
  /** Ce que l'utilisateur a choisi. */
  preference: ThemePreference;
  /** Ce qui est réellement affiché, une fois 'system' résolu. */
  scheme: ColorScheme;
  /** Palette correspondante. */
  colors: ThemeColors;
  setPreference: (p: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeState>({
  preference: 'system',
  scheme: 'light',
  colors: getColors('light'),
  setPreference: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    AsyncStorage.setItem(STORAGE_KEY, p);
  }, []);

  const scheme: ColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeState>(
    () => ({ preference, scheme, colors: getColors(scheme), setPreference }),
    [preference, scheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Raccourci pour les composants qui n'ont besoin que de la palette. */
export const useThemeColors = () => useContext(ThemeContext).colors;
