// Passage entre nos blocs ({ id, type, width, height, order }) et le format
// attendu par react-grid-layout ({ i, x, y, w, h }).
//
// La grille est réglée pour qu'une unité vaille un pixel : w et h sont donc
// directement la largeur et la hauteur du bloc en pixels. Les positions x et y
// ne sont jamais enregistrées : elles sont recalculées à partir de `order`,
// ce qui garde la grille cohérente si une taille change.

// Taille minimale d'un bloc, en pixels.
export const MIN_SIZE = 120

// Blocs -> grille.
// Place les blocs dans l'ordre, de gauche à droite, et passe à la ligne quand
// la largeur disponible est dépassée (comme du texte qui retourne à la ligne).
export function blocksToLayout(blocks, containerWidth) {
  let x = 0
  let y = 0
  let rowHeight = 0

  return [...blocks]
    .sort((a, b) => a.order - b.order)
    .map((block) => {
      // un bloc plus large que l'écran est ramené à la largeur disponible
      const w = Math.min(block.width, containerWidth)

      // plus de place sur la ligne : on descend sous le bloc le plus haut
      if (x > 0 && x + w > containerWidth) {
        x = 0
        y += rowHeight
        rowHeight = 0
      }

      const item = { i: block.id, x, y, w, h: block.height, minW: MIN_SIZE, minH: MIN_SIZE }
      x += w
      rowHeight = Math.max(rowHeight, block.height)
      return item
    })
}

// Grille -> blocs.
// Retrouve l'ordre de lecture à partir des positions après un déplacement.
// `blocks` fournit le type de chaque bloc, que la grille ne connaît pas.
export function layoutToBlocks(layout, blocks) {
  const typeById = Object.fromEntries(blocks.map((block) => [block.id, block.type]))

  // 1. de haut en bas, puis de gauche à droite
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x)

  // 2. regroupement en lignes : un bloc rejoint la ligne courante s'il démarre
  //    dans la moitié haute du premier bloc de cette ligne. Sans cette marge,
  //    deux blocs presque alignés se classeraient d'après quelques pixels d'écart.
  const rows = []
  for (const item of sorted) {
    const currentRow = rows[rows.length - 1]
    const startsOnCurrentRow = currentRow && item.y < currentRow[0].y + currentRow[0].h / 2
    if (startsOnCurrentRow) currentRow.push(item)
    else rows.push([item])
  }

  // 3. dans chaque ligne, de gauche à droite ; le rang final devient `order`
  return rows
    .flatMap((row) => row.sort((a, b) => a.x - b.x))
    .map(({ i, w, h }, order) => ({ id: i, type: typeById[i], width: w, height: h, order }))
}
