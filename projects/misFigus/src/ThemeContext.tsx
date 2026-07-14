import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PALETTES, type ThemeColors, type ThemeMode } from './theme';

const STORAGE_KEY = 'tema-wc2026';

type ThemeCtx = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw === 'dark' || raw === 'light') setMode(raw);
    });
  }, []);

  const value = useMemo<ThemeCtx>(
    () => ({
      mode,
      colors: PALETTES[mode],
      toggle: () =>
        setMode((prev) => {
          const next = prev === 'dark' ? 'light' : 'dark';
          AsyncStorage.setItem(STORAGE_KEY, next);
          return next;
        }),
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

// Crea un hook de estilos temáticos. La fábrica corre una sola vez por paleta
// (cacheada por objeto de colores), así las 980 celdas comparten la misma
// StyleSheet en lugar de recrearla en cada render.
export function makeUseThemedStyles<T>(factory: (c: ThemeColors) => T) {
  const cache = new WeakMap<ThemeColors, T>();
  return function useThemedStyles(): T {
    const { colors } = useTheme();
    let styles = cache.get(colors);
    if (!styles) {
      styles = factory(colors);
      cache.set(colors, styles);
    }
    return styles;
  };
}
