// Barre du haut : titre, boutons de thème et bouton Modifier / Enregistrer.

import { AppBar, Button, Toolbar, Typography } from '@mui/material'

export default function TopBar({ themes, themeIndex, onSelectTheme, editing, onToggleEditing }) {
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

        <Button color="inherit" variant="outlined" onClick={onToggleEditing}>
          {editing ? 'Enregistrer' : 'Modifier'}
        </Button>
      </Toolbar>
    </AppBar>
  )
}
