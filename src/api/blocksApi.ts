// Accès aux blocs pour le reste de l'appli.
//
// Les hooks et composants n'utilisent que cette interface. Aujourd'hui elle
// s'appuie sur le faux backend ; brancher un vrai serveur revient à remplacer
// l'implémentation ci-dessous, sans toucher à l'interface.

import type { Block } from '../types/block'
import { toBlock, toBlockDto } from './mappers'
import { mockBackend } from './mockBackend'

export interface BlocksApi {
  list(): Promise<Block[]>
  save(blocks: Block[]): Promise<void>
}

export const blocksApi: BlocksApi = {
  async list() {
    const dtos = await mockBackend.getBlocks()
    return dtos.map(toBlock)
  },

  async save(blocks) {
    await mockBackend.putBlocks(blocks.map(toBlockDto))
  },
}
