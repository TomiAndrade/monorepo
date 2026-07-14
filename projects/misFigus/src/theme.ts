// Paleta WC2026 "Spectrum vibrante": magenta eléctrico + azul, moderno.
// Dos modos con buena diferencia de contraste entre claro y oscuro.

export type ThemeMode = 'dark' | 'light';

export type ThemeColors = {
  bg: string; // fondo de pantalla
  surface: string; // headers, search, tarjetas
  surfaceAlt: string; // celda "falta"
  border: string;
  borderStrong: string;
  text: string; // títulos
  textMuted: string; // secundario
  textFaint: string; // código de figurita que falta, placeholders
  primary: string; // acento magenta — progreso, estados activos, botones
  onPrimary: string; // texto sobre primary
  owned: string; // azul eléctrico — figurita "tengo"
  ownedBg: string; // fondo tinte de la celda "tengo"
  repe: string; // badge ámbar
  onRepe: string;
  danger: string;
  onDanger: string;
  tabBarBg: string;
};

const DARK: ThemeColors = {
  bg: '#0B0B12',
  surface: '#16161F',
  surfaceAlt: '#1B1B26',
  border: '#2A2A38',
  borderStrong: '#3C3C50',
  text: '#FFFFFF',
  textMuted: '#9595AC',
  textFaint: '#55556A',
  primary: '#FF2D87',
  onPrimary: '#FFFFFF',
  owned: '#3B82F6',
  ownedBg: '#152544',
  repe: '#FBBF24',
  onRepe: '#1A1205',
  danger: '#F87171',
  onDanger: '#1A0606',
  tabBarBg: '#0B0B12',
};

const LIGHT: ThemeColors = {
  bg: '#F6F6FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EBEBF2',
  border: '#E2E2EC',
  borderStrong: '#CFCFDD',
  text: '#13131D',
  textMuted: '#62627A',
  textFaint: '#A2A2B5',
  primary: '#E11D74',
  onPrimary: '#FFFFFF',
  owned: '#2563EB',
  ownedBg: '#DCE7FF',
  repe: '#D97706',
  onRepe: '#FFFFFF',
  danger: '#DC2626',
  onDanger: '#FFFFFF',
  tabBarBg: '#FFFFFF',
};

export const PALETTES: Record<ThemeMode, ThemeColors> = {
  dark: DARK,
  light: LIGHT,
};
