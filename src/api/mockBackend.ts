// Faux backend utilisé tant qu'il n'y a pas de vrai serveur.
//
// Il imite un serveur : réponses asynchrones avec un délai, formes DTO, et
// échecs possibles. L'interface voit donc les états de chargement et d'erreur
// dès maintenant, et n'aura rien à changer quand le vrai backend arrivera.
// Les données sont gardées dans le localStorage du navigateur, à la place de
// la base de données d'un serveur.

import type { BlockDto } from './dtos'

// Réglages du faux serveur. Pour tester les écrans d'erreur, mettre
// failureRate à 1 (toutes les requêtes échouent).
export const mockConfig = {
  delayMs: 300,
  failureRate: 0,
}

const BLOCKS_STORAGE_KEY = 'mumuse-api-blocks'
const THEME_STORAGE_KEY = 'mumuse-theme'
const LAYOUT_MODE_STORAGE_KEY = 'mumuse-layout-mode'

// Blocs renvoyés tant que rien n'a été enregistré.
const initialBlockDtos: BlockDto[] = [
  { block_id: 'ventes', chart_type: 'bar', w: 400, h: 300, position: 0 },
  { block_id: 'repartition', chart_type: 'donut', w: 400, h: 300, position: 1 },
  { block_id: 'evolution', chart_type: 'line', w: 400, h: 300, position: 2 },
  { block_id: 'nuage', chart_type: 'scatter', w: 600, h: 300, position: 3 },
  { block_id: 'objectif', chart_type: 'gauge', w: 400, h: 300, position: 4 },
]

// Simule la latence réseau et, parfois, une panne.
async function simulateNetwork(delayMs = mockConfig.delayMs): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs))
  if (Math.random() < mockConfig.failureRate) {
    throw new Error('Le serveur ne répond pas')
  }
}

// Lecture JSON tolérante : stockage indisponible ou contenu corrompu = pas de donnée.
function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // stockage indisponible : la donnée reste valable pour la session seulement
  }
}

export const mockBackend = {
  async getBlocks(): Promise<BlockDto[]> {
    await simulateNetwork()
    const saved = readJson(BLOCKS_STORAGE_KEY)
    // le contenu relu est supposé être ce que ce faux serveur a écrit lui-même
    return Array.isArray(saved) && saved.length > 0 ? (saved as BlockDto[]) : initialBlockDtos
  },

  async putBlocks(blocks: BlockDto[]): Promise<void> {
    await simulateNetwork()
    writeJson(BLOCKS_STORAGE_KEY, blocks)
  },

  // Préférence d'affichage : pas de délai, pour ne pas faire clignoter le thème.
  async getThemeIndex(): Promise<number | null> {
    await simulateNetwork(0)
    const saved = readJson(THEME_STORAGE_KEY)
    return typeof saved === 'number' ? saved : null
  },

  async putThemeIndex(index: number): Promise<void> {
    await simulateNetwork(0)
    writeJson(THEME_STORAGE_KEY, index)
  },

  async getLayoutMode(): Promise<string | null> {
    await simulateNetwork(0)
    const saved = readJson(LAYOUT_MODE_STORAGE_KEY)
    return typeof saved === 'string' ? saved : null
  },

  async putLayoutMode(mode: string): Promise<void> {
    await simulateNetwork(0)
    writeJson(LAYOUT_MODE_STORAGE_KEY, mode)
  },
}
