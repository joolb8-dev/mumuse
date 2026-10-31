// Préférences de l'utilisateur : le thème choisi et la disposition des blocs.

import { LAYOUT_MODES, type LayoutMode } from '../types/layoutMode'
import { mockBackend } from './mockBackend'

export interface PreferencesApi {
  // Index du thème enregistré, ou null si l'utilisateur n'en a pas encore choisi.
  getThemeIndex(): Promise<number | null>
  saveThemeIndex(index: number): Promise<void>
  // Disposition enregistrée, ou null si absente ou inconnue.
  getLayoutMode(): Promise<LayoutMode | null>
  saveLayoutMode(mode: LayoutMode): Promise<void>
}

export const preferencesApi: PreferencesApi = {
  getThemeIndex: () => mockBackend.getThemeIndex(),
  saveThemeIndex: (index) => mockBackend.putThemeIndex(index),

  async getLayoutMode() {
    const saved = await mockBackend.getLayoutMode()
    return LAYOUT_MODES.find((mode) => mode === saved) ?? null
  },
  saveLayoutMode: (mode) => mockBackend.putLayoutMode(mode),
}
