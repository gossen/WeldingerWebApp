import { describe, expect, test } from 'vitest'
import { PARAM_LABELS, PARAM_ORDER, paramLabel } from './labels'

describe('paramLabel', () => {
  test('Plasma: der Strom heißt Schneidstrom', () => {
    expect(paramLabel('plasma', 'current')).toBe('Schneidstrom')
  })
  test.each(['mig', 'wig', 'mma'] as const)('%s: der Strom heißt Schweißstrom', (process) => {
    expect(paramLabel(process, 'current')).toBe('Schweißstrom')
  })
  test('übrige Werte unabhängig vom Verfahren', () => {
    expect(paramLabel('mig', 'voltage')).toBe('Schweißspannung')
  })
  test('unbekannter Schlüssel: der Schlüssel selbst', () => {
    expect(paramLabel('mig', 'gibtEsNicht')).toBe('gibtEsNicht')
  })

  test('jeder angezeigte Wert hat eine eigene Bezeichnung', () => {
    for (const keys of Object.values(PARAM_ORDER)) {
      for (const key of keys) expect(PARAM_LABELS[key], key).toBeDefined()
    }
  })
})
