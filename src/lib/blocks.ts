// Fonctions pures sur des listes de blocs.

import type { LayoutItem } from 'react-grid-layout'
import type { Block } from '../types/block'
import type { LayoutMode } from '../types/layoutMode'

// Deux listes sont égales si elles contiennent les mêmes blocs avec les mêmes
// valeurs, quel que soit leur ordre dans le tableau. Sert à savoir si une copie
// en cours de modification diffère de la version enregistrée.
export function areBlocksEqual(a: Block[], b: Block[], mode: LayoutMode): boolean {
  if (a.length !== b.length) return false

  const blockById = new Map(b.map((block) => [block.id, block]))
  return a.every((block) => {
    const other = blockById.get(block.id)
    if (!other) return false

    const sameFields =
      other.type === block.type &&
      other.width === block.width &&
      other.height === block.height &&
      other.order === block.order &&
      other.locked === block.locked

    // La position (x, y) ne compte que là où elle a un sens : pour tous les blocs en
    // disposition libre, pour les seuls blocs verrouillés en disposition automatique.
    const positionMatters = mode === 'free' || block.locked
    const samePosition = other.x === block.x && other.y === block.y

    return sameFields && (!positionMatters || samePosition)
  })
}

// Verrouille un bloc à sa place actuelle (`item`, sa position dans la grille), ou le
// déverrouille s'il l'était. Les autres blocs ne changent pas.
export function toggleLock(blocks: Block[], blockId: string, item: LayoutItem | undefined): Block[] {
  return blocks.map((block) => {
    if (block.id !== blockId) return block
    // c'est la position affichée qui est figée
    return { ...block, locked: !block.locked, x: item?.x ?? block.x, y: item?.y ?? block.y }
  })
}
