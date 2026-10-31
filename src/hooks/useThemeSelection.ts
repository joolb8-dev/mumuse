// Thème choisi par l'utilisateur, relu au chargement et enregistré à chaque changement.

import { useEffect, useState } from 'react'
import { preferencesApi } from '../api/preferencesApi'
import { themes } from '../data/themes'
import type { AppTheme } from '../types/theme'

const DEFAULT_THEME_INDEX = 0

function isValidThemeIndex(index: number | null): index is number {
  return index !== null && Number.isInteger(index) && index >= 0 && index < themes.length
}

export interface UseThemeSelectionResult {
  theme: AppTheme
  themeIndex: number
  selectTheme: (index: number) => void
}

export function useThemeSelection(): UseThemeSelectionResult {
  const [themeIndex, setThemeIndex] = useState(DEFAULT_THEME_INDEX)

  // relit le thème enregistré ; en cas d'échec on garde le thème par défaut
  useEffect(() => {
    preferencesApi
      .getThemeIndex()
      .then((saved) => {
        if (isValidThemeIndex(saved)) setThemeIndex(saved)
      })
      .catch(() => {})
  }, [])

  const selectTheme = (index: number) => {
    setThemeIndex(index)
    // la préférence est secondaire : un échec d'enregistrement ne bloque pas l'affichage
    preferencesApi.saveThemeIndex(index).catch(() => {})
  }

  return { theme: themes[themeIndex], themeIndex, selectTheme }
}
