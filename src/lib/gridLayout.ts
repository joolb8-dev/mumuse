// Point d'entrée de la disposition : passage entre nos blocs
// ({ id, type, width, height, order, x, y, locked }) et le format attendu par
// react-grid-layout ({ i, x, y, w, h }).
//
// La grille est réglée pour qu'une unité vaille un pixel : w et h sont donc
// directement la largeur et la hauteur du bloc en pixels.
//
// Le calcul des positions dépend de la disposition (voir types/layoutMode.ts) :
//  - automatique -> lib/autoLayout.ts
//  - libre       -> lib/freeLayout.ts

import type { LayoutItem } from 'react-grid-layout'
import type { Block } from '../types/block'
import type { LayoutMode } from '../types/layoutMode'
import { autoLayout } from './autoLayout'
import { freeLayout } from './freeLayout'

// Blocs -> grille : position de chaque bloc, selon la disposition.
export function blocksToLayout(
  blocks: Block[],
  containerWidth: number,
  mode: LayoutMode,
): LayoutItem[] {
  return mode === 'free' ? freeLayout(blocks, containerWidth) : autoLayout(blocks, containerWidth)
}

// Classe les éléments de la grille dans l'ordre de lecture : ligne par ligne,
// et de gauche à droite dans chaque ligne.
function sortInReadingOrder(layout: readonly LayoutItem[]): LayoutItem[] {
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x)

  // Regroupement en lignes : un bloc rejoint la ligne courante s'il démarre dans
  // la moitié haute du premier bloc de cette ligne. Sans cette marge, deux blocs
  // presque alignés se classeraient d'après quelques pixels d'écart.
  const rows: LayoutItem[][] = []
  for (const item of sorted) {
    const currentRow = rows[rows.length - 1]
    const startsOnCurrentRow = currentRow && item.y < currentRow[0].y + currentRow[0].h / 2
    if (startsOnCurrentRow) currentRow.push(item)
    else rows.push([item])
  }

  return rows.flatMap((row) => row.sort((a, b) => a.x - b.x))
}

// Grille -> blocs : reporte taille et position de chaque élément dans son bloc, et
// recalcule `order` d'après l'ordre de lecture. `blocks` fournit le type de chaque
// bloc, que la grille ne connaît pas.
export function layoutToBlocks(layout: readonly LayoutItem[], blocks: Block[]): Block[] {
  const blockById = new Map(blocks.map((block) => [block.id, block]))

  return sortInReadingOrder(layout).map(({ i, x, y, w, h }, order) => {
    const block = blockById.get(i)
    if (!block) throw new Error(`Bloc inconnu dans la grille : "${i}"`)
    return { ...block, x, y, width: w, height: h, order }
  })
}
