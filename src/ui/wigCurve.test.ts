import { describe, expect, test } from 'vitest'
import { wigCurve } from './wigCurve'
import type { WigTimes } from './wigCurve'

const values: WigTimes = {
  preFlow: 0.5, startCurrent: 32, upSlope: 0.6, current: 105, downSlope: 1.4, endCurrent: 21, postFlow: 10,
}
const W = 320
const H = 100

describe('wigCurve', () => {
  const curve = wigCurve(values, W, H)

  test('sieben Phasen in der Reihenfolge des Schweißzyklus', () => {
    expect(curve.phases.map((p) => p.phase)).toEqual(
      ['preFlow', 'start', 'upSlope', 'main', 'downSlope', 'end', 'postFlow'],
    )
  })

  test('Phasen schließen lückenlos aneinander und füllen die ganze Breite', () => {
    expect(curve.phases[0].x0).toBe(0)
    for (let i = 1; i < curve.phases.length; i++) {
      expect(curve.phases[i].x0).toBeCloseTo(curve.phases[i - 1].x1, 6)
    }
    expect(curve.phases[6].x1).toBeCloseTo(W, 6)
  })

  test('jede Phase ist mindestens 8 % breit, auch die kurze Anstiegszeit', () => {
    for (const p of curve.phases) expect(p.x1 - p.x0).toBeGreaterThanOrEqual(0.08 * W - 1e-6)
  })

  test('lange Phasen sind breiter als kurze (Nachströmen 10 s gegen Vorströmen 0,5 s)', () => {
    const width = (name: string) => {
      const p = curve.phases.find((q) => q.phase === name)!
      return p.x1 - p.x0
    }
    expect(width('postFlow')).toBeGreaterThan(width('preFlow'))
  })

  test('Stromhöhen proportional zum Hauptstrom, Hauptstrom oben', () => {
    const ys = curve.points.map(([, y]) => y)
    const yMain = Math.min(...ys)
    expect(yMain).toBeLessThan(H * 0.2)
    expect(ys).toContain(H) // 0 A
  })

  test('Start- und Endstrom liegen anteilig unter dem Hauptstrom', () => {
    const yMain = Math.min(...curve.points.map(([, y]) => y))
    const scale = (H - yMain) / 105
    const levels = curve.points.map(([, y]) => Math.round((H - y) / scale))
    expect(levels).toContain(32)
    expect(levels).toContain(105)
    expect(levels).toContain(21)
  })

  test('x wächst entlang des Linienzugs nie rückwärts', () => {
    for (let i = 1; i < curve.points.length; i++) {
      expect(curve.points[i][0]).toBeGreaterThanOrEqual(curve.points[i - 1][0])
    }
  })
})
