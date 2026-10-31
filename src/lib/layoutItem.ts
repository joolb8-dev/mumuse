// Briques communes aux deux dispositions : tailles minimales, test de
// chevauchement et fabrication des éléments attendus par react-grid-layout.

import type { LayoutItem } from 'react-grid-layout'
import type { Block } from '../types/block'

// Taille minimale d'un bloc, en pixels (en dessous, un chart devient illisible).
export const MIN_BLOCK_SIZE_PX = 120

// Garde-fou : nombre maximal de tentatives pour trouver une place à un bloc.
export const MAX_PLACEMENT_ATTEMPTS = 1000

// Un rectangle en pixels (un bloc, ou un élément de grille).
interface Rect {
  x: number
  y: number
  w: number
  h: number
}

// Deux rectangles se recouvrent-ils ? (se toucher par un bord ne compte pas)
export const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

// Bloc -> élément de grille, à une position et une largeur données.
export function toLayoutItem(block: Block, x: number, y: number, w: number): LayoutItem {
  return {
    i: block.id,
    x,
    y,
    w,
    h: block.height,
    minW: MIN_BLOCK_SIZE_PX,
    minH: MIN_BLOCK_SIZE_PX,
    // `static` : la grille ne déplace ni ne redimensionne jamais ce bloc,
    // et les autres blocs ne peuvent pas le recouvrir
    static: block.locked,
  }
}

// Bloc -> élément de grille à la position enregistrée du bloc,
// ramené dans la largeur disponible.
export function toItemAtOwnPosition(block: Block, containerWidth: number): LayoutItem {
  const w = Math.min(block.width, containerWidth)
  const x = Math.max(0, Math.min(block.x, containerWidth - w))
  return toLayoutItem(block, x, Math.max(0, block.y), w)
}
