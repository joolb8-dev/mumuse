// Mode édition des blocs.
//
// Deux jeux de blocs coexistent :
//  - `blocks` : la version enregistrée (fournie par useBlocks)
//  - `draft`  : la copie en cours de modification (null hors mode édition)
//
// Pendant l'édition on travaille sur la copie ; "Enregistrer" l'envoie à la
// couche api, "Annuler" la jette. Si l'envoi échoue, on reste en édition pour
// ne rien perdre.

import { useState } from 'react'
import { areBlocksEqual } from '../lib/blocks'
import type { Block } from '../types/block'

export interface UseBlocksEditorResult {
  // blocs à afficher : la copie pendant l'édition, sinon la version enregistrée
  displayedBlocks: Block[]
  editing: boolean
  // la copie diffère de la version enregistrée
  hasUnsavedChanges: boolean
  saving: boolean
  saveFailed: boolean
  startEditing: () => void
  saveEditing: () => void
  cancelEditing: () => void
  updateDraft: (blocks: Block[]) => void
}

export function useBlocksEditor(
  blocks: Block[],
  save: (blocks: Block[]) => Promise<void>,
): UseBlocksEditorResult {
  const [draft, setDraft] = useState<Block[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)

  const startEditing = () => {
    setSaveFailed(false)
    setDraft(blocks)
  }

  // Envoie la copie, puis referme l'édition (en cas d'échec on reste en édition).
  const saveEditing = () => {
    if (draft === null) return
    setSaving(true)
    setSaveFailed(false)
    save(draft)
      .then(() => setDraft(null))
      .catch(() => setSaveFailed(true))
      .finally(() => setSaving(false))
  }

  // Jette la copie : l'affichage revient à la dernière version enregistrée.
  const cancelEditing = () => {
    setSaveFailed(false)
    setDraft(null)
  }

  return {
    displayedBlocks: draft ?? blocks,
    editing: draft !== null,
    hasUnsavedChanges: draft !== null && !areBlocksEqual(draft, blocks),
    saving,
    saveFailed,
    startEditing,
    saveEditing,
    cancelEditing,
    updateDraft: setDraft,
  }
}
