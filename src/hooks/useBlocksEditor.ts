// Mode édition des blocs.
//
// Deux jeux de blocs coexistent :
//  - `blocks` : la version enregistrée (fournie par useBlocks)
//  - `draft`  : la copie en cours de modification (null hors mode édition)
//
// Pendant l'édition on travaille sur la copie ; "Enregistrer" l'envoie à la
// couche api. Si l'envoi échoue, on reste en édition pour ne rien perdre.

import { useState } from 'react'
import type { Block } from '../types/block'

export interface UseBlocksEditorResult {
  // blocs à afficher : la copie pendant l'édition, sinon la version enregistrée
  displayedBlocks: Block[]
  editing: boolean
  saving: boolean
  saveFailed: boolean
  toggleEditing: () => void
  updateDraft: (blocks: Block[]) => void
}

export function useBlocksEditor(
  blocks: Block[],
  save: (blocks: Block[]) => Promise<void>,
): UseBlocksEditorResult {
  const [draft, setDraft] = useState<Block[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)

  const toggleEditing = () => {
    // "Modifier" : on ouvre une copie
    if (draft === null) {
      setSaveFailed(false)
      setDraft(blocks)
      return
    }

    // "Enregistrer" : on envoie la copie, puis on referme l'édition
    setSaving(true)
    setSaveFailed(false)
    save(draft)
      .then(() => setDraft(null))
      .catch(() => setSaveFailed(true))
      .finally(() => setSaving(false))
  }

  return {
    displayedBlocks: draft ?? blocks,
    editing: draft !== null,
    saving,
    saveFailed,
    toggleEditing,
    updateDraft: setDraft,
  }
}
