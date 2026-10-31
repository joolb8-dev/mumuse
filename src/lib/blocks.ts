// Fonctions pures sur des listes de blocs.

import type { Block } from '../types/block'
import type { LayoutMode } from '../types/layoutMode'

// Deux listes sont égales si elles contiennent les mêmes blocs avec les mêmes
// valeurs, quel que soit leur ordre dans le tableau. Sert à savoir si une copie
// en cours de modification diffère de la version enregistrée.
// La position (x, y) ne compte que là où elle a un sens : pour tous les blocs en
// disposition libre, pour les seuls blocs verrouillés en disposition automatique.
export function areBlocksEqual(a: Block[], b: Block[], mode: LayoutMode): boolean {
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
      other.locked === block.locked &&
      (!(mode === 'free' || block.locked) || (other.x === block.x && other.y === block.y))
    )
  })
}
