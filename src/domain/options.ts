import type { Process } from './helm'
import type { Material, WireDiameter, WireType } from './weldCalc'

export type GasOption = 'm21' | 'co2' | 'm12' | 'argon' | 'druckluft'

export interface Selection {
  process: Process
  material: Material
  thicknessIndex: number
  wireType: WireType
  wireDiameter: WireDiameter
  gas: GasOption | null
}

export const THICKNESSES = [0.8, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12]

/** Aluminium: Handbuch sieht es nur mit WIG AC vor (nicht MIG/MAG, nicht MMA). */
const MATERIALS: Record<Process, Material[]> = {
  mig: ['stahl', 'edel'],
  wig: ['stahl', 'edel', 'alu'],
  mma: ['stahl', 'edel'],
  plasma: ['stahl', 'edel', 'alu'],
}

/** Fülldraht ist laut Handbuch nur für Baustahl vorgesehen. */
const WIRE_TYPES: Record<Material, WireType[]> = {
  stahl: ['massiv', 'fuell'],
  edel: ['massiv'],
  alu: [],
}

const WIRE_DIAMETERS: WireDiameter[] = [0.6, 0.8, 1.0, 1.2]
const DEFAULT_WIRE_DIAMETER: WireDiameter = 0.8

export function materialsFor(process: Process): Material[] {
  return MATERIALS[process]
}

export function wireTypesFor(material: Material): WireType[] {
  return WIRE_TYPES[material]
}

export function wireDiametersFor(_material: Material, _type: WireType): WireDiameter[] {
  return WIRE_DIAMETERS
}

export function gasOptionsFor(process: Process, material: Material, wireType: WireType): GasOption[] {
  switch (process) {
    case 'mig':
      if (wireType === 'fuell') return []
      return material === 'edel' ? ['m12'] : ['m21', 'co2']
    case 'wig':
      return ['argon']
    case 'plasma':
      return ['druckluft']
    case 'mma':
      return []
  }
}

const firstOr = <T>(allowed: T[], value: T, fallback: T): T => (allowed.includes(value) ? value : fallback)

export function normalize(selection: Selection): Selection {
  const materials = materialsFor(selection.process)
  const material = firstOr(materials, selection.material, materials[0])
  const wireTypes = wireTypesFor(material)
  const wireType = wireTypes.length ? firstOr(wireTypes, selection.wireType, wireTypes[0]) : 'massiv'
  const gasOptions = gasOptionsFor(selection.process, material, wireType)
  return {
    process: selection.process,
    material,
    thicknessIndex: Math.min(THICKNESSES.length - 1, Math.max(0, Math.round(selection.thicknessIndex))),
    wireType,
    wireDiameter: firstOr(wireDiametersFor(material, wireType), selection.wireDiameter, DEFAULT_WIRE_DIAMETER),
    gas: gasOptions.length ? firstOr(gasOptions, selection.gas as GasOption, gasOptions[0]) : null,
  }
}
