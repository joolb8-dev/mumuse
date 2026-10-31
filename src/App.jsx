import { useState } from 'react'
import ReactGridLayout, { useContainerWidth, verticalCompactor } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { AppBar, Box, Button, CssBaseline, Paper, Toolbar, Typography } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'
import { ScatterChart } from '@mui/x-charts/ScatterChart'
import { Gauge } from '@mui/x-charts/Gauge'

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']

const widgets = {
  ventes: {
    title: 'Ventes (bar)',
    render: () => (
      <BarChart
        xAxis={[{ scaleType: 'band', data: months }]}
        series={[{ data: [4, 7, 3, 9, 6, 8] }]}
      />
    ),
  },
  repartition: {
    title: 'Répartition (donut)',
    render: () => (
      <PieChart
        series={[
          {
            innerRadius: 40,
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
  evolution: {
    title: 'Évolution (line)',
    render: () => (
      <LineChart
        xAxis={[{ scaleType: 'point', data: months }]}
        series={[{ data: [2, 5, 3, 8, 6, 10] }]}
      />
    ),
  },
  nuage: {
    title: 'Nuage (scatter)',
    render: () => (
      <ScatterChart
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
  objectif: {
    title: 'Objectif (gauge)',
    render: () => <Gauge value={72} valueMin={0} valueMax={100} />,
  },
}

const initialLayout = [
  { i: 'ventes', x: 0, y: 0, w: 4, h: 8 },
  { i: 'repartition', x: 4, y: 0, w: 4, h: 8 },
  { i: 'evolution', x: 8, y: 0, w: 4, h: 8 },
  { i: 'nuage', x: 0, y: 8, w: 6, h: 8 },
  { i: 'objectif', x: 6, y: 8, w: 6, h: 8 },
]

export default function App() {
  const { width, containerRef, mounted } = useContainerWidth()
  const [layout, setLayout] = useState(initialLayout)
  const [editing, setEditing] = useState(false)

  const toggleEditing = () => {
    if (editing) {
      console.log(layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })))
    }
    setEditing(!editing)
  }

  return (
    <>
      <CssBaseline />
      <AppBar position="static" sx={{ width: '100%' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mumuse
          </Typography>
          <Button color="inherit" variant="outlined" onClick={toggleEditing}>
            {editing ? 'Enregistrer' : 'Modifier'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box ref={containerRef} sx={{ p: 2 }}>
        {mounted && (
          <ReactGridLayout
            width={width}
            layout={layout}
            onLayoutChange={setLayout}
            gridConfig={{ cols: 12, rowHeight: 30 }}
            dragConfig={{ enabled: editing }}
            resizeConfig={{ enabled: editing }}
            compactor={verticalCompactor}
          >
            {layout.map(({ i }) => (
              <Paper
                key={i}
                elevation={2}
                sx={{ display: 'flex', flexDirection: 'column', p: 1, overflow: 'hidden', cursor: editing ? 'move' : 'default' }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ userSelect: 'none' }}
                >
                  {widgets[i].title}
                </Typography>
                <Box sx={{ flex: 1, minHeight: 0 }}>{widgets[i].render()}</Box>
              </Paper>
            ))}
          </ReactGridLayout>
        )}
      </Box>
    </>
  )
}
