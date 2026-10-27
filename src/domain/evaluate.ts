import { helmSettings } from './helm'
import type { HelmSettings } from './helm'
import { normalize, THICKNESSES } from './options'
import type { GasOption, Selection } from './options'
import { calc } from './weldCalc'
import type { CalcResult, Gas } from './weldCalc'

export interface Evaluation {
  selection: Selection
  result: CalcResult
  helm: HelmSettings
}

const MIG_GASES: GasOption[] = ['m21', 'co2', 'm12']

/** Korrigiert die Auswahl, berechnet die Geräteeinstellung und leitet daraus den Helm ab. */
export function evaluate(input: Selection): Evaluation {
  const selection = normalize(input)
  const { process, material, wireType, wireDiameter, gas } = selection
  const result = calc({
    process,
    material,
    thickness: THICKNESSES[selection.thicknessIndex],
    wire: process === 'mig' ? { type: wireType, diameter: wireDiameter } : undefined,
    gas: gas && MIG_GASES.includes(gas) ? (gas as Gas) : undefined,
  })
  return { selection, result, helm: helmSettings(process, result.current) }
}
