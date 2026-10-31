// État des blocs et du mode édition.
//
// Deux jeux de blocs coexistent :
//  - `blocks` : la version enregistrée
//  - `draft`  : la copie en cours de modification (null hors mode édition)
//
// Pendant l'édition on travaille sur la copie ; "Enregistrer" la valide et la
// sauvegarde, ce qui fige la grille.

import { useEffect, useState } from 'react'
import { loadBlocks, saveBlocks } from '../lib/storage'

export function useBlocksEditor() {
  const [blocks, setBlocks] = useState(loadBlocks)
  const [draft, setDraft] = useState(null)

  const editing = draft !== null

  // Liste des blocs dans la console, au chargement et après chaque enregistrement.
  useEffect(() => {
    console.log(blocks)
  }, [blocks])

  // "Modifier" ouvre une copie ; "Enregistrer" la valide, la sauvegarde et la ferme.
  const toggleEditing = () => {
    if (!editing) {
      setDraft(blocks)
      return
    }
    saveBlocks(draft)
    setBlocks(draft)
    setDraft(null)
  }

  return {
    // blocs à afficher : la copie pendant l'édition, sinon la version enregistrée
    blocks: draft ?? blocks,
    editing,
    toggleEditing,
    updateDraft: setDraft,
  }
}
