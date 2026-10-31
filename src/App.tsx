// Point d'entrée de l'interface : assemble le thème, la barre du haut et la grille.
// Il choisit aussi quoi afficher selon l'état des données : chargement, erreur, vide ou grille.

import { useMemo, type CSSProperties } from 'react'
import { Alert, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { useContainerWidth } from 'react-grid-layout'
import './App.css'
import Dashboard from './components/Dashboard'
import StateMessage from './components/StateMessage'
import TopBar from './components/TopBar'
import { themes } from './data/themes'
import { useBlocks } from './hooks/useBlocks'
import { useBlocksEditor } from './hooks/useBlocksEditor'
import { useLayoutMode } from './hooks/useLayoutMode'
import { useThemeSelection } from './hooks/useThemeSelection'
import { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning'
import { MIN_BLOCK_SIZE_PX } from './lib/gridLayout'
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
  // largeur disponible pour la grille, mesurée sur le conteneur (mise à jour au redimensionnement de la fenêtre)
  const { width, containerRef, mounted } = useContainerWidth()
  const containerWidth = Math.max(MIN_BLOCK_SIZE_PX, Math.floor(width))

  const { blocks, status, reload, save } = useBlocks()
  const { layoutMode, switching, switchFailed, switchLayoutMode } = useLayoutMode(
    blocks,
    save,
    containerWidth,
  )
  const editor = useBlocksEditor(blocks, save, layoutMode)
  const { theme, themeIndex, selectTheme } = useThemeSelection()

  const muiTheme = useMemo(() => toMuiTheme(theme), [theme])

  useUnsavedChangesWarning(editor.hasUnsavedChanges)

  // Annuler jette les modifications : on demande confirmation s'il y en a.
  const handleCancelEditing = () => {
    if (editor.hasUnsavedChanges && !window.confirm('Abandonner les modifications non enregistrées ?')) {
      return
    }
    editor.cancelEditing()
  }

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
  } else if (mounted) {
    content = (
      <Dashboard
        blocks={editor.displayedBlocks}
        theme={theme}
        layoutMode={layoutMode}
        containerWidth={containerWidth}
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
        layoutMode={layoutMode}
        layoutSwitchDisabled={editor.editing || switching}
        onSelectLayoutMode={switchLayoutMode}
        editing={editor.editing}
        hasUnsavedChanges={editor.hasUnsavedChanges}
        saving={editor.saving}
        onStartEditing={editor.startEditing}
        onSaveEditing={editor.saveEditing}
        onCancelEditing={handleCancelEditing}
      />
      {(editor.saveFailed || switchFailed) && (
        <Alert severity="error" className="save-error">
          {switchFailed
            ? 'Le changement de disposition a échoué, réessayez.'
            : "L'enregistrement a échoué. Vos modifications sont conservées, réessayez."}
        </Alert>
      )}

      {/* le conteneur est toujours présent pour que la largeur soit mesurée ;
          il porte aussi la couleur du cadre d'aperçu (voir App.css) */}
      <div className="dashboard">
        <div
          ref={containerRef}
          className="dashboard__grid"
          style={{ '--ghost-color': theme.primary } as CSSProperties}
        >
          {content}
        </div>
      </div>
    </ThemeProvider>
  )
}
