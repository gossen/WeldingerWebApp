export type Process = 'mig' | 'wig' | 'mma' | 'plasma'

interface ShadeTable {
  /** [Obergrenze in A (exklusiv), Stufe]; darüber gilt `above`. */
  steps: [number, number][]
  above: number
}

/** Dunkelstufen nach Weldinger AH-800 Handbuch (Seite 4), Grenzen aus dem Diagramm abgelesen. */
const TABLES: Record<Process, ShadeTable> = {
  mig: { steps: [[70, 8], [100, 9], [150, 10], [225, 11], [400, 12]], above: 13 },
  wig: { steps: [[30, 8], [70, 9], [125, 10], [200, 11], [300, 12]], above: 13 },
  mma: { steps: [[60, 8], [100, 9], [150, 10], [200, 11], [300, 12]], above: 13 },
  plasma: { steps: [], above: 10 },
}

export function shadeFor(process: Process, current: number): number {
  const { steps, above } = TABLES[process]
  const step = steps.find(([limit]) => current < limit)
  return step ? step[1] : above
}

export interface HelmSettings {
  shade: number
  shadeRange: '4-8' | '9-13'
  mode: 'weld' | 'cut'
  sensitivity: number
  delayLevel: number
  delaySeconds: number
}

/** Handbuch: SENSI 8 für die meisten Anwendungen, 9 bei sehr niedrigem Strom (Richtwert), DELAY-Stufe 9 = 2,0 s. */
const LOW_CURRENT_LIMIT = 30
const DELAY_LEVEL = 9
const DELAY_SECONDS = 2.0

export function helmSettings(process: Process, current: number): HelmSettings {
  const shade = shadeFor(process, current)
  return {
    shade,
    shadeRange: shade <= 8 ? '4-8' : '9-13',
    mode: process === 'plasma' ? 'cut' : 'weld',
    sensitivity: process === 'wig' && current < LOW_CURRENT_LIMIT ? 9 : 8,
    delayLevel: DELAY_LEVEL,
    delaySeconds: DELAY_SECONDS,
  }
}
