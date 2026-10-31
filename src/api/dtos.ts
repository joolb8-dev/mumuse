// Formes brutes échangées avec le backend.
//
// Ces types décrivent ce que le serveur envoie et reçoit, avec ses propres noms
// de champs. L'interface n'y touche jamais : elle passe par api/mappers.ts.
// Si le backend change un nom de champ, seuls ce fichier et le mapper bougent.

export interface BlockDto {
  block_id: string
  chart_type: string // volontairement large : le serveur peut envoyer un type inconnu
  w: number
  h: number
  position: number
  locked?: boolean // absent des données enregistrées avant l'ajout du verrouillage
}
