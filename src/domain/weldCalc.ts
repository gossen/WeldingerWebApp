import type { Process } from './helm'

export type Material = 'stahl' | 'edel' | 'alu'
export type Source = 'handbuch' | 'richtwert'

export interface Param {
  value: number | string
  unit?: string
  source: Source
}

export type WireType = 'massiv' | 'fuell'
export type WireDiameter = 0.6 | 0.8 | 1.0 | 1.2
export type Gas = 'm21' | 'co2' | 'm12'

export interface CalcInput {
  process: Process
  material: Material
  thickness: number
  /** Nur MIG/MAG: Drahtart und Durchmesser. */
  wire?: { type: WireType; diameter: WireDiameter }
  /** Nur MIG/MAG mit Massivdraht; Standard: M21 (Baustahl) bzw. M12 (Edelstahl). */
  gas?: Gas
}

export interface CalcResult {
  current: number
  params: Record<string, Param>
  warnings: string[]
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const mid = ([low, high]: [number, number]) => (low + high) / 2

// --- Plasma: Handbuch Seite 27, Gerät 20-40 A ---------------------------------
const PLASMA_LIMITS = { min: 20, max: 40, warnFromThickness: 8, maxThickness: 15 }
/** [Obergrenze Dicke mm, Strombereich A, Druckbereich bar] */
const PLASMA_TABLE: [number, [number, number], [number, number]][] = [
  [2, [15, 20], [1.5, 1.5]],
  [4, [20, 35], [2, 2]],
  [6, [30, 40], [2.5, 2.5]],
  [8, [35, 45], [3, 3]],
  [12, [40, 50], [4, 5]],
]

function calcPlasma(thickness: number): CalcResult {
  const row = PLASMA_TABLE.find(([limit]) => thickness <= limit) ?? PLASMA_TABLE[PLASMA_TABLE.length - 1]
  const current = clamp(Math.round(mid(row[1])), PLASMA_LIMITS.min, PLASMA_LIMITS.max)
  const warnings: string[] = []
  if (thickness > PLASMA_LIMITS.maxThickness) {
    warnings.push(`Über ${PLASMA_LIMITS.maxThickness} mm ist mit diesem Gerät kein Plasmaschnitt möglich.`)
  } else if (thickness >= PLASMA_LIMITS.warnFromThickness) {
    warnings.push(`Ab ${PLASMA_LIMITS.warnFromThickness} mm braucht die Tabelle mehr als 40 A: Schnittqualität nicht gewährleistet, langsam schneiden.`)
  }
  return {
    current,
    params: {
      current: { value: current, unit: 'A', source: 'handbuch' },
      airPressure: { value: mid(row[2]), unit: 'bar', source: 'handbuch' },
      nozzleDistance: { value: '1,5–3 mm', source: 'richtwert' },
    },
    warnings,
  }
}

// --- MMA: Handbuch Seite 25, Gerät 10-160 A -------------------------------------
const MMA_LIMITS = { min: 10, max: 160 }
/** [Elektroden-Ø mm, Strombereich A] */
const MMA_ELECTRODES: [number, [number, number]][] = [
  [2.0, [60, 100]],
  [2.5, [80, 120]],
  [3.25, [108, 148]],
  [4.0, [140, 180]],
]
/** Welche Elektrode zu welcher Blechdicke passt, nennt das Handbuch nicht: Richtwert. */
const MMA_THICKNESS_LIMITS = [2, 4, 8]

function calcMma(material: Material, thickness: number): CalcResult {
  if (material === 'alu') {
    throw new Error('Aluminium wird beim Elektrodenhandschweißen nicht angeboten (Handbuch: Rutil, Edelstahl, Stahl, basisch).')
  }
  const index = MMA_THICKNESS_LIMITS.findIndex((limit) => thickness <= limit)
  const [diameter, range] = MMA_ELECTRODES[index === -1 ? MMA_ELECTRODES.length - 1 : index]
  const current = clamp(Math.round(mid(range)), MMA_LIMITS.min, MMA_LIMITS.max)
  return {
    current,
    params: {
      current: { value: current, unit: 'A', source: 'handbuch' },
      electrodeDiameter: { value: diameter, unit: 'mm', source: 'richtwert' },
      electrodeType: {
        value: material === 'edel' ? 'Edelstahlelektrode (z. B. E 308L/316L)' : 'Rutilelektrode',
        source: 'richtwert',
      },
    },
    warnings: [],
  }
}

// --- WIG: Handbuch Seiten 22-24, Gerät 10-200 A ---------------------------------
const WIG_LIMITS = { min: 10, max: 200 }
/** Handbuch: 30-40 A je mm (Mitte 35). Aluminium nennt das Handbuch nicht: Richtwert. */
const WIG_AMPS_PER_MM: Record<Material, number> = { stahl: 35, edel: 35, alu: 42 }
/** Handbuch Seite 24: Wolfram-Ø 1,0 = 15-80 A, 1,6 = 70-150 A, 2,4 = 150-250 A. */
const WIG_TUNGSTEN: [number, number][] = [[70, 1.0], [150, 1.6], [250, 2.4]]
const WIG_TUNGSTEN_TYPE: Record<Material, string> = {
  stahl: 'Lymox Pink',
  edel: 'rot oder Lymox Pink',
  alu: 'WL-15 gold',
}
const round1 = (value: number) => Math.round(value * 10) / 10

/** Lieferbare WIG-Zusatzstäbe in mm (Handbuch, Zubehörtabellen). */
const WIG_ROD_SIZES: Record<Material, number[]> = {
  stahl: [1.2, 1.6, 2.0, 2.4, 3.0],
  edel: [1.0, 1.2, 1.6, 2.0, 2.4, 3.2, 4.0, 5.0],
  alu: [1.6, 2.0, 2.4, 3.2, 4.0],
}
/** Faustregel aus dem Prototyp: halb so dick bis gleich dick wie das Blech, hier die Mitte. */
const WIG_ROD_PER_THICKNESS = 0.75

const nearest = (sizes: number[], target: number) =>
  sizes.reduce((best, size) => (Math.abs(size - target) < Math.abs(best - target) ? size : best))

function calcWig(material: Material, thickness: number): CalcResult {
  const raw = Math.round(WIG_AMPS_PER_MM[material] * thickness)
  const current = clamp(raw, WIG_LIMITS.min, WIG_LIMITS.max)
  const warnings: string[] = []
  if (raw > WIG_LIMITS.max) {
    warnings.push(`Mehr als ${WIG_LIMITS.max} A nötig: Gerät am Limit, Fuge anschrägen und mehrlagig schweißen.`)
  }
  const tungstenRow = WIG_TUNGSTEN.find(([limit]) => current <= limit) ?? WIG_TUNGSTEN[WIG_TUNGSTEN.length - 1]
  const params: Record<string, Param> = {
    current: { value: current, unit: 'A', source: material === 'alu' ? 'richtwert' : 'handbuch' },
    currentType: { value: material === 'alu' ? 'AC' : 'DC', source: 'handbuch' },
    preFlow: { value: 0.5, unit: 's', source: 'handbuch' },
    startCurrent: { value: Math.max(10, Math.round(0.3 * current)), unit: 'A', source: 'richtwert' },
    upSlope: { value: round1(clamp(0.2 * thickness, 0.2, 1.5)), unit: 's', source: 'richtwert' },
    downSlope: { value: round1(clamp(0.5 + 0.3 * thickness, 0.5, 3)), unit: 's', source: 'richtwert' },
    endCurrent: { value: Math.max(10, Math.round(0.2 * current)), unit: 'A', source: 'richtwert' },
    postFlow: { value: clamp(Math.round(current / 10), 10, 20), unit: 's', source: 'richtwert' },
    tungstenDiameter: { value: tungstenRow[1], unit: 'mm', source: 'handbuch' },
    tungstenType: { value: WIG_TUNGSTEN_TYPE[material], source: 'handbuch' },
    fillerRod: {
      value: nearest(WIG_ROD_SIZES[material], WIG_ROD_PER_THICKNESS * thickness),
      unit: 'mm',
      source: 'richtwert',
    },
    gasFlow: { value: round1(2.5 * tungstenRow[1] + 2), unit: 'l/min', source: 'richtwert' },
  }
  if (material === 'alu') {
    params.acBalance = { value: 0, source: 'richtwert' }
  }
  return { current, params, warnings }
}

// --- MIG/MAG: Handbuch Seiten 18-20, Gerät 30-200 A, 16,5-24 V --------------------
const MIG_LIMITS = { minCurrent: 30, maxCurrent: 200, minVoltage: 16.5, maxVoltage: 24, minSpeed: 2, maxSpeed: 15 }
/** Strom = 25 + k * Dicke (Faustformel, nicht im Handbuch). Fülldraht (nur Baustahl) wie Stahl. */
const MIG_K: Record<Exclude<Material, 'alu'>, number> = { stahl: 32, edel: 28 }
/** Drahtvorschub = Strom / Teiler; 0,6 mm aus dem Querschnittsverhältnis abgeleitet. */
const MIG_SPEED_DIVISOR: Record<WireDiameter, number> = { 0.6: 10, 0.8: 18, 1.0: 25, 1.2: 36 }
/** Handbuch Seite 20: Synergieprogramme nur für 0,8 / 1,0 / 1,2 mm, 0,6 mm nur manuell. */
const MIG_SYNERGY_DIAMETERS: WireDiameter[] = [0.8, 1.0, 1.2]
/** Handbuch Seite 19: 0,6 mm = 6 l/min, 0,8 mm = 8 l/min; darüber 10 x Ø (Faustformel). */
const MIG_GAS_FLOW: Record<WireDiameter, { value: number; source: Source }> = {
  0.6: { value: 6, source: 'handbuch' },
  0.8: { value: 8, source: 'handbuch' },
  1.0: { value: 10, source: 'richtwert' },
  1.2: { value: 12, source: 'richtwert' },
}

function calcMig(input: CalcInput): CalcResult {
  const { material, thickness, wire } = input
  if (material === 'alu') {
    throw new Error('Aluminium ist bei MIG/MAG nicht vorgesehen (Handbuch): bitte WIG AC verwenden.')
  }
  if (!wire) {
    throw new Error('Für MIG/MAG müssen Drahtart und Drahtdurchmesser angegeben werden.')
  }
  if (wire.type === 'fuell' && material !== 'stahl') {
    throw new Error('Fülldraht ist laut Handbuch nur für Baustahl vorgesehen.')
  }
  const raw = Math.round(25 + MIG_K[material] * thickness)
  const current = clamp(raw, MIG_LIMITS.minCurrent, MIG_LIMITS.maxCurrent)
  const warnings: string[] = []
  if (raw > MIG_LIMITS.maxCurrent) {
    warnings.push(`Mehr als ${MIG_LIMITS.maxCurrent} A nötig: Gerät am Limit, Fuge anschrägen und mehrlagig schweißen.`)
  }
  const gas = input.gas ?? (material === 'edel' ? 'm12' : 'm21')
  const extraVoltage = wire.type === 'fuell' ? 1.5 : gas === 'co2' ? 1 : 0
  const voltage = round1(clamp(14 + 0.05 * current + extraVoltage, MIG_LIMITS.minVoltage, MIG_LIMITS.maxVoltage))
  const speed = round1(clamp(current / MIG_SPEED_DIVISOR[wire.diameter], MIG_LIMITS.minSpeed, MIG_LIMITS.maxSpeed))
  const params: Record<string, Param> = {
    current: { value: current, unit: 'A', source: 'richtwert' },
    voltage: { value: voltage, unit: 'V', source: 'richtwert' },
    wireSpeed: { value: speed, unit: 'm/min', source: 'richtwert' },
    wireDiameter: { value: wire.diameter, unit: 'mm', source: 'handbuch' },
    wireMode: { value: MIG_SYNERGY_DIAMETERS.includes(wire.diameter) ? 'synergie' : 'manuell', source: 'handbuch' },
    polarity: { value: wire.type === 'fuell' ? 'Brenner Minus' : 'Brenner Plus', source: 'handbuch' },
  }
  if (wire.type === 'massiv') {
    params.gasFlow = { ...MIG_GAS_FLOW[wire.diameter], unit: 'l/min' }
  }
  return { current, params, warnings }
}

export function calc(input: CalcInput): CalcResult {
  switch (input.process) {
    case 'plasma':
      return calcPlasma(input.thickness)
    case 'mma':
      return calcMma(input.material, input.thickness)
    case 'wig':
      return calcWig(input.material, input.thickness)
    case 'mig':
      return calcMig(input)
  }
}
