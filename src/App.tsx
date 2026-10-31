// Point d'entrée de l'interface : assemble le thème, la barre du haut et la grille.
// Il choisit aussi quoi afficher selon l'état des données : chargement, erreur, vide ou grille.

import { useMemo } from 'react'
import { Alert, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './App.css'
import Dashboard from './components/Dashboard'
import StateMessage from './components/StateMessage'
import TopBar from './components/TopBar'
import { themes } from './data/themes'
import { useBlocks } from './hooks/useBlocks'
import { useBlocksEditor } from './hooks/useBlocksEditor'
import { useThemeSelection } from './hooks/useThemeSelection'
import type { AppTheme } from './types/theme'

// Thème MUI construit à partir de notre définition de thème (voir data/themes.ts).
function toMuiTheme(theme: AppTheme) {
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
  const { blocks, status, reload, save } = useBlocks()
  const editor = useBlocksEditor(blocks, save)
  const { theme, themeIndex, selectTheme } = useThemeSelection()

  const muiTheme = useMemo(() => toMuiTheme(theme), [theme])

  // Contenu sous la barre : on traite d'abord les cas sans grille à afficher.
  let content
  if (status === 'loading') {
    content = <StateMessage loading message="Chargement des blocs…" />
  } else if (status === 'error') {
    content = (
      <StateMessage
        message="Impossible de charger les blocs."
        actionLabel="Réessayer"
        onAction={reload}
      />
    )
  } else if (editor.displayedBlocks.length === 0) {
    content = <StateMessage message="Aucun bloc à afficher." />
  } else {
    content = (
      <Dashboard
        blocks={editor.displayedBlocks}
        theme={theme}
        editing={editor.editing}
        onBlocksChange={editor.updateDraft}
      />
    )
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <TopBar
        themes={themes}
        themeIndex={themeIndex}
        onSelectTheme={selectTheme}
        editing={editor.editing}
        saving={editor.saving}
        onToggleEditing={editor.toggleEditing}
      />
      {editor.saveFailed && (
        <Alert severity="error" className="save-error">
          L'enregistrement a échoué. Vos modifications sont conservées, réessayez.
        </Alert>
      )}
      {content}
    </ThemeProvider>
  )
}
