// Aimantation douce : pendant un redimensionnement ou un déplacement, une valeur
// proposée est ramenée, dans cet ordre :
//  1. à celle d'un bloc voisin si elle en est proche (les blocs s'alignent)
//  2. sinon à un multiple du pas de la grille (valeurs « rondes »)
// Fonctions pures : le hook useGridInteractions s'occupe des événements de la souris.

import type { LayoutItem } from 'react-grid-layout'
import type { LayoutMode } from '../types/layoutMode'
import { MIN_BLOCK_SIZE_PX, overlaps } from './layoutItem'

// Pas de la grille d'aimantation, en pixels.
const SNAP_STEP_PX = 10

// Écart maximal (en pixels) pour s'aimanter à une valeur voisine.
const SNAP_THRESHOLD_PX = 12

// Valeur aimantée : le candidat le plus proche s'il est à moins du seuil,
// sinon la valeur arrondie au pas de la grille.
function snap(value: number, candidates: number[]): number {
  let nearest: number | null = null
  for (const candidate of candidates) {
    const gap = Math.abs(candidate - value)
    const isCloser = nearest === null || gap < Math.abs(nearest - value)
    if (gap <= SNAP_THRESHOLD_PX && isCloser) nearest = candidate
  }
  return nearest ?? Math.round(value / SNAP_STEP_PX) * SNAP_STEP_PX
}

// Élément de grille redimensionné, avec sa largeur et sa hauteur aimantées sur celles
// des autres blocs. En disposition libre, si la taille aimantée touchait un voisin,
// on garde la taille d'origine.
export function snapResizedItem(
  layout: readonly LayoutItem[],
  item: LayoutItem,
  mode: LayoutMode,
): LayoutItem {
  const others = layout.filter((entry) => entry.i !== item.i)
  const snapped = {
    ...item,
    w: Math.max(MIN_BLOCK_SIZE_PX, snap(item.w, others.map((o) => o.w))),
    h: Math.max(MIN_BLOCK_SIZE_PX, snap(item.h, others.map((o) => o.h))),
  }

  const touchesANeighbor = mode === 'free' && others.some((o) => overlaps(snapped, o))
  return touchesANeighbor ? item : snapped
}

// Élément de grille déplacé (disposition libre), avec sa position alignée sur les
// bords des autres blocs. Si la position alignée touchait un voisin, on garde la
// position d'origine.
export function snapMovedItem(
  layout: readonly LayoutItem[],
  item: LayoutItem,
  containerWidth: number,
): LayoutItem {
  const others = layout.filter((entry) => entry.i !== item.i)

  // le bloc peut aligner son bord gauche/haut ou son bord droit/bas sur les bords des voisins
  const xEdges = others.flatMap((o) => [o.x, o.x + o.w, o.x - item.w, o.x + o.w - item.w])
  const yEdges = others.flatMap((o) => [o.y, o.y + o.h, o.y - item.h, o.y + o.h - item.h])

  const snapped = {
    ...item,
    x: Math.max(0, Math.min(snap(item.x, xEdges), containerWidth - item.w)),
    y: Math.max(0, snap(item.y, yEdges)),
  }

  const touchesANeighbor = others.some((o) => overlaps(snapped, o))
  return touchesANeighbor ? item : snapped
}
