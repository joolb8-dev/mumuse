// Disposition libre : chaque bloc reste exactement à sa position (x, y).
//
// Seul cas où un bloc est déplacé automatiquement : sa place est prise (un bloc a
// été agrandi depuis les paramètres, ou l'écran est devenu plus étroit). Il
// descend alors juste sous l'obstacle. Les blocs verrouillés sont placés en
// premier et ne cèdent jamais.

import type { LayoutItem } from 'react-grid-layout'
import type { Block } from '../types/block'
import { MAX_PLACEMENT_ATTEMPTS, overlaps, toItemAtOwnPosition } from './layoutItem'

export function freeLayout(blocks: Block[], containerWidth: number): LayoutItem[] {
  // éléments déjà posés : on y ajoute les autres un par un
  const placed = blocks
    .filter((block) => block.locked)
    .map((block) => toItemAtOwnPosition(block, containerWidth))

  const movable = blocks
    .filter((block) => !block.locked)
    .sort((a, b) => a.y - b.y || a.x - b.x) // de haut en bas, puis de gauche à droite

  for (const block of movable) {
    const item = toItemAtOwnPosition(block, containerWidth)

    // tant que la place est prise, on descend sous l'obstacle
    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      const obstacle = placed.find((other) => overlaps(item, other))
      if (!obstacle) break
      item.y = obstacle.y + obstacle.h
    }
    placed.push(item)
  }
  return placed
}
