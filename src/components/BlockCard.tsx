// Carte d'un bloc : un titre et le chart correspondant à son type.
//
// react-grid-layout positionne et dimensionne le <div> extérieur (il lui injecte
// style, className et ref, et ajoute les poignées de redimensionnement). La
// marge entre les cartes vient donc du padding de ce <div>, pas de la carte.
//
// Le ref est transmis explicitement car la grille en a besoin pour mesurer le bloc.

import { forwardRef, type HTMLAttributes } from 'react'
import { Paper, Typography } from '@mui/material'
import { chartTypes } from '../data/chartTypes'
import type { Block } from '../types/block'
import type { AppTheme } from '../types/theme'

interface BlockCardProps extends HTMLAttributes<HTMLDivElement> {
  block: Block
  theme: AppTheme
  editing: boolean
}

const BlockCard = forwardRef<HTMLDivElement, BlockCardProps>(function BlockCard(
  { block, theme, editing, className = '', children, ...gridProps },
  ref,
) {
  const chart = chartTypes[block.type]

  return (
    <div ref={ref} className={`block ${className}`} {...gridProps}>
      <Paper
        variant={theme.outlined ? 'outlined' : 'elevation'}
        elevation={theme.outlined ? 0 : 2}
        className={editing ? 'block-card is-editing' : 'block-card'}
      >
        <Typography variant="subtitle2" className="block-card__title">
          {chart.title}
        </Typography>
        <div className="block-card__chart">{chart.render(theme)}</div>
      </Paper>

      {/* poignées de redimensionnement ajoutées par la grille */}
      {children}
    </div>
  )
})

export default BlockCard
