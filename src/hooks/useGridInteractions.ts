// Branche la grille sur nos règles de déplacement et de redimensionnement.
//
// Au relâchement d'un déplacement :
//  - disposition automatique : le bloc prend sa place dans l'ordre de lecture
//  - disposition libre : le bloc s'aligne sur les bords des voisins (sinon sur le
//    pas de la grille)
// Pendant un redimensionnement, la taille s'aimante sur celle des voisins ou sur
// le pas de la grille, et un cadre montre la taille obtenue.
// Maintenir Maj désactive l'aimantation.
//
// Le calcul de l'aimantation est dans lib/snapping.ts ; ce hook ne fait que relier
// les événements de la grille à ce calcul et aux blocs.

import { useState } from 'react'
import type { EventCallback, LayoutItem } from 'react-grid-layout'
import { layoutToBlocks } from '../lib/gridLayout'
import { snapMovedItem, snapResizedItem } from '../lib/snapping'
import type { Block } from '../types/block'
import type { LayoutMode } from '../types/layoutMode'

// Cadre montrant la taille aimantée pendant un redimensionnement
// (en pixels, dans le repère de la grille).
export interface GhostRect {
  x: number
  y: number
  w: number
  h: number
}

interface UseGridInteractionsResult {
  ghost: GhostRect | null
  onDragStop: EventCallback
  onResize: EventCallback
  onResizeStop: EventCallback
}

const isShiftPressed = (event: Event): boolean => (event as MouseEvent).shiftKey

// Copie de la grille où un élément est remplacé par une version modifiée.
const replaceItem = (layout: readonly LayoutItem[], changed: LayoutItem | null): LayoutItem[] =>
  layout.map((entry) => (changed && entry.i === changed.i ? changed : entry))

export function useGridInteractions(
  blocks: Block[],
  layoutMode: LayoutMode,
  containerWidth: number,
  onBlocksChange: (blocks: Block[]) => void,
): UseGridInteractionsResult {
  const [ghost, setGhost] = useState<GhostRect | null>(null)

  const onDragStop: EventCallback = (layout, _old, item, _placeholder, event) => {
    // seule la disposition libre garde la position où le bloc est déposé
    const shouldSnap = layoutMode === 'free' && item && !isShiftPressed(event)
    const moved = shouldSnap ? snapMovedItem(layout, item, containerWidth) : item
    onBlocksChange(layoutToBlocks(replaceItem(layout, moved), blocks))
  }

  const onResize: EventCallback = (layout, _old, item, _placeholder, event) => {
    if (!item || isShiftPressed(event)) {
      setGhost(null)
      return
    }
    const { w, h } = snapResizedItem(layout, item, layoutMode)
    setGhost({ x: item.x, y: item.y, w, h })
  }

  const onResizeStop: EventCallback = (layout, _old, item, _placeholder, event) => {
    setGhost(null)
    const resized = item && !isShiftPressed(event) ? snapResizedItem(layout, item, layoutMode) : item
    onBlocksChange(layoutToBlocks(replaceItem(layout, resized), blocks))
  }

  return { ghost, onDragStop, onResize, onResizeStop }
}
