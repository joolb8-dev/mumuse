// Chargement et enregistrement des blocs via la couche api.
//
// Expose un statut explicite ('loading', 'error' ou 'ready') pour que l'écran
// puisse afficher chaque cas : attente, échec, ou données disponibles.

import { useCallback, useEffect, useState } from 'react'
import { blocksApi } from '../api/blocksApi'
import type { Block } from '../types/block'

export type LoadStatus = 'loading' | 'error' | 'ready'

export interface UseBlocksResult {
  blocks: Block[]
  status: LoadStatus
  reload: () => void
  save: (blocks: Block[]) => Promise<void>
}

export function useBlocks(): UseBlocksResult {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const reload = useCallback(() => {
    setStatus('loading')
    blocksApi
      .list()
      .then((loaded) => {
        setBlocks(loaded)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  // chargement au premier affichage
  useEffect(reload, [reload])

  // Liste des blocs dans la console, au chargement et après chaque enregistrement.
  useEffect(() => {
    if (status === 'ready') console.log(blocks)
  }, [blocks, status])

  // Enregistre puis garde la version enregistrée. En cas d'échec l'erreur remonte
  // à l'appelant, qui peut garder les modifications en cours.
  const save = useCallback(async (toSave: Block[]) => {
    await blocksApi.save(toSave)
    setBlocks(toSave)
  }, [])

  return { blocks, status, reload, save }
}
