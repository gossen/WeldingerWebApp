import { describe, expect, test } from 'vitest'
import { evaluate } from './evaluate'
import { THICKNESSES } from './options'
import type { Selection } from './options'

const base: Selection = {
  process: 'mig', material: 'stahl', thicknessIndex: THICKNESSES.indexOf(3),
  wireType: 'massiv', wireDiameter: 0.8, gas: 'm21',
}

describe('evaluate', () => {
  test('MIG/MAG 3 mm Stahl: Helm richtet sich nach dem berechneten Strom (121 A: DIN 10)', () => {
    const e = evaluate(base)
    expect(e.result.current).toBe(121)
    expect(e.helm.shade).toBe(10)
  })

  test('CO2 als Gas erhöht die Spannung gegenüber Mischgas', () => {
    const co2 = evaluate({ ...base, gas: 'co2' }).result.params.voltage.value as number
    const m21 = evaluate(base).result.params.voltage.value as number
    expect(co2).toBeGreaterThan(m21)
  })

  test('ungültige Auswahl wird korrigiert (Alu bei MIG/MAG -> Stahl)', () => {
    const e = evaluate({ ...base, material: 'alu' })
    expect(e.selection.material).toBe('stahl')
  })

  test('Fülldraht: Brenner Minus, kein Gas', () => {
    const e = evaluate({ ...base, wireType: 'fuell', gas: null })
    expect(e.result.params.polarity.value).toBe('Brenner Minus')
    expect(e.selection.gas).toBeNull()
  })

  test('WIG Alu 3 mm: AC, 126 A, Helm DIN 11', () => {
    const e = evaluate({ ...base, process: 'wig', material: 'alu', gas: 'argon' })
    expect(e.result.params.currentType.value).toBe('AC')
    expect(e.helm.shade).toBe(11)
  })

  test('Plasma 3 mm: Helm im Modus CUT', () => {
    const e = evaluate({ ...base, process: 'plasma', gas: 'druckluft' })
    expect(e.helm.mode).toBe('cut')
    expect(e.result.current).toBe(28)
  })
})
