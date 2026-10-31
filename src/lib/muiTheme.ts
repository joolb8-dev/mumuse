// Fabrique le thème MUI à partir de notre définition de thème (voir data/themes.ts).

import { createTheme } from '@mui/material'
import type { AppTheme } from '../types/theme'

export function toMuiTheme(theme: AppTheme) {
  return createTheme({
    palette: {
      mode: theme.mode,
      primary: { main: theme.primary },
      background: { default: theme.background },
    },
    shape: { borderRadius: theme.radius },
  })
}
