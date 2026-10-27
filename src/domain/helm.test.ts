import { describe, expect, test } from 'vitest'
import { helmSettings, shadeFor } from './helm'

describe('shadeFor (DIN-Stufe nach AH-800-Handbuch)', () => {
  test('MIG/MAG bei 50 A: DIN 8', () => {
    expect(shadeFor('mig', 50)).toBe(8)
  })

  test('MIG/MAG: 9 ab 70 A (am Grenzwert gilt die dunklere Stufe)', () => {
    expect(shadeFor('mig', 69)).toBe(8)
    expect(shadeFor('mig', 70)).toBe(9)
  })

  test.each([
    [99, 9], [100, 10], [149, 10], [150, 11], [224, 11], [225, 12], [399, 12], [400, 13],
  ])('MIG/MAG bei %i A: DIN %i', (current, shade) => {
    expect(shadeFor('mig', current)).toBe(shade)
  })

  test.each([
    [29, 8], [30, 9], [69, 9], [70, 10], [124, 10], [125, 11], [199, 11], [200, 12], [299, 12], [300, 13], [350, 13],
  ])('WIG bei %i A: DIN %i', (current, shade) => {
    expect(shadeFor('wig', current)).toBe(shade)
  })

  test.each([
    [59, 8], [60, 9], [99, 9], [100, 10], [149, 10], [150, 11], [199, 11], [200, 12],
  ])('MMA bei %i A: DIN %i', (current, shade) => {
    expect(shadeFor('mma', current)).toBe(shade)
  })

  test.each([20, 30, 40])('Plasmaschneiden bei %i A: DIN 10', (current) => {
    expect(shadeFor('plasma', current)).toBe(10)
  })
})

describe('helmSettings (AH-800: SENSI 0-9, DELAY-Stufe 0-9)', () => {
  test('MIG/MAG 120 A: DIN 10 im Bereich 9-13, SENSI 8, DELAY 9 (2,0 s), Modus WELD', () => {
    expect(helmSettings('mig', 120)).toEqual({
      shade: 10, shadeRange: '9-13', mode: 'weld', sensitivity: 8, delayLevel: 9, delaySeconds: 2.0,
    })
  })

  test('WIG 20 A: DIN 8 im Bereich 4-8, SENSI 9 wegen niedrigem Strom', () => {
    const h = helmSettings('wig', 20)
    expect(h.shade).toBe(8)
    expect(h.shadeRange).toBe('4-8')
    expect(h.sensitivity).toBe(9)
  })

  test('Plasmaschneiden: Modus CUT', () => {
    expect(helmSettings('plasma', 40).mode).toBe('cut')
  })
})
