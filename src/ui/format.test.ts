import { describe, expect, test } from 'vitest'
import { formatParam } from './format'

describe('formatParam (Deutsch, Dezimalkomma)', () => {
  test('ganze Zahl mit Einheit', () => {
    expect(formatParam({ value: 121, unit: 'A', source: 'richtwert' })).toBe('121 A')
  })
  test('Dezimalzahl mit Komma', () => {
    expect(formatParam({ value: 0.8, unit: 'mm', source: 'handbuch' })).toBe('0,8 mm')
  })
  test('Text bleibt unverändert, ohne Einheit', () => {
    expect(formatParam({ value: 'Brenner Plus', source: 'handbuch' })).toBe('Brenner Plus')
  })
  test('Zahl ohne Einheit', () => {
    expect(formatParam({ value: 0, source: 'richtwert' })).toBe('0')
  })
})
