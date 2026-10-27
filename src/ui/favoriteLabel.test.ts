import { describe, expect, test } from 'vitest'
import { favoriteLabel } from './favoriteLabel'
import type { Selection } from '../domain/options'

const base: Selection = {
  process: 'mig', material: 'stahl', thicknessIndex: 4, wireType: 'massiv', wireDiameter: 0.8, gas: 'm21',
}

describe('favoriteLabel', () => {
  test('MIG/MAG mit Massivdraht: Draht erscheint im Text', () => {
    expect(favoriteLabel(base)).toBe('MIG/MAG · Baustahl · 3 mm · Massiv 0,8 mm')
  })
  test('MIG/MAG mit Fülldraht', () => {
    expect(favoriteLabel({ ...base, wireType: 'fuell', wireDiameter: 1.2, gas: null }))
      .toBe('MIG/MAG · Baustahl · 3 mm · Fülldraht 1,2 mm')
  })
  test('WIG: ohne Draht, Dezimalkomma bei der Dicke', () => {
    expect(favoriteLabel({ ...base, process: 'wig', material: 'alu', thicknessIndex: 2, gas: 'argon' }))
      .toBe('WIG · Aluminium · 1,5 mm')
  })
})
