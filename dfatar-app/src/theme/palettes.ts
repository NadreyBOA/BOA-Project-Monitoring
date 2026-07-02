export interface Palette {
  id: string;
  name: string;
  free: boolean;
  primary: string;
  primaryMuted: string;
}

export const PALETTES: Palette[] = [
  { id: 'emerald', name: 'Émeraude', free: true, primary: '#1F7A4D', primaryMuted: '#E5F3EA' },
  { id: 'mono', name: 'Noir & Blanc', free: false, primary: '#1A1A1A', primaryMuted: '#EDEDED' },
  { id: 'slate', name: 'Ardoise', free: false, primary: '#3D5A73', primaryMuted: '#E7EDF1' },
  { id: 'ocean', name: 'Océan', free: false, primary: '#2563A6', primaryMuted: '#E4EEF7' },
];

export const DEFAULT_PALETTE_ID = 'emerald';

export function paletteById(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}
