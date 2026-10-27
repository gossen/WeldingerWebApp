import { describe, expect, test } from 'vitest'
import { calc } from './weldCalc'

describe('Plasma (Handbuch Seite 27, Gerät 20-40 A)', () => {
  test('1,5 mm Stahl: Strom auf Gerätemindestwert 20 A, 1,5 bar', () => {
    const r = calc({ process: 'plasma', material: 'stahl', thickness: 1.5 })
    expect(r.current).toBe(20)
    expect(r.params.airPressure).toEqual({ value: 1.5, unit: 'bar', source: 'handbuch' })
    expect(r.warnings).toEqual([])
  })

  test.each([
    // Dicke, Strom (Mitte des Handbuchbereichs, auf 20-40 A begrenzt), Druck
    [2, 20, 1.5], [3, 28, 2], [4, 28, 2], [5, 35, 2.5], [6, 35, 2.5], [7, 40, 3], [8, 40, 3],
  ])('%s mm: %i A, %s bar', (thickness, current, pressure) => {
    const r = calc({ process: 'plasma', material: 'stahl', thickness })
    expect(r.current).toBe(current)
    expect(r.params.airPressure.value).toBe(pressure)
  })

  test('ab 8 mm: auf 40 A begrenzt, 4,5 bar und Warnung', () => {
    const r = calc({ process: 'plasma', material: 'stahl', thickness: 10 })
    expect(r.current).toBe(40)
    expect(r.params.airPressure.value).toBe(4.5)
    expect(r.warnings).toHaveLength(1)
  })

  test('8 mm warnt bereits (Gerät schafft nur 40 A, Tabelle nennt 40-50 A)', () => {
    expect(calc({ process: 'plasma', material: 'stahl', thickness: 8 }).warnings).toHaveLength(1)
  })

  test('über 15 mm: Warnung "nicht schneidbar"', () => {
    const r = calc({ process: 'plasma', material: 'stahl', thickness: 20 })
    expect(r.warnings.join(' ')).toMatch(/15 mm/)
  })
})

describe('MMA (Handbuch Seite 25, Gerät 10-160 A)', () => {
  test.each([
    // Dicke, Elektroden-Ø (Richtwert), Strom = Mitte des Handbuchbereichs
    [1.5, 2.0, 80], [2, 2.0, 80], [3, 2.5, 100], [4, 2.5, 100], [6, 3.25, 128], [8, 3.25, 128], [10, 4.0, 160],
  ])('%s mm Stahl: Elektrode %s mm, %i A', (thickness, diameter, current) => {
    const r = calc({ process: 'mma', material: 'stahl', thickness })
    expect(r.params.electrodeDiameter).toEqual({ value: diameter, unit: 'mm', source: 'richtwert' })
    expect(r.current).toBe(current)
    expect(r.params.current.source).toBe('handbuch')
  })

  test('Edelstahl: Edelstahlelektrode', () => {
    expect(calc({ process: 'mma', material: 'edel', thickness: 3 }).params.electrodeType.value).toMatch(/Edelstahl/)
  })

  test('Aluminium wird bei MMA nicht angeboten (Handbuch nennt nur Rutil, Edelstahl, Stahl, basisch)', () => {
    expect(() => calc({ process: 'mma', material: 'alu', thickness: 3 })).toThrow(/Aluminium/)
  })
})

describe('WIG (Handbuch Seiten 22-24, Gerät 10-200 A)', () => {
  test('3 mm Stahl: 105 A DC (35 A je mm, Handbuchrichtwert 30-40)', () => {
    const r = calc({ process: 'wig', material: 'stahl', thickness: 3 })
    expect(r.current).toBe(105)
    expect(r.params.currentType.value).toBe('DC')
    expect(r.params.current.source).toBe('handbuch')
  })

  test('3 mm Aluminium: AC, mehr Strom, AC-Balance 0 (Bereich -5 bis +5), keine AC-Frequenz', () => {
    const r = calc({ process: 'wig', material: 'alu', thickness: 3 })
    expect(r.current).toBe(126)
    expect(r.params.currentType.value).toBe('AC')
    expect(r.params.acBalance.value).toBe(0)
    expect(r.params.acFrequency).toBeUndefined()
  })

  test('Stahl hat keine AC-Balance', () => {
    expect(calc({ process: 'wig', material: 'stahl', thickness: 3 }).params.acBalance).toBeUndefined()
  })

  test('auf Gerätegrenzen 10-200 A begrenzt, über 200 A mit Warnung', () => {
    expect(calc({ process: 'wig', material: 'stahl', thickness: 0.2 }).current).toBe(10)
    const r = calc({ process: 'wig', material: 'stahl', thickness: 6 })
    expect(r.current).toBe(200)
    expect(r.warnings).toHaveLength(1)
  })

  test('Sequenz bei 3 mm Stahl (105 A)', () => {
    const p = calc({ process: 'wig', material: 'stahl', thickness: 3 }).params
    expect(p.preFlow.value).toBe(0.5)
    expect(p.startCurrent.value).toBe(32)
    expect(p.upSlope.value).toBe(0.6)
    expect(p.downSlope.value).toBe(1.4)
    expect(p.endCurrent.value).toBe(21)
  })

  test('Gasnachströmzeit liegt im Gerätebereich 10-20 s', () => {
    for (const thickness of [0.8, 3, 6]) {
      const post = calc({ process: 'wig', material: 'stahl', thickness }).params.postFlow.value as number
      expect(post).toBeGreaterThanOrEqual(10)
      expect(post).toBeLessThanOrEqual(20)
    }
  })

  test.each([[1, 35, 1.0], [3, 105, 1.6], [5, 175, 2.4]])('%s mm: %i A, Wolfram Ø %s mm', (thickness, current, tungsten) => {
    const r = calc({ process: 'wig', material: 'stahl', thickness })
    expect(r.current).toBe(current)
    expect(r.params.tungstenDiameter.value).toBe(tungsten)
  })
})

