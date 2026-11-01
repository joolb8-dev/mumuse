// Disposition libre : chaque bloc reste exactement à sa position (x, y).
//
// Seul cas où un bloc est déplacé automatiquement : sa place est prise (un bloc a
// été agrandi depuis les paramètres, ou l'écran est devenu plus étroit). Il
// descend alors juste sous l'obstacle. Les blocs verrouillés sont placés en
// premier et ne cèdent jamais.

import type { LayoutItem } from 'react-grid-layout'
import type { Block } from '../types/block'
import { MAX_PLACEMENT_ATTEMPTS, overlaps, toItemAtOwnPosition, toLayoutItem } from './layoutItem'

// Place libre la plus proche d'un bloc lâché sur d'autres blocs (disposition libre).
// Les places candidates sont collées aux bords des voisins ; on garde la plus proche
// de l'endroit où l'utilisateur a lâché le bloc. Il en existe toujours une : sous tous les blocs.
export function nearestFreeSpot(
  others: readonly LayoutItem[],
  item: LayoutItem,
  containerWidth: number,
): LayoutItem {
  const maxX = containerWidth - item.w
  const bottom = Math.max(0, ...others.map((o) => o.y + o.h))

  const xs = [item.x, 0, ...others.flatMap((o) => [o.x + o.w, o.x - item.w])]
  const ys = [item.y, 0, bottom, ...others.flatMap((o) => [o.y + o.h, o.y - item.h])]

  let best: LayoutItem | null = null
  let bestDistance = Infinity
  for (const x of xs) {
    for (const y of ys) {
      if (x < 0 || x > maxX || y < 0) continue
      const candidate = { ...item, x, y }
      if (others.some((o) => overlaps(candidate, o))) continue
      const distance = Math.hypot(x - item.x, y - item.y)
      if (distance < bestDistance) {
        best = candidate
        bestDistance = distance
      }
    }
  }
  return best ?? { ...item, x: Math.max(0, Math.min(item.x, maxX)), y: bottom }
}

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

// Écran étroit : une seule colonne, chaque bloc pleine largeur, dans l'ordre de lecture
// de la disposition libre. Les verrous n'ont pas d'effet ici.
export function stackedLayout(blocks: Block[], containerWidth: number): LayoutItem[] {
  const ordered = [...blocks].sort((a, b) => a.y - b.y || a.x - b.x)
  let y = 0
  return ordered.map((block) => {
    const item = toLayoutItem(block, 0, y, containerWidth)
    y += block.height
    return { ...item, static: false }
  })
}
