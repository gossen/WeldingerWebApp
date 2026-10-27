import type { Param } from '../domain/weldCalc'

const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })

export function formatParam({ value, unit }: Param): string {
  const text = typeof value === 'number' ? numberFormat.format(value) : value
  return unit ? `${text} ${unit}` : text
}
