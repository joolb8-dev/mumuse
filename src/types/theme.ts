// Types d'un thème de l'appli (voir data/themes.ts pour les valeurs).

export interface AppTheme {
  name: string
  // Thème de base : rendu MUI par défaut, sans réglage de style des charts.
  plain?: boolean
  mode: 'light' | 'dark'
  primary: string
  background: string
  // Palette des charts. Absente = palette par défaut de MUI.
  colors?: string[]
  outlined: boolean // cartes avec bordure fine (true) ou avec ombre (false)
  radius: number // arrondi des cartes, en pixels
  barRadius: number
  innerRadius: number // rayon du trou du donut
  paddingAngle: number // espace entre les segments du donut
  cornerRadius: number
  area: boolean // aire sous la courbe
  curve?: 'linear' | 'monotoneX'
}
