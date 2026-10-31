// Affiche un bloc en plein écran, pour lire un chart en détail.
// Se ferme avec le bouton de fermeture ou la touche Échap.

import CloseIcon from '@mui/icons-material/Close'
import { Dialog, IconButton, Typography } from '@mui/material'
import { chartTypes } from '../data/chartTypes'
import type { Block } from '../types/block'
import type { AppTheme } from '../types/theme'

interface FullscreenBlockDialogProps {
  block: Block | null // null = fermé
  theme: AppTheme
  onClose: () => void
}

export default function FullscreenBlockDialog({ block, theme, onClose }: FullscreenBlockDialogProps) {
  const chart = block ? chartTypes[block.type] : null

  return (
    <Dialog fullScreen open={block !== null} onClose={onClose}>
      <div className="fullscreen-block__header">
        <Typography variant="h6">{chart?.title}</Typography>
        <IconButton aria-label="Fermer le plein écran" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      {/* le chart a besoin d'un conteneur à hauteur définie (voir App.css) */}
      <div className="fullscreen-block__chart">{chart?.render(theme)}</div>
    </Dialog>
  )
}
