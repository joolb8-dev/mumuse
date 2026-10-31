// Sauvegarde dans le navigateur (localStorage).
//
// Les données restent propres à ce navigateur et cet appareil. Chaque accès est
// protégé : le stockage peut être indisponible (navigation privée, données bloquées).
// Dans ce cas l'appli fonctionne quand même, sans mémoire entre deux visites.

import { chartTypes } from '../data/chartTypes'
import { initialBlocks } from '../data/initialBlocks'
import { themes } from '../data/themes'

const BLOCKS_KEY = 'mumuse-blocks'
const THEME_KEY = 'mumuse-theme'

// Un bloc enregistré est utilisable s'il a un id, un type connu et des tailles numériques.
function isValidBlock(block) {
  return (
    Boolean(block.id) &&
    Boolean(chartTypes[block.type]) &&
    Number.isFinite(block.width) &&
    Number.isFinite(block.height) &&
    Number.isFinite(block.order)
  )
}

// Blocs enregistrés, ou ceux de départ si rien (ou rien de valide) n'est enregistré.
export function loadBlocks() {
  try {
    const saved = JSON.parse(localStorage.getItem(BLOCKS_KEY))
    const isValid = Array.isArray(saved) && saved.length > 0 && saved.every(isValidBlock)
    return isValid ? saved : initialBlocks
  } catch {
    return initialBlocks
  }
}

export function saveBlocks(blocks) {
  try {
    localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks))
  } catch {
    // stockage indisponible : la disposition reste valable pour la session
  }
}

// Index du thème choisi (0 si absent ou invalide).
export function loadThemeIndex() {
  try {
    const saved = Number(localStorage.getItem(THEME_KEY))
    return Number.isInteger(saved) && saved >= 0 && saved < themes.length ? saved : 0
  } catch {
    return 0
  }
}

export function saveThemeIndex(index) {
  try {
    localStorage.setItem(THEME_KEY, String(index))
  } catch {
    // stockage indisponible : le thème reste valable pour la session
  }
}
