import { useEffect, useMemo, useState } from 'react'
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

const chartTypes = {
  bar: {
    title: 'Ventes (bar)',
    render: () => (
      <BarChart
        xAxis={[{ scaleType: 'band', data: months }]}
        series={[{ data: [4, 7, 3, 9, 6, 8] }]}
      />
    ),
  },
  donut: {
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
  line: {
    title: 'Évolution (line)',
    render: () => (
      <LineChart
        xAxis={[{ scaleType: 'point', data: months }]}
        series={[{ data: [2, 5, 3, 8, 6, 10] }]}
      />
    ),
  },
  scatter: {
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
  gauge: {
    title: 'Objectif (gauge)',
    render: () => <Gauge value={72} valueMin={0} valueMax={100} />,
  },
}

// width et height en pixels
const initialBlocks = [
  { id: 'ventes', type: 'bar', width: 400, height: 300, order: 0 },
  { id: 'repartition', type: 'donut', width: 400, height: 300, order: 1 },
  { id: 'evolution', type: 'line', width: 400, height: 300, order: 2 },
  { id: 'nuage', type: 'scatter', width: 600, height: 300, order: 3 },
  { id: 'objectif', type: 'gauge', width: 400, height: 300, order: 4 },
]

const MIN_SIZE = 120
const STORAGE_KEY = 'mumuse-blocks'

function loadBlocks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    const valid =
      Array.isArray(saved) &&
      saved.length > 0 &&
      saved.every(
        (b) =>
          b.id &&
          chartTypes[b.type] &&
          Number.isFinite(b.width) &&
          Number.isFinite(b.height) &&
          Number.isFinite(b.order),
      )
    return valid ? saved : initialBlocks
  } catch {
    return initialBlocks
  }
}

// Place les blocs dans l'ordre, de gauche à droite, en passant à la ligne
// quand la largeur disponible est dépassée. 1 unité de grille = 1 pixel.
function flowLayout(blocks, containerWidth) {
  let x = 0
  let y = 0
  let rowHeight = 0
  return [...blocks]
    .sort((a, b) => a.order - b.order)
    .map((block) => {
      const w = Math.min(block.width, containerWidth)
      if (x > 0 && x + w > containerWidth) {
        x = 0
        y += rowHeight
        rowHeight = 0
      }
      const item = { i: block.id, x, y, w, h: block.height, minW: MIN_SIZE, minH: MIN_SIZE }
      x += w
      rowHeight = Math.max(rowHeight, block.height)
      return item
    })
}

// Retrouve l'ordre de lecture : on regroupe en lignes (un bloc rejoint la ligne
// courante s'il démarre dans la moitié haute de son premier bloc), puis par x.
function toOrderedBlocks(layout, blocks) {
  const byId = Object.fromEntries(blocks.map((b) => [b.id, b]))
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x)
  const rows = []
  for (const item of sorted) {
    const row = rows[rows.length - 1]
    if (row && item.y < row[0].y + row[0].h / 2) row.push(item)
    else rows.push([item])
  }
  return rows
    .flatMap((row) => row.sort((a, b) => a.x - b.x))
    .map(({ i, w, h }, order) => ({ id: i, type: byId[i].type, width: w, height: h, order }))
}

export default function App() {
  const { width, containerRef, mounted } = useContainerWidth()
  const [blocks, setBlocks] = useState(loadBlocks)
  useEffect(() => {
    console.log(blocks)
  }, [blocks])
  // blocs en cours de modification (null hors mode édition)
  const [draft, setDraft] = useState(null)
  const editing = draft !== null

  const containerWidth = Math.max(MIN_SIZE, Math.floor(width))
  const layout = useMemo(
    () => flowLayout(draft ?? blocks, containerWidth),
    [draft, blocks, containerWidth],
  )

  // Après un déplacement ou un redimensionnement, on retrouve l'ordre et on
  // re-tasse tout de suite : ce qu'on voit est ce qui sera enregistré.
  const settle = (next) => setDraft(toOrderedBlocks(next, draft))

  const toggleEditing = () => {
    if (!editing) {
      setDraft(blocks)
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch {
      // stockage indisponible : la disposition reste valable pour la session
    }
    setBlocks(draft)
    setDraft(null)
  }

  const byId = Object.fromEntries(blocks.map((b) => [b.id, b]))

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

      <Box sx={{ p: 2 }}>
        <div ref={containerRef}>
          {mounted && (
            <ReactGridLayout
              width={containerWidth}
              layout={layout}
              onDragStop={settle}
              onResizeStop={settle}
              gridConfig={{
                cols: containerWidth,
                rowHeight: 1,
                margin: [0, 0],
                containerPadding: [0, 0],
              }}
              dragConfig={{ enabled: editing }}
              resizeConfig={{ enabled: editing }}
              compactor={verticalCompactor}
            >
              {layout.map(({ i }) => {
                const chart = chartTypes[byId[i].type]
                return (
                  <Box key={i} sx={{ p: 1, boxSizing: 'border-box' }}>
                    <Paper
                      elevation={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        p: 1,
                        overflow: 'hidden',
                        cursor: editing ? 'move' : 'default',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ userSelect: 'none' }}>
                        {chart.title}
                      </Typography>
                      <Box sx={{ flex: 1, minHeight: 0 }}>{chart.render()}</Box>
                    </Paper>
                  </Box>
                )
              })}
            </ReactGridLayout>
          )}
        </div>
      </Box>
    </>
  )
}
