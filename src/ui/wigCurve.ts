export type WigPhase = 'preFlow' | 'start' | 'upSlope' | 'main' | 'downSlope' | 'end' | 'postFlow'

export interface WigTimes {
  preFlow: number
  startCurrent: number
  upSlope: number
  current: number
  downSlope: number
  endCurrent: number
  postFlow: number
}

export interface PhaseSpan {
  phase: WigPhase
  x0: number
  x1: number
}

export interface WigCurve {
  width: number
  height: number
  phases: PhaseSpan[]
  /** Stromverlauf als Linienzug [x, y]; y = height bedeutet 0 A. */
  points: [number, number][]
}

/** Darstellungsdauer in s für Phasen ohne einstellbare Zeit (Start halten, Schweißen, Ende halten). */
const HOLD_START = 0.5
const HOLD_MAIN = 3
const HOLD_END = 0.5
/** Jede Phase bekommt mindestens diesen Anteil der Breite, den Rest teilen sich die Phasen nach Dauer. */
const MIN_SHARE = 0.08
/** Oberer Rand: der Hauptstrom steht nicht am Bildrand. */
const TOP_MARGIN = 0.1

export function wigCurve(values: WigTimes, width: number, height: number): WigCurve {
  const order: [WigPhase, number][] = [
    ['preFlow', values.preFlow],
    ['start', HOLD_START],
    ['upSlope', values.upSlope],
    ['main', HOLD_MAIN],
    ['downSlope', values.downSlope],
    ['end', HOLD_END],
    ['postFlow', values.postFlow],
  ]
  const total = order.reduce((sum, [, seconds]) => sum + seconds, 0)
  const flexible = 1 - MIN_SHARE * order.length

  let x = 0
  const phases: PhaseSpan[] = order.map(([phase, seconds]) => {
    const x0 = x
    x += (MIN_SHARE + (flexible * seconds) / total) * width
    return { phase, x0, x1: phase === 'postFlow' ? width : x }
  })

  const top = height * TOP_MARGIN
  const y = (amps: number) => height - (amps / values.current) * (height - top)
  const span = (name: WigPhase) => phases.find((p) => p.phase === name)!

  const points: [number, number][] = [
    [span('preFlow').x1, height],
    [span('start').x0, y(values.startCurrent)],
    [span('start').x1, y(values.startCurrent)],
    [span('upSlope').x1, y(values.current)],
    [span('main').x1, y(values.current)],
    [span('downSlope').x1, y(values.endCurrent)],
    [span('end').x1, y(values.endCurrent)],
    [span('end').x1, height],
    [width, height],
  ]
  return { width, height, phases, points }
}
