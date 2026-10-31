// Les deux façons de disposer les blocs sur la grille.

export const LAYOUT_MODES = ['auto', 'free'] as const
export type LayoutMode = (typeof LAYOUT_MODES)[number]

// Libellés des boutons de la barre du haut.
export const LAYOUT_MODE_LABELS: Record<LayoutMode, string> = {
  auto: 'Disposition automatique',
  free: 'Disposition libre',
}
