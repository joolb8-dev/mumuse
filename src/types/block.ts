// Types métier d'un bloc de la grille. Ce fichier est la seule définition de
// `Block` : tout le reste de l'appli l'importe d'ici.

// Types de charts disponibles. Une union (et non `string`) pour que le
// compilateur refuse une faute de frappe ou un type inconnu.
export const CHART_TYPES = ['bar', 'donut', 'line', 'scatter', 'gauge'] as const
export type ChartType = (typeof CHART_TYPES)[number]

// Un bloc = un chart sur la grille.
export interface Block {
  id: string // identifiant unique et stable (sert de clé)
  type: ChartType
  width: number // pixels
  height: number // pixels
  order: number // rang de lecture : de gauche à droite, puis ligne par ligne
  locked: boolean // verrouillé : ne peut être ni déplacé ni redimensionné
}
