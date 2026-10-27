import type { Process } from '../domain/helm'
import type { GasOption } from '../domain/options'
import type { Material, WireDiameter, WireType } from '../domain/weldCalc'

export const PROCESS_LABELS: Record<Process, string> = {
  mig: 'MIG/MAG',
  wig: 'WIG',
  mma: 'E-Hand',
  plasma: 'Plasma',
}

export const MATERIAL_LABELS: Record<Material, string> = {
  stahl: 'Baustahl',
  edel: 'Edelstahl',
  alu: 'Aluminium',
}

export const WIRE_TYPE_LABELS: Record<WireType, string> = {
  massiv: 'Massivdraht',
  fuell: 'Fülldraht (ohne Gas)',
}

export const WIRE_DIAMETER_LABELS: Record<WireDiameter, string> = {
  0.6: '0,6 mm',
  0.8: '0,8 mm',
  1.0: '1,0 mm',
  1.2: '1,2 mm',
}

export const GAS_LABELS: Record<GasOption, string> = {
  m21: 'Ar/CO₂ 82/18 (M21)',
  co2: 'CO₂ 100 % (C1)',
  m12: 'Ar/CO₂ 98/2 (M12)',
  argon: 'Argon 4.6',
  druckluft: 'Druckluft',
}

export const PARAM_LABELS: Record<string, string> = {
  current: 'Schweißstrom',
  voltage: 'Schweißspannung',
  wireSpeed: 'Drahtvorschub',
  wireDiameter: 'Drahtdurchmesser',
  wireMode: 'Programm am Gerät',
  polarity: 'Polarität',
  gasFlow: 'Gasmenge',
  currentType: 'Stromart',
  preFlow: 'Gasvorströmzeit',
  startCurrent: 'Startstrom',
  upSlope: 'Anstiegszeit',
  downSlope: 'Abstiegszeit',
  endCurrent: 'Endstrom',
  postFlow: 'Gasnachströmzeit',
  acBalance: 'AC-Balance (−5 … +5)',
  tungstenDiameter: 'Wolframelektrode Ø',
  tungstenType: 'Elektrodentyp',
  electrodeDiameter: 'Elektroden-Ø',
  electrodeType: 'Elektrodentyp',
  airPressure: 'Luftdruck',
  fillerRod: 'Zusatzstab Ø',
  nozzleDistance: 'Düsenabstand',
}

/** Anzeigereihenfolge je Verfahren. */
export const PARAM_ORDER: Record<Process, string[]> = {
  mig: ['wireMode', 'current', 'voltage', 'wireSpeed', 'wireDiameter', 'polarity', 'gasFlow'],
  wig: [
    'currentType', 'current', 'preFlow', 'startCurrent', 'upSlope', 'downSlope', 'endCurrent',
    'postFlow', 'acBalance', 'tungstenDiameter', 'tungstenType', 'fillerRod', 'gasFlow',
  ],
  mma: ['current', 'electrodeDiameter', 'electrodeType'],
  plasma: ['current', 'airPressure', 'nozzleDistance'],
}

/** Bezeichnung eines Werts; beim Plasma heißt der Strom Schneidstrom. */
export function paramLabel(process: Process, key: string): string {
  if (process === 'plasma' && key === 'current') return 'Schneidstrom'
  return PARAM_LABELS[key] ?? key
}
