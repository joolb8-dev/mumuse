// Préférences de l'utilisateur (pour l'instant : le thème choisi).

import { mockBackend } from './mockBackend'

export interface PreferencesApi {
  // Index du thème enregistré, ou null si l'utilisateur n'en a pas encore choisi.
  getThemeIndex(): Promise<number | null>
  saveThemeIndex(index: number): Promise<void>
}

export const preferencesApi: PreferencesApi = {
  getThemeIndex: () => mockBackend.getThemeIndex(),
  saveThemeIndex: (index) => mockBackend.putThemeIndex(index),
}
