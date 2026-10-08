import * as SecureStore from 'expo-secure-store';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';
export const light = { paper: '#fcfcfb', card: '#ffffff', panel: '#f5f5f4', ink: '#1c1917', body: '#57534e', muted: '#78716c', border: '#e7e7e4', red: '#b91c1c', success: '#15803d', console: '#171513', consoleLine: '#332e2b', consoleMuted: '#78716c', consoleText: '#d6d3d1', score: '#1c1917', scoreText: '#ffffff', scoreMuted: '#d6d3d1' };
export const dark = { paper: '#141413', card: '#1e1e1d', panel: '#242422', ink: '#f5f5f4', body: '#d6d3d1', muted: '#a8a29e', border: '#353431', red: '#ef4444', success: '#4ade80', console: '#0e0e0d', consoleLine: '#393735', consoleMuted: '#a8a29e', consoleText: '#f5f5f4', score: '#f5f5f4', scoreText: '#1c1917', scoreMuted: '#57534e' };
type Theme = { mode: ThemeMode; colors: typeof light; toggle: () => void; ready: boolean };
const ThemeContext = createContext<Theme | null>(null);
const key = 'resumark-theme';

export function ResumarkThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);
  const mode: ThemeMode = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  useEffect(() => { void SecureStore.getItemAsync(key).then((saved) => { if (saved === 'light' || saved === 'dark' || saved === 'system') setPreference(saved); }).finally(() => setReady(true)); }, []);
  const value = useMemo(() => ({ mode, colors: mode === 'dark' ? dark : light, ready, toggle: () => setPreference((current) => { const currentMode = current === 'system' ? (system === 'dark' ? 'dark' : 'light') : current; const next: ThemeMode = currentMode === 'dark' ? 'light' : 'dark'; void SecureStore.setItemAsync(key, next); return next; }) }), [mode, ready, system]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useResumarkTheme() { const theme = useContext(ThemeContext); if (!theme) throw new Error('ResumarkThemeProvider is missing.'); return theme; }
