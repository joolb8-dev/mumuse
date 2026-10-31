// Passage entre nos blocs ({ id, type, width, height, order, pin }) et le format
// attendu par react-grid-layout ({ i, x, y, w, h }).
//
// La grille est réglée pour qu'une unité vaille un pixel : w et h sont donc
// directement la largeur et la hauteur du bloc en pixels.
//
// Deux sortes de blocs :
//  - les blocs libres n'ont pas de position enregistrée : x et y sont recalculés
//    à partir de `order`, ce qui garde la grille cohérente si une taille change ;
//  - les blocs verrouillés (`pin`) gardent leur position figée, et les blocs
//    libres coulent autour d'eux : aucun ne peut prendre leur place.

import { verticalCompactor, type LayoutItem } from 'react-grid-layout'
import type { Block } from '../types/block'

// Taille minimale d'un bloc, en pixels (en dessous, un chart devient illisible).
export const MIN_BLOCK_SIZE_PX = 120

// Garde-fou : nombre maximal de tentatives pour trouver une place à un bloc.
const MAX_PLACEMENT_ATTEMPTS = 1000

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

function toLayoutItem(block: Block, x: number, y: number, w: number): LayoutItem {
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
    static: block.pin !== null,
  }
}

// Blocs verrouillés -> rectangles à leur position figée (ramenés dans la largeur disponible).
function pinnedItems(blocks: Block[], containerWidth: number): LayoutItem[] {
  return blocks.flatMap((block) => {
    if (block.pin === null) return []
    const w = Math.min(block.width, containerWidth)
    const x = Math.max(0, Math.min(block.pin.x, containerWidth - w))
    return [toLayoutItem(block, x, block.pin.y, w)]
  })
}

// Place les blocs libres dans l'ordre, de gauche à droite, en passant à la ligne
// quand la largeur disponible est dépassée (comme du texte qui retourne à la
// ligne). Un emplacement occupé par un bloc verrouillé est sauté.
function flowAround(blocks: Block[], obstacles: LayoutItem[], containerWidth: number): LayoutItem[] {
  let x = 0
  let y = 0
  let rowHeight = 0

  // Passe à la ligne suivante : sous le bloc le plus haut de la ligne, ou, si la
  // ligne est vide, sous le prochain obstacle (sinon on ne bougerait jamais).
  const wrapLine = () => {
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

    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      // plus de place sur la ligne : on descend
      if (x > 0 && x + w > containerWidth) {
        wrapLine()
        continue
      }

      // place occupée par un bloc verrouillé : on saute à sa droite
      const hits = obstacles.filter((o) => overlaps({ x, y, w, h: block.height }, o))
      if (hits.length === 0) break
      x = Math.max(...hits.map((o) => o.x + o.w))
      if (x + w > containerWidth) wrapLine()
    }

    const item = toLayoutItem(block, x, y, w)
    x += w
    rowHeight = Math.max(rowHeight, block.height)
    return item
  })
}

// Blocs -> grille.
export function blocksToLayout(blocks: Block[], containerWidth: number): LayoutItem[] {
  const ordered = [...blocks].sort((a, b) => a.order - b.order)
  const pinned = pinnedItems(ordered, containerWidth)
  const flowing = flowAround(
    ordered.filter((block) => block.pin === null),
    pinned,
    containerWidth,
  )

  // On applique nous-mêmes le tassement vertical de la grille : la disposition
  // calculée ici est alors exactement celle qui s'affiche.
  return [...verticalCompactor.compact([...pinned, ...flowing], containerWidth)]
}

// Emplacement où tomberait un bloc s'il était relâché maintenant : on retrouve
// l'ordre de lecture d'après sa position actuelle, puis on regarde où ce nouvel
// ordre le place dans le flux. Sert à afficher l'aperçu de destination.
export function findDropSlot(
  layout: readonly LayoutItem[],
  blocks: Block[],
  blockId: string,
  containerWidth: number,
): LayoutItem | undefined {
  const reordered = layoutToBlocks(layout, blocks)
  return blocksToLayout(reordered, containerWidth).find((item) => item.i === blockId)
}

// Grille -> blocs.
// Retrouve l'ordre de lecture à partir des positions après un déplacement.
// `blocks` fournit le type de chaque bloc, que la grille ne connaît pas.
export function layoutToBlocks(layout: readonly LayoutItem[], blocks: Block[]): Block[] {
  const blockById = new Map(blocks.map((block) => [block.id, block]))

  // 1. de haut en bas, puis de gauche à droite
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x)

  // 2. regroupement en lignes : un bloc rejoint la ligne courante s'il démarre
  //    dans la moitié haute du premier bloc de cette ligne. Sans cette marge,
  //    deux blocs presque alignés se classeraient d'après quelques pixels d'écart.
  const rows: LayoutItem[][] = []
  for (const item of sorted) {
    const currentRow = rows[rows.length - 1]
    const startsOnCurrentRow = currentRow && item.y < currentRow[0].y + currentRow[0].h / 2
    if (startsOnCurrentRow) currentRow.push(item)
    else rows.push([item])
  }

  // 3. dans chaque ligne, de gauche à droite ; le rang final devient `order`.
  //    Un bloc verrouillé garde sa position figée (`pin`) : seuls son rang et sa taille sont mis à jour.
  return rows
    .flatMap((row) => row.sort((a, b) => a.x - b.x))
    .map(({ i, w, h }, order) => {
      const block = blockById.get(i)
      if (!block) throw new Error(`Bloc inconnu dans la grille : "${i}"`)
      return { ...block, width: w, height: h, order }
    })
}
