import { useEffect, useMemo, useState } from 'react'
import ReactGridLayout, { useContainerWidth, verticalCompactor } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Paper,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'
import { ScatterChart } from '@mui/x-charts/ScatterChart'
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge'

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']

// Chaque thème règle le mode MUI, la palette des charts et quelques options de forme
const themes = [
  {
    name: 'Theme 1',
    mode: 'light',
    primary: '#2a78d6',
    background: '#f4f4f1',
    colors: ['#2a78d6', '#85b7eb', '#cfe1f7'],
    outlined: true,
    radius: 8,
    barRadius: 4,
    innerRadius: 60,
    paddingAngle: 0,
    cornerRadius: 0,
    area: false,
    curve: 'linear',
  },
  {
    name: 'Theme 2',
    mode: 'dark',
    primary: '#3987e5',
    background: '#121211',
    colors: ['#3987e5', '#199e70', '#d95926'],
    outlined: true,
    radius: 8,
    barRadius: 4,
    innerRadius: 55,
    paddingAngle: 0,
    cornerRadius: 0,
    area: true,
    curve: 'monotoneX',
  },
  {
    name: 'Theme 3',
    mode: 'light',
    primary: '#e8836a',
    background: '#f6f1ee',
    colors: ['#e8836a', '#f4b8a6', '#f9dcd2'],
    outlined: false,
    radius: 16,
    barRadius: 8,
    innerRadius: 50,
    paddingAngle: 3,
    cornerRadius: 8,
    area: true,
    curve: 'monotoneX',
  },
  {
    name: 'Theme 4',
    mode: 'light',
    primary: '#52514e',
    background: '#f4f4f1',
    colors: ['#b4b2a9', '#d3d1c7', '#c2410c'],
    outlined: true,
    radius: 8,
    barRadius: 4,
    innerRadius: 60,
    paddingAngle: 0,
    cornerRadius: 0,
    area: false,
    curve: 'linear',
  },
  {
    name: 'Theme 5',
    mode: 'light',
    primary: '#334155',
    background: '#eceff2',
    colors: ['#475569', '#b45309', '#94a3b8'],
    outlined: true,
    radius: 6,
    barRadius: 3,
    innerRadius: 55,
    paddingAngle: 0,
    cornerRadius: 0,
    area: false,
    curve: 'linear',
  },
]

const chartTypes = {
  bar: {
    title: 'Ventes (bar)',
    render: (t) => (
      <BarChart
        colors={t.colors}
        borderRadius={t.barRadius}
        grid={{ horizontal: true }}
        xAxis={[{ scaleType: 'band', data: months, disableLine: true, disableTicks: true }]}
        yAxis={[{ disableLine: true, disableTicks: true }]}
        series={[{ data: [4, 7, 3, 9, 6, 8] }]}
      />
    ),
  },
  donut: {
    title: 'Répartition (donut)',
    render: (t) => (
      <PieChart
        colors={t.colors}
        series={[
          {
            innerRadius: t.innerRadius,
            paddingAngle: t.paddingAngle,
            cornerRadius: t.cornerRadius,
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
    render: (t) => (
      <LineChart
        colors={t.colors}
        grid={{ horizontal: true }}
        xAxis={[{ scaleType: 'point', data: months, disableLine: true, disableTicks: true }]}
        yAxis={[{ disableLine: true, disableTicks: true }]}
        series={[{ data: [2, 5, 3, 8, 6, 10], area: t.area, curve: t.curve, showMark: false }]}
      />
    ),
  },
  scatter: {
    title: 'Nuage (scatter)',
    render: (t) => (
      <ScatterChart
        colors={t.colors}
        grid={{ horizontal: true }}
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
    render: (t) => (
      <Gauge
        value={72}
        valueMin={0}
        valueMax={100}
        cornerRadius={t.cornerRadius ? '50%' : 0}
        sx={{ [`& .${gaugeClasses.valueArc}`]: { fill: t.colors[0] } }}
      />
    ),
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
const THEME_KEY = 'mumuse-theme'

function loadThemeIndex() {
  try {
    const saved = Number(localStorage.getItem(THEME_KEY))
    return Number.isInteger(saved) && saved >= 0 && saved < themes.length ? saved : 0
  } catch {
    return 0
  }
}

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

  const [themeIndex, setThemeIndex] = useState(loadThemeIndex)
  const t = themes[themeIndex]
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: t.mode,
          primary: { main: t.primary },
          background: { default: t.background },
        },
        shape: { borderRadius: t.radius },
      }),
    [t],
  )

  const selectTheme = (index) => {
    setThemeIndex(index)
    try {
      localStorage.setItem(THEME_KEY, String(index))
    } catch {
      // stockage indisponible : le thème reste valable pour la session
    }
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AppBar position="static" sx={{ width: '100%' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mumuse
          </Typography>
          {themes.map((theme, index) => (
            <Button
              key={theme.name}
              color="inherit"
              size="small"
              variant={index === themeIndex ? 'contained' : 'text'}
              sx={index === themeIndex ? { bgcolor: 'rgba(255,255,255,0.25)' } : undefined}
              onClick={() => selectTheme(index)}
            >
              {theme.name}
            </Button>
          ))}
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
              resizeConfig={{ enabled: editing, handles: ['e', 's', 'se'] }}
              compactor={verticalCompactor}
            >
              {layout.map(({ i }) => {
                const chart = chartTypes[byId[i].type]
                return (
                  <Box key={i} sx={{ p: 1, boxSizing: 'border-box' }}>
                    <Paper
                      variant={t.outlined ? 'outlined' : 'elevation'}
                      elevation={t.outlined ? 0 : 2}
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
                      <Box sx={{ flex: 1, minHeight: 0 }}>{chart.render(t)}</Box>
                    </Paper>
                  </Box>
                )
              })}
            </ReactGridLayout>
          )}
        </div>
      </Box>
    </ThemeProvider>
  )
}
