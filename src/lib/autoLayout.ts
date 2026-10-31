// Disposition automatique : les blocs coulent dans l'ordre de lecture.
//
// Les blocs libres n'ont pas de position utile : x et y sont recalculés à partir
// de `order`, de gauche à droite, avec retour à la ligne quand la largeur est
// dépassée (comme du texte). Les blocs verrouillés gardent leur position et les
// autres les contournent.

import { verticalCompactor, type LayoutItem } from 'react-grid-layout'
import type { Block } from '../types/block'
import {
  MAX_PLACEMENT_ATTEMPTS,
  overlaps,
  toItemAtOwnPosition,
  toLayoutItem,
} from './layoutItem'

// Place les blocs libres dans l'ordre. `obstacles` : les blocs verrouillés,
// dont l'emplacement est sauté.
function flowAround(blocks: Block[], obstacles: LayoutItem[], containerWidth: number): LayoutItem[] {
  // curseur : où sera posé le prochain bloc, et hauteur de la ligne en cours
  let x = 0
  let y = 0
  let rowHeight = 0

  // Passe à la ligne suivante : sous le bloc le plus haut de la ligne, ou, si la
  // ligne est vide, sous le prochain obstacle (sinon on ne bougerait jamais).
  const goToNextLine = () => {
    const nextObstacleBottom = Math.min(
      ...obstacles.filter((o) => o.y + o.h > y).map((o) => o.y + o.h),
      y + 1,
    )
    y = rowHeight > 0 ? y + rowHeight : nextObstacleBottom
    x = 0
    rowHeight = 0
  }

  return blocks.map((block) => {
    // un bloc plus large que l'écran est ramené à la largeur disponible
    const w = Math.min(block.width, containerWidth)

    // on avance le curseur jusqu'à une place libre
    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      // plus de place sur la ligne : on descend
      if (x > 0 && x + w > containerWidth) {
        goToNextLine()
        continue
      }

      // place occupée par un bloc verrouillé : on saute à sa droite
      const hits = obstacles.filter((o) => overlaps({ x, y, w, h: block.height }, o))
      if (hits.length === 0) break
      x = Math.max(...hits.map((o) => o.x + o.w))
      if (x + w > containerWidth) goToNextLine()
    }

    const item = toLayoutItem(block, x, y, w)
    x += w
    rowHeight = Math.max(rowHeight, block.height)
    return item
  })
}

export function autoLayout(blocks: Block[], containerWidth: number): LayoutItem[] {
  const ordered = [...blocks].sort((a, b) => a.order - b.order)

  const locked = ordered
    .filter((block) => block.locked)
    .map((block) => toItemAtOwnPosition(block, containerWidth))
  const flowing = flowAround(
    ordered.filter((block) => !block.locked),
    locked,
    containerWidth,
  )

  // On applique nous-mêmes le tassement vertical de la grille : la disposition
  // calculée ici est alors exactement celle qui s'affiche.
  return [...verticalCompactor.compact([...locked, ...flowing], containerWidth)]
}
