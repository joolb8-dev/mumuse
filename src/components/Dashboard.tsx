// Grille de blocs déplaçables et redimensionnables (react-grid-layout).
//
// Réglage clé : 1 colonne = 1 pixel et rowHeight = 1 pixel, sans marge. Les
// tailles de la grille sont alors directement des pixels (voir lib/gridLayout.ts).

import { useMemo, useState, type CSSProperties } from 'react'
import ReactGridLayout, {
  useContainerWidth,
  verticalCompactor,
  type ResizeHandleAxis,
} from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useGridInteractions } from '../hooks/useGridInteractions'
import { blocksToLayout, MIN_BLOCK_SIZE_PX } from '../lib/gridLayout'
import type { Block } from '../types/block'
import type { AppTheme } from '../types/theme'
import BlockCard from './BlockCard'
import FullscreenBlockDialog from './FullscreenBlockDialog'
import GridGhost from './GridGhost'

// Poignées de redimensionnement : les 4 côtés et les 4 coins.
// Les positions sont recalculées d'après l'ordre après chaque redimensionnement
// (voir lib/gridLayout.ts) : agrandir par la gauche ou le haut change donc la
// taille du bloc, mais il reste à sa place dans le flux.
const RESIZE_HANDLES: ResizeHandleAxis[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

// En mode édition, seule la barre du titre déplace un bloc : cliquer dans le
// chart ne fait rien. Le cadenas, placé dans la carte, ne démarre pas non plus un déplacement.
const DRAG_HANDLE_SELECTOR = '.block-card__header'
const LOCK_BUTTON_SELECTOR = '.block-card__lock'

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
  const interactions = useGridInteractions(blocks, containerWidth, onBlocksChange)

  // bloc affiché en plein écran (null = aucun)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const expandedBlock = blocks.find((block) => block.id === expandedId) ?? null

  // Verrouille ou déverrouille un bloc (la copie en cours de modification change, rien n'est enregistré).
  const handleToggleLock = (blockId: string) =>
    onBlocksChange(
      blocks.map((block) => (block.id === blockId ? { ...block, locked: !block.locked } : block)),
    )

  return (
    <div className="dashboard">
      {/* la couleur du thème sert au cadre d'aperçu (voir App.css) */}
      <div
        ref={containerRef}
        className="dashboard__grid"
        style={{ '--ghost-color': theme.primary } as CSSProperties}
      >
        {/* la grille a besoin d'une largeur mesurée pour s'afficher */}
        {mounted && (
          <ReactGridLayout
            width={containerWidth}
            layout={layout}
            onDrag={interactions.onDrag}
            onDragStop={interactions.onDragStop}
            onResize={interactions.onResize}
            onResizeStop={interactions.onResizeStop}
            gridConfig={{
              cols: containerWidth,
              rowHeight: 1,
              margin: [0, 0],
              containerPadding: [0, 0],
            }}
            dragConfig={{
              enabled: editing,
              handle: DRAG_HANDLE_SELECTOR,
              cancel: LOCK_BUTTON_SELECTOR,
            }}
            resizeConfig={{ enabled: editing, handles: RESIZE_HANDLES }}
            compactor={verticalCompactor}
          >
            {blocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                theme={theme}
                editing={editing}
                onToggleLock={handleToggleLock}
                onExpand={setExpandedId}
              />
            ))}
          </ReactGridLayout>
        )}

        {interactions.ghost && <GridGhost rect={interactions.ghost} />}
      </div>

      <FullscreenBlockDialog
        block={expandedBlock}
        theme={theme}
        onClose={() => setExpandedId(null)}
      />
    </div>
  )
}
