// Aimantation douce des tailles pendant un redimensionnement.
//
// Une taille proposée est ramenée, dans cet ordre :
//  1. à la taille d'un bloc voisin si elle en est proche (les blocs s'alignent)
//  2. sinon à un multiple du pas de la grille (tailles « rondes »)
// L'utilisateur peut contourner l'aimantation en maintenant Maj.

import { MIN_BLOCK_SIZE_PX } from './gridLayout'

// Pas de la grille d'aimantation, en pixels.
export const SNAP_STEP_PX = 10

// Écart maximal (en pixels) pour s'aimanter à la taille d'un voisin.
export const SNAP_THRESHOLD_PX = 12

// Renvoie la taille aimantée. `neighborSizes` : tailles des autres blocs, sur le même axe.
export function snapSize(value: number, neighborSizes: number[]): number {
  let nearestNeighbor: number | null = null
  for (const size of neighborSizes) {
    const gap = Math.abs(size - value)
    const isCloser = nearestNeighbor === null || gap < Math.abs(nearestNeighbor - value)
    if (gap <= SNAP_THRESHOLD_PX && isCloser) nearestNeighbor = size
  }

  const snapped = nearestNeighbor ?? Math.round(value / SNAP_STEP_PX) * SNAP_STEP_PX
  return Math.max(MIN_BLOCK_SIZE_PX, snapped)
}

// Aimantation d'une position (x ou y) pendant un déplacement en disposition libre.
// `edges` : positions des bords des blocs voisins sur le même axe (le bloc s'aligne dessus).
// Sinon la position est arrondie au pas de la grille.
export function snapPosition(value: number, edges: number[]): number {
  let nearestEdge: number | null = null
  for (const edge of edges) {
    const gap = Math.abs(edge - value)
    const isCloser = nearestEdge === null || gap < Math.abs(nearestEdge - value)
    if (gap <= SNAP_THRESHOLD_PX && isCloser) nearestEdge = edge
  }
  return Math.max(0, nearestEdge ?? Math.round(value / SNAP_STEP_PX) * SNAP_STEP_PX)
}
