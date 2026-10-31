// Blocs affichés tant que rien n'a été enregistré.
//
// Un bloc = un chart sur la grille :
//  - id     : identifiant unique et stable (sert de clé)
//  - type   : type de chart, voir chartTypes.jsx
//  - width  : largeur en pixels
//  - height : hauteur en pixels
//  - order  : rang de lecture (de gauche à droite, puis ligne par ligne)

export const initialBlocks = [
  { id: 'ventes', type: 'bar', width: 400, height: 300, order: 0 },
  { id: 'repartition', type: 'donut', width: 400, height: 300, order: 1 },
  { id: 'evolution', type: 'line', width: 400, height: 300, order: 2 },
  { id: 'nuage', type: 'scatter', width: 600, height: 300, order: 3 },
  { id: 'objectif', type: 'gauge', width: 400, height: 300, order: 4 },
]
