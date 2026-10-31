// Catalogue des types de charts.
//
// Un bloc ne stocke que son `type` ("bar", "donut"…). Ce fichier fait le lien
// entre ce type, un titre et la façon de dessiner le chart avec MUI X Charts.
// Chaque `render` reçoit le thème actif pour appliquer palette et arrondis.

import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'
import { ScatterChart } from '@mui/x-charts/ScatterChart'
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge'
import type { ReactNode } from 'react'
import type { ChartType } from '../types/block'
import type { AppTheme } from '../types/theme'

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']

// --- Réglages communs dérivés du thème ------------------------------------

// Une prop `colors` explicitement undefined écraserait la palette par défaut
// de MUI : on ne la passe que si le thème en définit une.
const colorsOf = (theme: AppTheme) => (theme.colors ? { colors: theme.colors } : {})

// Grille horizontale légère (thèmes personnalisés uniquement).
const gridOf = (theme: AppTheme) => (theme.plain ? undefined : { horizontal: true })

// Axes épurés : sans trait d'axe ni petits traits (thèmes personnalisés uniquement).
const cleanAxis = (theme: AppTheme) => (theme.plain ? {} : { disableLine: true, disableTicks: true })

// --- Types de charts -------------------------------------------------------

interface ChartDefinition {
  title: string
  render: (theme: AppTheme) => ReactNode
}

export const chartTypes: Record<ChartType, ChartDefinition> = {
  bar: {
    title: 'Ventes (bar)',
    render: (theme) => (
      <BarChart
        {...colorsOf(theme)}
        borderRadius={theme.barRadius}
        grid={gridOf(theme)}
        xAxis={[{ scaleType: 'band', data: months, ...cleanAxis(theme) }]}
        yAxis={[cleanAxis(theme)]}
        series={[{ data: [4, 7, 3, 9, 6, 8] }]}
      />
    ),
  },

  donut: {
    title: 'Répartition (donut)',
    render: (theme) => (
      <PieChart
        {...colorsOf(theme)}
        series={[
          {
            innerRadius: theme.innerRadius, // un rayon intérieur > 0 donne le trou du donut
            paddingAngle: theme.paddingAngle,
            cornerRadius: theme.cornerRadius,
            data: [
              { id: 0, value: 10, label: 'A' },
              { id: 1, value: 15, label: 'B' },
              { id: 2, value: 20, label: 'C' },
            ],
          },
        ]}
      />
    ),
  },

  line: {
    title: 'Évolution (line)',
    render: (theme) => (
      <LineChart
        {...colorsOf(theme)}
        grid={gridOf(theme)}
        xAxis={[{ scaleType: 'point', data: months, ...cleanAxis(theme) }]}
        yAxis={[cleanAxis(theme)]}
        series={[
          {
            data: [2, 5, 3, 8, 6, 10],
            area: theme.area,
            curve: theme.curve,
            // thème de base : on garde les points par défaut de MUI
            ...(theme.plain ? {} : { showMark: false }),
          },
        ]}
      />
    ),
  },

  scatter: {
    title: 'Nuage (scatter)',
    render: (theme) => (
      <ScatterChart
        {...colorsOf(theme)}
        grid={gridOf(theme)}
        series={[
          {
            data: [
              { x: 1, y: 2, id: 1 },
              { x: 2, y: 5, id: 2 },
              { x: 3, y: 3, id: 3 },
              { x: 4, y: 7, id: 4 },
              { x: 5, y: 6, id: 5 },
            ],
          },
        ]}
      />
    ),
  },

  gauge: {
    title: 'Objectif (gauge)',
    render: (theme) => (
      <Gauge
        value={72}
        valueMin={0}
        valueMax={100}
        cornerRadius={theme.cornerRadius ? '50%' : 0}
        // la jauge n'a pas de prop `colors` : on colore l'arc directement
        sx={theme.colors && { [`& .${gaugeClasses.valueArc}`]: { fill: theme.colors[0] } }}
      />
    ),
  },
}
