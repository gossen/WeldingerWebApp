import { describe, expect, test } from 'vitest'
import { addFavorite, FAVORITES_KEY, hasFavorite, loadFavorites, MAX_FAVORITES, removeFavorite, saveFavorites } from './favorites'
import type { Selection } from '../domain/options'

const sel = (thicknessIndex: number, over: Partial<Selection> = {}): Selection => ({
  process: 'mig', material: 'stahl', thicknessIndex, wireType: 'massiv', wireDiameter: 0.8, gas: 'm21', ...over,
})

const memory = (initial?: string) => {
  const data = new Map<string, string>(initial === undefined ? [] : [[FAVORITES_KEY, initial]])
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) }
}

describe('addFavorite', () => {
  test('neueste zuerst', () => {
    expect(addFavorite([sel(1)], sel(2))).toEqual([sel(2), sel(1)])
  })
  test('Duplikate werden nicht angelegt', () => {
    expect(addFavorite([sel(1)], sel(1))).toEqual([sel(1)])
  })
  test('höchstens 20 Einträge, der älteste fällt weg', () => {
    const full = Array.from({ length: MAX_FAVORITES }, (_, i) => sel(i % 11, { wireDiameter: i < 11 ? 0.6 : 1.0 }))
    const next = addFavorite(full, sel(0, { process: 'wig', gas: 'argon' }))
    expect(next).toHaveLength(MAX_FAVORITES)
    expect(next[0].process).toBe('wig')
    expect(next).not.toContainEqual(full[MAX_FAVORITES - 1])
  })
})

describe('removeFavorite', () => {
  test('entfernt genau den gleichen Eintrag', () => {
    expect(removeFavorite([sel(2), sel(1)], sel(2))).toEqual([sel(1)])
  })
})

describe('saveFavorites / loadFavorites', () => {
  test('Rundreise über den Speicher', () => {
    const storage = memory()
    saveFavorites(storage, [sel(2), sel(1)])
    expect(loadFavorites(storage)).toEqual([sel(2), sel(1)])
  })
  test('leerer oder fehlender Speicher: leere Liste', () => {
    expect(loadFavorites(memory())).toEqual([])
  })
  test('kaputtes JSON: leere Liste', () => {
    expect(loadFavorites(memory('{kaputt'))).toEqual([])
  })
  test('ungültige Einträge werden verworfen, gültige bleiben', () => {
    const raw = JSON.stringify([sel(2), { process: 'laser' }, 'x', sel(1, { material: 'alu' })])
    expect(loadFavorites(memory(raw))).toEqual([sel(2)])
  })
  test('Speicher wirft Fehler: App läuft weiter', () => {
    const broken = { getItem: () => { throw new Error('gesperrt') }, setItem: () => { throw new Error('gesperrt') } }
    expect(loadFavorites(broken)).toEqual([])
    expect(() => saveFavorites(broken, [sel(1)])).not.toThrow()
  })
})

describe('hasFavorite', () => {
  test('erkennt gleiche Auswahl, unterscheidet Draht und Gas', () => {
    const list = [sel(2)]
    expect(hasFavorite(list, sel(2))).toBe(true)
    expect(hasFavorite(list, sel(3))).toBe(false)
    expect(hasFavorite(list, sel(2, { wireDiameter: 1.0 }))).toBe(false)
    expect(hasFavorite(list, sel(2, { gas: 'co2' }))).toBe(false)
  })
})