describe('MIG/MAG (Handbuch Seiten 18-20, Gerät 30-200 A, 16,5-24 V)', () => {
  const mig = (over: Partial<Parameters<typeof calc>[0]> = {}) =>
    calc({
      process: 'mig', material: 'stahl', thickness: 3,
      wire: { type: 'massiv', diameter: 0.8 }, ...over,
    })

  test('Aluminium ist bei MIG/MAG nicht erlaubt (nur WIG AC)', () => {
    expect(() => mig({ material: 'alu' })).toThrow(/Aluminium/)
  })

  test('ohne Drahtangabe: Fehler', () => {
    expect(() => calc({ process: 'mig', material: 'stahl', thickness: 3 })).toThrow(/Draht/)
  })

  test('3 mm Stahl, Massivdraht 0,8 mm: 121 A, Synergie, Brenner Plus, Vorschub ca. 6,7 m/min', () => {
    const r = mig()
    expect(r.current).toBe(121)
    expect(r.params.wireMode.value).toBe('synergie')
    expect(r.params.polarity.value).toBe('Brenner Plus')
    expect(r.params.wireSpeed.value).toBeCloseTo(6.7, 1)
    expect(r.params.voltage.value).toBeCloseTo(20.1, 0)
  })

  test.each([[0.6, 'manuell'], [0.8, 'synergie'], [1.0, 'synergie'], [1.2, 'synergie']] as const)(
    'Massivdraht %s mm: Modus %s',
    (diameter, mode) => {
      expect(mig({ wire: { type: 'massiv', diameter } }).params.wireMode.value).toBe(mode)
    },
  )

  test('dünnerer Draht braucht bei gleichem Strom mehr Vorschub', () => {
    const speed = (diameter: 0.6 | 0.8 | 1.0 | 1.2) =>
      mig({ wire: { type: 'massiv', diameter } }).params.wireSpeed.value as number
    expect(speed(0.6)).toBeGreaterThan(speed(0.8))
    expect(speed(0.8)).toBeGreaterThan(speed(1.0))
    expect(speed(1.0)).toBeGreaterThan(speed(1.2))
  })

  test.each([[0.6, 6, 'handbuch'], [0.8, 8, 'handbuch'], [1.0, 10, 'richtwert'], [1.2, 12, 'richtwert']] as const)(
    'Gasmenge Draht %s mm: %i l/min (%s)',
    (diameter, flow, source) => {
      const p = mig({ wire: { type: 'massiv', diameter } }).params.gasFlow
      expect(p).toEqual({ value: flow, unit: 'l/min', source })
    },
  )

  test('Fülldraht ohne Gas: Brenner Minus, keine Gasmenge, mehr Spannung als Massivdraht', () => {
    const solid = mig()
    const flux = mig({ wire: { type: 'fuell', diameter: 0.8 } })
    expect(flux.params.polarity.value).toBe('Brenner Minus')
    expect(flux.params.gasFlow).toBeUndefined()
    expect(flux.params.voltage.value as number).toBeGreaterThan(solid.params.voltage.value as number)
  })

  test('Fülldraht nur für Baustahl, nicht für Edelstahl', () => {
    expect(() => mig({ material: 'edel', wire: { type: 'fuell', diameter: 0.8 } })).toThrow(/Fülldraht/)
  })

  test('CO2 erhöht die Spannung um 1 V gegenüber Mischgas', () => {
    const co2 = mig({ gas: 'co2' }).params.voltage.value as number
    const m21 = mig({ gas: 'm21' }).params.voltage.value as number
    expect(co2 - m21).toBeCloseTo(1, 1)
  })

  test('Grenzen: über 200 A auf 200 A mit Warnung, Spannung 16,5-24 V', () => {
    const thick = mig({ thickness: 6 })
    expect(thick.current).toBe(200)
    expect(thick.warnings.join(' ')).toMatch(/mehrlagig/)
    expect(mig({ thickness: 0.2 }).params.voltage.value as number).toBeGreaterThanOrEqual(16.5)
  })
})

describe('Zusatzstab bei WIG (Richtwert: etwa 0,75 x Blechdicke, nächster lieferbarer Stab)', () => {
  const rod = (material: 'stahl' | 'edel' | 'alu', thickness: number) =>
    calc({ process: 'wig', material, thickness }).params.fillerRod

  test.each([[1, 1.2], [2, 1.6], [3, 2.4], [6, 3.0]])('Stahl %s mm: Stab Ø %s mm', (thickness, diameter) => {
    expect(rod('stahl', thickness)).toEqual({ value: diameter, unit: 'mm', source: 'richtwert' })
  })

  test('Aluminium: kleinster lieferbarer Stab 1,6 mm, bei 3 mm Blech 2,4 mm', () => {
    expect(rod('alu', 1)!.value).toBe(1.6)
    expect(rod('alu', 3)!.value).toBe(2.4)
  })

  test('Edelstahl hat auch dünne Stäbe (1,0 mm)', () => {
    expect(rod('edel', 0.8)!.value).toBe(1.0)
  })
})

describe('Düsenabstand bei Plasma (Richtwert)', () => {
  test('1,5–3 mm, Richtwert', () => {
    expect(calc({ process: 'plasma', material: 'stahl', thickness: 3 }).params.nozzleDistance)
      .toEqual({ value: '1,5–3 mm', source: 'richtwert' })
  })
})
