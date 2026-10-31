// Point d'entrée de l'interface : assemble le thème, la barre du haut et la grille.

import { useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './App.css'
import Dashboard from './components/Dashboard'
import TopBar from './components/TopBar'
import { themes } from './data/themes'
import { useBlocksEditor } from './hooks/useBlocksEditor'
import { loadThemeIndex, saveThemeIndex } from './lib/storage'

// Thème MUI construit à partir de notre définition de thème (voir data/themes.js).
function toMuiTheme(theme) {
  return createTheme({
    palette: {
      mode: theme.mode,
      primary: { main: theme.primary },
      background: { default: theme.background },
    },
    shape: { borderRadius: theme.radius },
  })
}

export default function App() {
  const { blocks, editing, toggleEditing, updateDraft } = useBlocksEditor()

  const [themeIndex, setThemeIndex] = useState(loadThemeIndex)
  const theme = themes[themeIndex]
  const muiTheme = useMemo(() => toMuiTheme(theme), [theme])

  const selectTheme = (index) => {
    setThemeIndex(index)
    saveThemeIndex(index)
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <TopBar
        themes={themes}
        themeIndex={themeIndex}
        onSelectTheme={selectTheme}
        editing={editing}
        onToggleEditing={toggleEditing}
      />
      <Dashboard blocks={blocks} theme={theme} editing={editing} onBlocksChange={updateDraft} />
    </ThemeProvider>
  )
}
