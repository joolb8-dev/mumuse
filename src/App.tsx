// Point d'entrée de l'interface : assemble les hooks (données, thème, disposition,
// édition) et les composants (barre du haut, zone des blocs).
// Il ne contient presque pas de logique : chaque morceau vit dans son propre fichier.

import { useMemo, type CSSProperties } from 'react'
import { Alert, CssBaseline, ThemeProvider } from '@mui/material'
import { useContainerWidth } from 'react-grid-layout'
import './App.css'
import BlocksArea from './components/BlocksArea'
import TopBar from './components/TopBar'
import { themes } from './data/themes'
import { useBlocks } from './hooks/useBlocks'
import { useBlocksEditor } from './hooks/useBlocksEditor'
import { useLayoutMode } from './hooks/useLayoutMode'
import { useThemeSelection } from './hooks/useThemeSelection'
import { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning'
import { MIN_BLOCK_SIZE_PX } from './lib/layoutItem'
import { toMuiTheme } from './lib/muiTheme'

export default function App() {
  // Largeur disponible pour la grille, mesurée sur le conteneur (mise à jour quand la
  // fenêtre change de taille). Elle vaut 0 tant que la mesure n'est pas faite.
  const { width, containerRef, mounted } = useContainerWidth()
  const containerWidth = mounted ? Math.max(MIN_BLOCK_SIZE_PX, Math.floor(width)) : 0

  // données et préférences
  const { blocks, status, reload, save } = useBlocks()
  const { layoutMode, switching, switchFailed, switchLayoutMode } = useLayoutMode(
    blocks,
    save,
    containerWidth,
  )
  const { theme, themeIndex, selectTheme } = useThemeSelection()

  // mode édition (copie de travail, enregistrer / annuler)
  const editor = useBlocksEditor(blocks, save, layoutMode)
  useUnsavedChangesWarning(editor.hasUnsavedChanges)

  const muiTheme = useMemo(() => toMuiTheme(theme), [theme])

  // Annuler jette les modifications : on demande confirmation s'il y en a.
  const handleCancelEditing = () => {
    if (editor.hasUnsavedChanges && !window.confirm('Abandonner les modifications non enregistrées ?')) {
      return
    }
    editor.cancelEditing()
  }

  const showError = editor.saveFailed || switchFailed
  const errorMessage = switchFailed
    ? 'Le changement de disposition a échoué, réessayez.'
    : "L'enregistrement a échoué. Vos modifications sont conservées, réessayez."

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

      {showError && (
        <Alert severity="error" className="save-error">
          {errorMessage}
        </Alert>
      )}

      {/* Le conteneur est toujours présent : c'est lui qu'on mesure pour connaître la
          largeur de la grille. Il porte aussi la couleur du cadre d'aimantation (App.css). */}
      <div className="dashboard">
        <div
          ref={containerRef}
          className="dashboard__grid"
          style={{ '--ghost-color': theme.primary } as CSSProperties}
        >
          <BlocksArea
            status={status}
            onRetry={reload}
            blocks={editor.displayedBlocks}
            theme={theme}
            layoutMode={layoutMode}
            containerWidth={containerWidth}
            editing={editor.editing}
            onBlocksChange={editor.updateDraft}
          />
        </div>
      </div>
    </ThemeProvider>
  )
}
