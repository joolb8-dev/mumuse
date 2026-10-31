// Thèmes proposés dans la barre du haut.
//
// Chaque thème règle :
//  - le thème MUI (mode clair/sombre, couleur principale, fond, arrondi des cartes)
//  - le rendu des charts (palette, arrondis, aire sous la courbe, etc.)
//
// Le thème 1 est le rendu MUI par défaut : `plain: true` désactive les réglages
// de style des charts, et `colors: undefined` garde leur palette d'origine.

export const themes = [
  {
    name: 'Theme 1',
    plain: true,
    mode: 'light',
    primary: '#1976d2',
    background: '#ffffff',
    colors: undefined,
    outlined: false, // cartes avec ombre
    radius: 4,
    barRadius: 0,
    innerRadius: 40,
    paddingAngle: 0,
    cornerRadius: 0,
    area: false,
    curve: undefined,
  },
  {
    name: 'Theme 2',
    mode: 'dark',
    primary: '#3987e5',
    background: '#121211',
    colors: ['#3987e5', '#199e70', '#d95926'],
    outlined: true, // cartes avec bordure fine
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
