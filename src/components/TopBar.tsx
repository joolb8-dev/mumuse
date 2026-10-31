// Barre du haut : titre, boutons de thème et bouton Modifier / Enregistrer.

import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import type { AppTheme } from '../types/theme'

interface TopBarProps {
  themes: AppTheme[]
  themeIndex: number
  onSelectTheme: (index: number) => void
  editing: boolean
  saving: boolean
  onToggleEditing: () => void
}

export default function TopBar({
  themes,
  themeIndex,
  onSelectTheme,
  editing,
  saving,
  onToggleEditing,
}: TopBarProps) {
  return (
    <AppBar position="static" className="top-bar">
      <Toolbar className="top-bar__toolbar">
        <Typography variant="h6" className="top-bar__title">
          Mumuse
        </Typography>

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

        <Button color="inherit" variant="outlined" disabled={saving} onClick={onToggleEditing}>
          {editing ? 'Enregistrer' : 'Modifier'}
        </Button>
      </Toolbar>
    </AppBar>
  )
}
