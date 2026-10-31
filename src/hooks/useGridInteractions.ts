// Comportement de la grille pendant un déplacement ou un redimensionnement.
//
//  - Déplacement : affiche un aperçu de la destination (là où le bloc tombera
//    dans l'ordre de lecture) et, au relâchement, applique le nouvel ordre.
//  - Redimensionnement : aimante la taille sur celle des voisins ou sur le pas
//    de la grille, affiche la taille obtenue, et l'applique au relâchement.
//    Maintenir Maj désactive l'aimantation.
//
// Le hook renvoie les gestionnaires à brancher sur la grille et l'aperçu à dessiner.

import { useState } from 'react'
import type { EventCallback, LayoutItem } from 'react-grid-layout'
import { findDropSlot, layoutToBlocks } from '../lib/gridLayout'
import { snapSize } from '../lib/snapping'
import type { Block } from '../types/block'

// Rectangle d'aperçu, en pixels, dans le repère de la grille.
export interface GhostRect {
  x: number
  y: number
  w: number
  h: number
  kind: 'drop' | 'snap' // destination d'un déplacement, ou taille aimantée
}

interface UseGridInteractionsResult {
  ghost: GhostRect | null
  onDrag: EventCallback
  onDragStop: EventCallback
  onResize: EventCallback
  onResizeStop: EventCallback
}

export function useGridInteractions(
  blocks: Block[],
  containerWidth: number,
  onBlocksChange: (blocks: Block[]) => void,
): UseGridInteractionsResult {
  const [ghost, setGhost] = useState<GhostRect | null>(null)

  // Taille aimantée d'un bloc en cours de redimensionnement (sauf si Maj est maintenu).
  const snapItem = (item: LayoutItem, event: Event): LayoutItem => {
    if ((event as MouseEvent).shiftKey) return item
    const others = blocks.filter((block) => block.id !== item.i)
    return {
      ...item,
      w: snapSize(item.w, others.map((block) => block.width)),
      h: snapSize(item.h, others.map((block) => block.height)),
    }
  }

  const onDrag: EventCallback = (layout, _old, item) => {
    if (!item) return
    const slot = findDropSlot(layout, blocks, item.i, containerWidth)
    setGhost(slot ? { x: slot.x, y: slot.y, w: slot.w, h: slot.h, kind: 'drop' } : null)
  }

  const onDragStop: EventCallback = (layout) => {
    setGhost(null)
    onBlocksChange(layoutToBlocks(layout, blocks))
  }

  const onResize: EventCallback = (_layout, _old, item, _placeholder, event) => {
    if (!item || (event as MouseEvent).shiftKey) {
      setGhost(null)
      return
    }
    const snapped = snapItem(item, event)
    setGhost({ x: item.x, y: item.y, w: snapped.w, h: snapped.h, kind: 'snap' })
  }

  const onResizeStop: EventCallback = (layout, _old, item, _placeholder, event) => {
    setGhost(null)
    const snapped = item ? snapItem(item, event) : null
    const nextLayout = layout.map((entry) =>
      snapped && entry.i === snapped.i ? { ...entry, w: snapped.w, h: snapped.h } : entry,
    )
    onBlocksChange(layoutToBlocks(nextLayout, blocks))
  }

  return { ghost, onDrag, onDragStop, onResize, onResizeStop }
}
