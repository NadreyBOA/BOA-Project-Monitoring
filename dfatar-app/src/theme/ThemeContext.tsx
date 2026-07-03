import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getSetting, setSetting, SETTINGS_KEYS } from '../db/settings';
import { colors as baseColors, spacing, radius, fontSize } from '../utils/theme';
import { DEFAULT_PALETTE_ID, paletteById } from './palettes';

interface ThemeContextValue {
  themeId: string;
  isDark: boolean;
  colors: typeof baseColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  setThemeId: (id: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [themeId, setThemeIdState] = useState(DEFAULT_PALETTE_ID);

  useEffect(() => {
    getSetting(db, SETTINGS_KEYS.themeId).then((value) => {
      if (value) setThemeIdState(value);
    });
  }, [db]);

  const setThemeId = useCallback(
    async (id: string) => {
      setThemeIdState(id);
      await setSetting(db, SETTINGS_KEYS.themeId, id);
    },
    [db]
  );

  const palette = paletteById(themeId);
  const value: ThemeContextValue = {
    themeId,
    isDark: palette.isDark,
    colors: {
      ...baseColors,
      background: palette.background,
      surface: palette.surface,
      border: palette.border,
      text: palette.text,
      textMuted: palette.textMuted,
      primary: palette.primary,
      primaryMuted: palette.primaryMuted,
      payment: palette.primary,
    },
    spacing,
    radius,
    fontSize,
    setThemeId,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
