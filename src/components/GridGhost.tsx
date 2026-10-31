// Aperçu dessiné par-dessus la grille pendant un déplacement ou un redimensionnement :
//  - « drop » : cadre en pointillés à l'endroit où le bloc tombera
//  - « snap » : cadre plein à la taille sur laquelle le bloc va s'aimanter
// Il ne reçoit aucun clic (voir App.css), pour ne pas gêner la manipulation.

import type { GhostRect } from '../hooks/useGridInteractions'

interface GridGhostProps {
  rect: GhostRect
}

export default function GridGhost({ rect }: GridGhostProps) {
  return (
    <div
      className="grid-ghost"
      style={{ transform: `translate(${rect.x}px, ${rect.y}px)`, width: rect.w, height: rect.h }}
    >
      <div className={`grid-ghost__frame grid-ghost__frame--${rect.kind}`} />
    </div>
  )
}
