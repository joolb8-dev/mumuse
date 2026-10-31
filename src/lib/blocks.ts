// Fonctions pures sur des listes de blocs.

import type { Block } from '../types/block'

// Un bloc verrouillé est un bloc qui a une position figée.
export const isLocked = (block: Block): boolean => block.pin !== null

// Deux listes sont égales si elles contiennent les mêmes blocs avec les mêmes
// valeurs, quel que soit leur ordre dans le tableau. Sert à savoir si une copie
// en cours de modification diffère de la version enregistrée.
export function areBlocksEqual(a: Block[], b: Block[]): boolean {
  if (a.length !== b.length) return false

  const blockById = new Map(b.map((block) => [block.id, block]))
  return a.every((block) => {
    const other = blockById.get(block.id)
    return (
      other !== undefined &&
      other.type === block.type &&
      other.width === block.width &&
      other.height === block.height &&
      other.order === block.order &&
      other.pin?.x === block.pin?.x &&
      other.pin?.y === block.pin?.y
    )
  })
}
