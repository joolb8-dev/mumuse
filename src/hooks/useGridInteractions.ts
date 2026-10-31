// Comportement de la grille pendant un déplacement ou un redimensionnement.
//
// Au relâchement d'un déplacement :
//  - disposition automatique : le bloc prend sa place dans l'ordre de lecture
//  - disposition libre : le bloc s'aligne sur les bords des voisins (sinon sur le
//    pas de la grille)
// Pendant un redimensionnement, la taille s'aimante sur celle des voisins ou sur
// le pas de la grille, et un cadre montre la taille obtenue.
// Maintenir Maj désactive l'aimantation.
//
// Le hook renvoie les gestionnaires à brancher sur la grille et le cadre à dessiner.

import { useState } from 'react'
import type { EventCallback, LayoutItem } from 'react-grid-layout'
import { layoutToBlocks, overlaps } from '../lib/gridLayout'
import { snapPosition, snapSize } from '../lib/snapping'
import type { Block } from '../types/block'
import type { LayoutMode } from '../types/layoutMode'

// Cadre montrant la taille aimantée pendant un redimensionnement, en pixels, dans le repère de la grille.
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

export function useGridInteractions(
  blocks: Block[],
  layoutMode: LayoutMode,
  containerWidth: number,
  onBlocksChange: (blocks: Block[]) => void,
): UseGridInteractionsResult {
  const [ghost, setGhost] = useState<GhostRect | null>(null)

  const othersOf = (layout: readonly LayoutItem[], item: LayoutItem) =>
    layout.filter((entry) => entry.i !== item.i)

  // Taille aimantée d'un bloc en cours de redimensionnement. En disposition libre,
  // si la taille aimantée touchait un voisin, on garde la taille non aimantée.
  const snapSizeOf = (layout: readonly LayoutItem[], item: LayoutItem, event: Event): LayoutItem => {
    if (isShiftPressed(event)) return item
    const others = othersOf(layout, item)
    const snapped = {
      ...item,
      w: snapSize(item.w, others.map((o) => o.w)),
      h: snapSize(item.h, others.map((o) => o.h)),
    }
    const collides = layoutMode === 'free' && others.some((o) => overlaps(snapped, o))
    return collides ? item : snapped
  }

  // Position alignée d'un bloc déplacé en disposition libre (mêmes règles).
  const snapPositionOf = (layout: readonly LayoutItem[], item: LayoutItem, event: Event): LayoutItem => {
    if (isShiftPressed(event)) return item
    const others = othersOf(layout, item)
    // le bloc peut aligner son bord gauche/haut ou droit/bas sur les bords des voisins
    const xEdges = others.flatMap((o) => [o.x, o.x + o.w, o.x - item.w, o.x + o.w - item.w])
    const yEdges = others.flatMap((o) => [o.y, o.y + o.h, o.y - item.h, o.y + o.h - item.h])
    const snapped = {
      ...item,
      x: Math.min(snapPosition(item.x, xEdges), Math.max(0, containerWidth - item.w)),
      y: snapPosition(item.y, yEdges),
    }
    return others.some((o) => overlaps(snapped, o)) ? item : snapped
  }

  const onDragStop: EventCallback = (layout, _old, item, _placeholder, event) => {
    const target = layoutMode === 'free' && item ? snapPositionOf(layout, item, event) : null
    const nextLayout = layout.map((entry) =>
      target && entry.i === target.i ? { ...entry, x: target.x, y: target.y } : entry,
    )
    onBlocksChange(layoutToBlocks(nextLayout, blocks))
  }

  const onResize: EventCallback = (layout, _old, item, _placeholder, event) => {
    if (!item || isShiftPressed(event)) {
      setGhost(null)
      return
    }
    const snapped = snapSizeOf(layout, item, event)
    setGhost({ x: item.x, y: item.y, w: snapped.w, h: snapped.h })
  }

  const onResizeStop: EventCallback = (layout, _old, item, _placeholder, event) => {
    setGhost(null)
    const snapped = item ? snapSizeOf(layout, item, event) : null
    const nextLayout = layout.map((entry) =>
      snapped && entry.i === snapped.i ? { ...entry, w: snapped.w, h: snapped.h } : entry,
    )
    onBlocksChange(layoutToBlocks(nextLayout, blocks))
  }

  return { ghost, onDragStop, onResize, onResizeStop }
}
