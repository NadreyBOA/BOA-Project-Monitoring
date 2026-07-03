export interface Palette {
  id: string;
  name: string;
  free: boolean;
  isDark: boolean;
  swatch: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryMuted: string;
}

export const PALETTES: Palette[] = [
  {
    id: 'light',
    name: 'Clair',
    free: true,
    isDark: false,
    swatch: '#1F8F5C',
    background: '#F6F7F6',
    surface: '#FFFFFF',
    border: '#E4E7E4',
    text: '#1B211D',
    textMuted: '#6B746E',
    primary: '#1F8F5C',
    primaryMuted: '#E3F5EC',
  },
  {
    id: 'dark',
    name: 'Sombre',
    free: false,
    isDark: true,
    swatch: '#171820',
    background: '#14151A',
    surface: '#1D1F26',
    border: '#2C2F38',
    text: '#ECEDF0',
    textMuted: '#9A9DA8',
    primary: '#4FD1A5',
    primaryMuted: '#1E3B33',
  },
  {
    id: 'violet',
    name: 'Violet',
    free: false,
    isDark: false,
    swatch: '#7C5CFC',
    background: '#F8F7FC',
    surface: '#FFFFFF',
    border: '#E7E3F5',
    text: '#211B2E',
    textMuted: '#71698A',
    primary: '#7C5CFC',
    primaryMuted: '#EDE8FE',
  },
  {
    id: 'pink',
    name: 'Rose',
    free: false,
    isDark: false,
    swatch: '#E85D8A',
    background: '#FDF7F9',
    surface: '#FFFFFF',
    border: '#F5E1E8',
    text: '#2B1B21',
    textMuted: '#8A6B75',
    primary: '#E85D8A',
    primaryMuted: '#FCE8EF',
  },
];

export const DEFAULT_PALETTE_ID = 'light';

export function paletteById(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}
