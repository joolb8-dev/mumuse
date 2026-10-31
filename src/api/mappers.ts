// Conversion entre les formes du backend (DTO) et les types de l'interface.
// C'est le seul endroit qui connaît les deux vocabulaires.

import { CHART_TYPES, type Block, type ChartType } from '../types/block'
import type { BlockDto } from './dtos'

function isChartType(value: string): value is ChartType {
  return (CHART_TYPES as readonly string[]).includes(value)
}

// Un type inconnu venant du serveur est une erreur claire, pas un chart cassé.
function toChartType(value: string): ChartType {
  if (!isChartType(value)) throw new Error(`Type de chart inconnu : "${value}"`)
  return value
}

export function toBlock(dto: BlockDto): Block {
  return {
    id: dto.block_id,
    type: toChartType(dto.chart_type),
    width: dto.w,
    height: dto.h,
    order: dto.position,
    x: dto.x ?? dto.pin_x ?? 0,
    y: dto.y ?? dto.pin_y ?? 0,
    locked: dto.locked ?? false,
  }
}

export function toBlockDto(block: Block): BlockDto {
  return {
    block_id: block.id,
    chart_type: block.type,
    w: block.width,
    h: block.height,
    position: block.order,
    x: block.x,
    y: block.y,
    locked: block.locked,
  }
}
