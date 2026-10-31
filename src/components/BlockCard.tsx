// Carte d'un bloc : un titre et le chart correspondant à son type.
//
// react-grid-layout positionne et dimensionne le <div> extérieur (il lui injecte
// style, className et ref, et ajoute les poignées de redimensionnement). La
// marge entre les cartes vient donc du padding de ce <div>, pas de la carte.
//
// Le ref est transmis explicitement car la grille en a besoin pour mesurer le bloc.

import { forwardRef, type HTMLAttributes } from 'react'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import { IconButton, Paper, Typography } from '@mui/material'
import { chartTypes } from '../data/chartTypes'
import type { Block } from '../types/block'
import type { AppTheme } from '../types/theme'

interface BlockCardProps extends HTMLAttributes<HTMLDivElement> {
  block: Block
  theme: AppTheme
  editing: boolean
  onToggleLock: (blockId: string) => void
  onExpand: (blockId: string) => void
}

const BlockCard = forwardRef<HTMLDivElement, BlockCardProps>(function BlockCard(
  { block, theme, editing, onToggleLock, onExpand, className = '', children, ...gridProps },
  ref,
) {
  const chart = chartTypes[block.type]
  const locked = block.locked

  return (
    <div ref={ref} className={`block ${locked ? 'is-locked' : ''} ${className}`} {...gridProps}>
      <Paper
        variant={theme.outlined ? 'outlined' : 'elevation'}
        elevation={theme.outlined ? 0 : 2}
        className={editing ? 'block-card is-editing' : 'block-card'}
      >
        {/* en édition : cadenas (la grille l'ignore pour le glissement, voir `cancel` dans Dashboard) ;
            sinon : bouton plein écran */}
        {editing ? (
          <IconButton
            size="small"
            className="block-card__action block-card__lock"
            aria-label={locked ? 'Déverrouiller le bloc' : 'Verrouiller le bloc'}
            onClick={() => onToggleLock(block.id)}
          >
            {locked ? <LockIcon fontSize="inherit" /> : <LockOpenIcon fontSize="inherit" />}
          </IconButton>
        ) : (
          <IconButton
            size="small"
            className="block-card__action"
            aria-label="Afficher en plein écran"
            onClick={() => onExpand(block.id)}
          >
            <OpenInFullIcon fontSize="inherit" />
          </IconButton>
        )}
        {/* la barre du titre est la seule zone qui déplace le bloc en mode édition */}
        <div className="block-card__header">
          <Typography variant="subtitle2">{chart.title}</Typography>
        </div>
        <div className="block-card__chart">{chart.render(theme)}</div>
      </Paper>

      {/* poignées de redimensionnement ajoutées par la grille */}
      {children}
    </div>
  )
})

export default BlockCard
