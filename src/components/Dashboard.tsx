// Grille de blocs déplaçables et redimensionnables (react-grid-layout).
//
// Réglage clé : 1 colonne = 1 pixel et rowHeight = 1 pixel, sans marge. Les
// tailles de la grille sont alors directement des pixels (voir lib/gridLayout.ts).
// La largeur disponible est mesurée par le composant parent et reçue en prop.

import { useMemo, useState } from 'react'
import ReactGridLayout, {
  getCompactor,
  verticalCompactor,
  type ResizeHandleAxis,
} from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useGridInteractions } from '../hooks/useGridInteractions'
import { blocksToLayout } from '../lib/gridLayout'
import type { Block } from '../types/block'
import type { LayoutMode } from '../types/layoutMode'
import type { AppTheme } from '../types/theme'
import BlockCard from './BlockCard'
import FullscreenBlockDialog from './FullscreenBlockDialog'
import GridGhost from './GridGhost'

// Poignées de redimensionnement : les 4 côtés et les 4 coins.
const RESIZE_HANDLES: ResizeHandleAxis[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

// En mode édition, seule la barre du titre déplace un bloc : cliquer dans le
// chart ne fait rien. Le cadenas, placé dans la carte, ne démarre pas non plus un déplacement.
const DRAG_HANDLE_SELECTOR = '.block-card__header'
const LOCK_BUTTON_SELECTOR = '.block-card__lock'

// Disposition automatique : les blocs remontent et se tassent.
// Disposition libre : aucun tassement, et un bloc ne peut pas en recouvrir un autre.
const AUTO_COMPACTOR = verticalCompactor
const FREE_COMPACTOR = getCompactor(null, false, true)

interface DashboardProps {
  blocks: Block[]
  theme: AppTheme
  layoutMode: LayoutMode
  containerWidth: number
  editing: boolean
  onBlocksChange: (blocks: Block[]) => void
}

export default function Dashboard({
  blocks,
  theme,
  layoutMode,
  containerWidth,
  editing,
  onBlocksChange,
}: DashboardProps) {
  const layout = useMemo(
    () => blocksToLayout(blocks, containerWidth, layoutMode),
    [blocks, containerWidth, layoutMode],
  )
  const interactions = useGridInteractions(blocks, layoutMode, containerWidth, onBlocksChange)

  // bloc affiché en plein écran (null = aucun)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const expandedBlock = blocks.find((block) => block.id === expandedId) ?? null

  // Verrouille un bloc à sa place actuelle, ou le déverrouille. La copie en cours de
  // modification change ; rien n'est enregistré avant « Enregistrer ».
  const handleToggleLock = (blockId: string) => {
    const item = layout.find((entry) => entry.i === blockId)
    onBlocksChange(
      blocks.map((block) => {
        if (block.id !== blockId) return block
        // on garde la position affichée : c'est elle qui est figée
        return { ...block, locked: !block.locked, x: item?.x ?? block.x, y: item?.y ?? block.y }
      }),
    )
  }

  return (
    <>
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
        compactor={layoutMode === 'free' ? FREE_COMPACTOR : AUTO_COMPACTOR}
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

      {interactions.ghost && <GridGhost rect={interactions.ghost} />}

      <FullscreenBlockDialog
        block={expandedBlock}
        theme={theme}
        onClose={() => setExpandedId(null)}
      />
    </>
  )
}
