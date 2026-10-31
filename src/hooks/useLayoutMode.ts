// Disposition choisie (automatique ou libre), relue au chargement et enregistrée
// à chaque changement.
//
// Changer de disposition ne doit rien faire sauter à l'écran : on convertit donc
// d'abord les blocs actuels (leurs positions affichées deviennent leur x, y, ou
// leur ordre de lecture selon le sens), on les enregistre, puis on bascule.

import { useEffect, useState } from 'react'
import { preferencesApi } from '../api/preferencesApi'
import { blocksToLayout, layoutToBlocks } from '../lib/gridLayout'
import type { Block } from '../types/block'
import type { LayoutMode } from '../types/layoutMode'

const DEFAULT_LAYOUT_MODE: LayoutMode = 'auto'

export interface UseLayoutModeResult {
  layoutMode: LayoutMode
  switching: boolean
  switchFailed: boolean
  switchLayoutMode: (mode: LayoutMode) => void
}

export function useLayoutMode(
  blocks: Block[],
  save: (blocks: Block[]) => Promise<void>,
  containerWidth: number,
): UseLayoutModeResult {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(DEFAULT_LAYOUT_MODE)
  const [switching, setSwitching] = useState(false)
  const [switchFailed, setSwitchFailed] = useState(false)

  // relit la disposition enregistrée ; en cas d'échec on garde la disposition par défaut
  useEffect(() => {
    preferencesApi
      .getLayoutMode()
      .then((saved) => {
        if (saved) setLayoutMode(saved)
      })
      .catch(() => {})
  }, [])

  const switchLayoutMode = (mode: LayoutMode) => {
    if (mode === layoutMode || switching) return

    // positions actuellement affichées, reportées dans les blocs
    const converted = layoutToBlocks(blocksToLayout(blocks, containerWidth, layoutMode), blocks)

    setSwitching(true)
    setSwitchFailed(false)
    save(converted)
      .then(() => {
        setLayoutMode(mode)
        // la préférence est secondaire : un échec ne bloque pas le changement
        preferencesApi.saveLayoutMode(mode).catch(() => {})
      })
      .catch(() => setSwitchFailed(true))
      .finally(() => setSwitching(false))
  }

  return { layoutMode, switching, switchFailed, switchLayoutMode }
}
