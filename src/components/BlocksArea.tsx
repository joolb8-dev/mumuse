// Zone sous la barre du haut : affiche ce qui correspond à l'état des données.
//   chargement -> message d'attente
//   erreur     -> message avec bouton « Réessayer »
//   vide       -> message « Aucun bloc »
//   sinon      -> la grille de blocs

import type { LoadStatus } from '../hooks/useBlocks'
import type { Block } from '../types/block'
import type { LayoutMode } from '../types/layoutMode'
import type { AppTheme } from '../types/theme'
import Dashboard from './Dashboard'
import StateMessage from './StateMessage'

interface BlocksAreaProps {
  status: LoadStatus
  onRetry: () => void
  blocks: Block[]
  theme: AppTheme
  layoutMode: LayoutMode
  containerWidth: number // 0 tant que la largeur n'est pas mesurée
  editing: boolean
  onBlocksChange: (blocks: Block[]) => void
}

export default function BlocksArea({ status, onRetry, blocks, ...gridProps }: BlocksAreaProps) {
  if (status === 'loading') {
    return <StateMessage loading message="Chargement des blocs…" />
  }
  if (status === 'error') {
    return (
      <StateMessage
        message="Impossible de charger les blocs."
        actionLabel="Réessayer"
        onAction={onRetry}
      />
    )
  }
  if (blocks.length === 0) {
    return <StateMessage message="Aucun bloc à afficher." />
  }
  // la grille a besoin d'une largeur mesurée pour s'afficher
  if (gridProps.containerWidth === 0) return null
  return <Dashboard blocks={blocks} {...gridProps} />
}
