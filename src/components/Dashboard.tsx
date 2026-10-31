// Grille de blocs déplaçables et redimensionnables (react-grid-layout).
//
// Réglage clé : 1 colonne = 1 pixel et rowHeight = 1 pixel, sans marge. Les
// tailles de la grille sont alors directement des pixels (voir lib/gridLayout.ts).

import { useMemo } from 'react'
import ReactGridLayout, {
  useContainerWidth,
  verticalCompactor,
  type LayoutItem,
  type ResizeHandleAxis,
} from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { blocksToLayout, layoutToBlocks, MIN_BLOCK_SIZE_PX } from '../lib/gridLayout'
import type { Block } from '../types/block'
import type { AppTheme } from '../types/theme'
import BlockCard from './BlockCard'

// Poignées de redimensionnement : bord droit, bord du bas et coin.
const RESIZE_HANDLES: ResizeHandleAxis[] = ['e', 's', 'se']

interface DashboardProps {
  blocks: Block[]
  theme: AppTheme
  editing: boolean
  onBlocksChange: (blocks: Block[]) => void
}

export default function Dashboard({ blocks, theme, editing, onBlocksChange }: DashboardProps) {
  // largeur disponible, mesurée sur le conteneur (se met à jour au redimensionnement de la fenêtre)
  const { width, containerRef, mounted } = useContainerWidth()
  const containerWidth = Math.max(MIN_BLOCK_SIZE_PX, Math.floor(width))

  const layout = useMemo(() => blocksToLayout(blocks, containerWidth), [blocks, containerWidth])

  // Après un déplacement ou un redimensionnement, on retrouve l'ordre de lecture
  // et on re-tasse tout de suite : ce qu'on voit est ce qui sera enregistré.
  const handleSettle = (nextLayout: readonly LayoutItem[]) =>
    onBlocksChange(layoutToBlocks(nextLayout, blocks))

  return (
    <div className="dashboard">
      <div ref={containerRef}>
        {/* la grille a besoin d'une largeur mesurée pour s'afficher */}
        {mounted && (
          <ReactGridLayout
            width={containerWidth}
            layout={layout}
            onDragStop={handleSettle}
            onResizeStop={handleSettle}
            gridConfig={{
              cols: containerWidth,
              rowHeight: 1,
              margin: [0, 0],
              containerPadding: [0, 0],
            }}
            dragConfig={{ enabled: editing }}
            resizeConfig={{ enabled: editing, handles: RESIZE_HANDLES }}
            compactor={verticalCompactor}
          >
            {blocks.map((block) => (
              <BlockCard key={block.id} block={block} theme={theme} editing={editing} />
            ))}
          </ReactGridLayout>
        )}
      </div>
    </div>
  )
}
