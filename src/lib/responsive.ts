// Adaptation de la disposition libre à la largeur de l'écran.
//
// En disposition libre, x et largeur sont enregistrés pour une largeur de référence
// (REFERENCE_WIDTH_PX) puis mis à l'échelle de la largeur réellement disponible. Les
// hauteurs restent en pixels. Sous STACK_BREAKPOINT_PX, l'écran est trop étroit pour
// garder la forme de la mise en page : les blocs s'empilent en une colonne.
// La disposition automatique n'est pas concernée : elle est déjà fluide.

import type { Block } from '../types/block'
import type { LayoutMode } from '../types/layoutMode'
import { MIN_BLOCK_SIZE_PX } from './layoutItem'

// Largeur pour laquelle les x et largeurs enregistrés valent des pixels.
export const REFERENCE_WIDTH_PX = 1200

// En dessous de cette largeur, la disposition libre s'empile en une colonne.
export const STACK_BREAKPOINT_PX = 700

// Facteur entre les valeurs enregistrées et l'écran (1 hors disposition libre).
export const scaleFor = (mode: LayoutMode, containerWidth: number): number =>
  mode === 'free' ? containerWidth / REFERENCE_WIDTH_PX : 1

export const isStacked = (mode: LayoutMode, containerWidth: number): boolean =>
  mode === 'free' && containerWidth < STACK_BREAKPOINT_PX

// Position et largeur affichées d'un bloc. On arrondit les deux bords (et pas la
// largeur) : deux blocs collés restent collés, sans trou ni recouvrement d'un pixel.
export function toDisplayedSpan(block: Block, scale: number): { x: number; width: number } {
  const left = Math.round(block.x * scale)
  const right = Math.round((block.x + block.width) * scale)
  return { x: left, width: Math.max(MIN_BLOCK_SIZE_PX, right - left) }
}

// Blocs mis à l'échelle de l'écran (x et largeur seulement).
export function scaleBlocks(blocks: Block[], scale: number): Block[] {
  if (scale === 1) return blocks
  return blocks.map((block) => ({ ...block, ...toDisplayedSpan(block, scale) }))
}
