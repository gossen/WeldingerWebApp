import { describe, expect, test } from 'vitest'
import { gasOptionsFor, materialsFor, normalize, THICKNESSES, wireDiametersFor, wireTypesFor } from './options'
import type { Selection } from './options'

describe('materialsFor', () => {
  test('MIG/MAG und MMA: kein Aluminium (Handbuch)', () => {
    expect(materialsFor('mig')).toEqual(['stahl', 'edel'])
    expect(materialsFor('mma')).toEqual(['stahl', 'edel'])
  })
  test('WIG: auch Aluminium (AC)', () => {
    expect(materialsFor('wig')).toEqual(['stahl', 'edel', 'alu'])
  })
  test('Plasma: alle Werkstoffe', () => {
    expect(materialsFor('plasma')).toEqual(['stahl', 'edel', 'alu'])
  })
})

describe('wireTypesFor / wireDiametersFor', () => {
  test('Baustahl: Massiv- und Fülldraht, Edelstahl nur Massivdraht', () => {
    expect(wireTypesFor('stahl')).toEqual(['massiv', 'fuell'])
    expect(wireTypesFor('edel')).toEqual(['massiv'])
  })
  test('Durchmesser 0,6 / 0,8 / 1,0 / 1,2 mm für Massiv- und Fülldraht', () => {
    expect(wireDiametersFor('stahl', 'massiv')).toEqual([0.6, 0.8, 1.0, 1.2])
    expect(wireDiametersFor('stahl', 'fuell')).toEqual([0.6, 0.8, 1.0, 1.2])
    expect(wireDiametersFor('edel', 'massiv')).toEqual([0.6, 0.8, 1.0, 1.2])
  })
})

describe('gasOptionsFor (erste Option = Vorauswahl)', () => {
  test.each([
    ['mig', 'stahl', 'massiv', ['m21', 'co2']],
    ['mig', 'stahl', 'fuell', []],
    ['mig', 'edel', 'massiv', ['m12']],
    ['wig', 'alu', 'massiv', ['argon']],
    ['wig', 'stahl', 'massiv', ['argon']],
    ['mma', 'stahl', 'massiv', []],
    ['plasma', 'stahl', 'massiv', ['druckluft']],
  ] as const)('%s / %s / %s', (process, material, wireType, expected) => {
    expect(gasOptionsFor(process, material, wireType)).toEqual(expected)
  })
})

describe('normalize', () => {
  const base: Selection = {
    process: 'mig', material: 'stahl', thicknessIndex: 4, wireType: 'massiv', wireDiameter: 0.8, gas: 'm21',
  }

  test('gültige Auswahl bleibt unverändert', () => {
    expect(normalize(base)).toEqual(base)
  })
  test('Werkstoff nicht erlaubt: erster erlaubter Werkstoff', () => {
    expect(normalize({ ...base, material: 'alu' }).material).toBe('stahl')
  })
  test('Fülldraht bei Edelstahl: Massivdraht', () => {
    expect(normalize({ ...base, material: 'edel', wireType: 'fuell', gas: 'm12' }).wireType).toBe('massiv')
  })
  test('Gas nicht passend: erste Option; ohne Gasoption (Fülldraht): null', () => {
    expect(normalize({ ...base, gas: 'argon' }).gas).toBe('m21')
    expect(normalize({ ...base, wireType: 'fuell', gas: 'm21' }).gas).toBeNull()
  })
  test('Dickenindex wird auf die 11 Stufen begrenzt', () => {
    expect(normalize({ ...base, thicknessIndex: 99 }).thicknessIndex).toBe(THICKNESSES.length - 1)
    expect(normalize({ ...base, thicknessIndex: -3 }).thicknessIndex).toBe(0)
  })
})
