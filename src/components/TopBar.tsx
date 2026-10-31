// Barre du haut : boutons de thème à gauche, actions d'édition à droite.

import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import type { AppTheme } from '../types/theme'

interface TopBarProps {
  themes: AppTheme[]
  themeIndex: number
  onSelectTheme: (index: number) => void
  editing: boolean
  hasUnsavedChanges: boolean
  saving: boolean
  onStartEditing: () => void
  onSaveEditing: () => void
  onCancelEditing: () => void
}

export default function TopBar({
  themes,
  themeIndex,
  onSelectTheme,
  editing,
  hasUnsavedChanges,
  saving,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
}: TopBarProps) {
  return (
    <AppBar position="static" className="top-bar">
      <Toolbar className="top-bar__toolbar">
        {/* boutons de thème à gauche ; ce bloc prend la place restante et pousse les actions à droite */}
        <div className="top-bar__themes">
          {themes.map((theme, index) => (
            <Button
              key={theme.name}
              color="inherit"
              size="small"
              // le thème actif est mis en évidence par la classe is-active (voir App.css)
              className={index === themeIndex ? 'theme-button is-active' : 'theme-button'}
              onClick={() => onSelectTheme(index)}
            >
              {theme.name}
            </Button>
          ))}
        </div>

        {editing ? (
          <>
            {hasUnsavedChanges && (
              <Typography variant="body2" className="top-bar__unsaved">
                ● Modifications non enregistrées
              </Typography>
            )}
            <Button color="inherit" disabled={saving} onClick={onCancelEditing}>
              Annuler
            </Button>
            <Button color="inherit" variant="outlined" disabled={saving} onClick={onSaveEditing}>
              Enregistrer
            </Button>
          </>
        ) : (
          <Button color="inherit" variant="outlined" onClick={onStartEditing}>
            Modifier
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}
