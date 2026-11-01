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
import { nearestFreeSpot } from '../lib/freeLayout'
import { layoutToBlocks } from '../lib/gridLayout'
import { overlaps } from '../lib/layoutItem'
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
  // change à chaque fin de déplacement ou de redimensionnement (voir plus bas)
  revision: number
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

  // La grille autorise le recouvrement pendant le geste et garde sa propre copie des
  // positions. Si le résultat final est identique à la disposition d'avant (bloc
  // ramené à sa place), elle ne se remettrait pas à jour : changer `revision` la
  // force à repartir de nos blocs.
  const [revision, setRevision] = useState(0)
  const refreshGrid = () => setRevision((current) => current + 1)

  const onDragStop: EventCallback = (layout, _old, item, _placeholder, event) => {
    refreshGrid()
    // disposition automatique : seul l'ordre de lecture compte, les autres blocs se replacent
    if (layoutMode === 'auto' || !item) {
      onBlocksChange(layoutToBlocks(replaceItem(layout, item), blocks))
      return
    }
    // disposition libre : le bloc garde sa position (aimantée sauf avec Maj), mais jamais
    // sur un autre bloc : lâché dessus, il va à la place libre la plus proche
    const others = layout.filter((entry) => entry.i !== item.i)
    const target = isShiftPressed(event) ? item : snapMovedItem(layout, item, containerWidth)
    const dropped = others.some((o) => overlaps(target, o))
      ? nearestFreeSpot(others, item, containerWidth)
      : target
    onBlocksChange(layoutToBlocks(replaceItem(layout, dropped), blocks))
  }

  const onResize: EventCallback = (layout, _old, item, _placeholder, event) => {
    if (!item || isShiftPressed(event)) {
      setGhost(null)
      return
    }
    const { w, h } = snapResizedItem(layout, item, layoutMode)
    setGhost({ x: item.x, y: item.y, w, h })
  }

  const onResizeStop: EventCallback = (layout, oldItem, item, _placeholder, event) => {
    setGhost(null)
    refreshGrid()
    let resized = item && !isShiftPressed(event) ? snapResizedItem(layout, item, layoutMode) : item
    // disposition libre : un bloc agrandi ne peut pas recouvrir un voisin, il reprend sa taille
    const others = layout.filter((entry) => entry.i !== item?.i)
    if (layoutMode === 'free' && resized && others.some((o) => overlaps(resized as LayoutItem, o))) {
      resized = oldItem
    }
    onBlocksChange(layoutToBlocks(replaceItem(layout, resized), blocks))
  }

  return { ghost, revision, onDragStop, onResize, onResizeStop }
}
