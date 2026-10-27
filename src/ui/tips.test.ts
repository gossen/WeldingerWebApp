import { describe, expect, test } from 'vitest'
import type { Process } from '../domain/helm'
import { HELM_KEYS, tipFor } from './tips'
import { PARAM_ORDER } from './labels'

const processes = Object.keys(PARAM_ORDER) as Process[]

describe('tipFor', () => {
  test.each(processes)('%s: jeder angezeigte Wert hat einen Erklärtext', (process) => {
    for (const key of PARAM_ORDER[process]) {
      const tip = tipFor(process, key)
      expect(tip, `${process}.${key}`).toBeDefined()
      expect(tip!.what.length).toBeGreaterThan(20)
      expect(tip!.tolerance.length).toBeGreaterThan(20)
    }
  })

  test('alle Helmwerte haben einen Erklärtext', () => {
    for (const key of HELM_KEYS) expect(tipFor('mig', key), key).toBeDefined()
  })

  test('der Schweißstrom wird je Verfahren eigens erklärt', () => {
    expect(tipFor('plasma', 'current')!.what).not.toBe(tipFor('wig', 'current')!.what)
  })

  test('unbekannter Schlüssel: kein Text', () => {
    expect(tipFor('mig', 'gibtEsNicht')).toBeUndefined()
  })

  test('Texte nennen die Handbuchbereiche des Geräts', () => {
    expect(tipFor('wig', 'postFlow')!.tolerance).toMatch(/10[–-]20 s/)
    expect(tipFor('wig', 'acBalance')!.tolerance).toMatch(/−5/)
    expect(tipFor('plasma', 'airPressure')!.tolerance).toMatch(/1,5/)
    expect(tipFor('mig', 'delay')!.tolerance).toMatch(/2,0 s/)
  })

  test('Texte aus dem Prototyp sind übernommen (Praxisanpassungen)', () => {
    expect(tipFor('mig', 'wireSpeed')!.tolerance).toMatch(/Knistern/)
    expect(tipFor('wig', 'current')!.tolerance).toMatch(/Kehlnaht/)
    expect(tipFor('mig', 'gasFlow')!.tolerance).toMatch(/Zugluft/)
  })

  test('nichts zur AC-Frequenz: das Gerät hat keine einstellbare', () => {
    for (const process of processes) {
      for (const key of [...PARAM_ORDER[process], 'shade', 'sensitivity', 'delay', 'mode']) {
        const tip = tipFor(process, key)!
        expect(tip.what + tip.tolerance, `${process}.${key}`).not.toMatch(/AC-Frequenz|Hz/)
      }
    }
  })
})
