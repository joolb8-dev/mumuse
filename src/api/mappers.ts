// Conversion entre les formes du backend (DTO) et les types de l'interface.
// C'est le seul endroit qui connaît les deux vocabulaires.

import { CHART_TYPES, type Block, type BlockPin, type ChartType } from '../types/block'
import type { BlockDto } from './dtos'

function isChartType(value: string): value is ChartType {
  return (CHART_TYPES as readonly string[]).includes(value)
}

// Un type inconnu venant du serveur est une erreur claire, pas un chart cassé.
function toChartType(value: string): ChartType {
  if (!isChartType(value)) throw new Error(`Type de chart inconnu : "${value}"`)
  return value
}

// Un bloc n'est verrouillé que si le serveur donne aussi sa position figée.
function toPin(dto: BlockDto): BlockPin | null {
  if (!dto.locked || dto.pin_x === undefined || dto.pin_y === undefined) return null
  return { x: dto.pin_x, y: dto.pin_y }
}

export function toBlock(dto: BlockDto): Block {
  return {
    id: dto.block_id,
    type: toChartType(dto.chart_type),
    width: dto.w,
    height: dto.h,
    order: dto.position,
    pin: toPin(dto),
  }
}

export function toBlockDto(block: Block): BlockDto {
  return {
    block_id: block.id,
    chart_type: block.type,
    w: block.width,
    h: block.height,
    position: block.order,
    locked: block.pin !== null,
    pin_x: block.pin?.x,
    pin_y: block.pin?.y,
  }
}
