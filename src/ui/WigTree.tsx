import { useTheme } from '@mui/material'
import type { Param } from '../domain/weldCalc'
import { wigCurve } from './wigCurve'
import type { WigPhase } from './wigCurve'

const W = 320
const H = 110

const PHASE_LABELS: Record<WigPhase, string> = {
  preFlow: 'Vor', start: 'Start', upSlope: 'Auf', main: 'Schweißen', downSlope: 'Ab', end: 'Ende', postFlow: 'Nach',
}

/** Welcher Parameter zu welcher Phase gehört (zum Hervorheben beim Antippen). */
export const PHASE_FOR_PARAM: Record<string, WigPhase> = {
  preFlow: 'preFlow', startCurrent: 'start', upSlope: 'upSlope', current: 'main',
  downSlope: 'downSlope', endCurrent: 'end', postFlow: 'postFlow',
}

const num = (params: Record<string, Param>, key: string) => Number(params[key].value)

export function WigTree({ params, activeKey }: { params: Record<string, Param>; activeKey: string | null }) {
  const theme = useTheme()
  const curve = wigCurve(
    {
      preFlow: num(params, 'preFlow'), startCurrent: num(params, 'startCurrent'), upSlope: num(params, 'upSlope'),
      current: num(params, 'current'), downSlope: num(params, 'downSlope'), endCurrent: num(params, 'endCurrent'),
      postFlow: num(params, 'postFlow'),
    },
    W, H,
  )
  const active = activeKey ? PHASE_FOR_PARAM[activeKey] : undefined
  const gas = curve.phases[0].x0
  const gasEnd = curve.phases[6].x1
  const line = curve.points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const description =
    `Schweißbaum: Gas strömt ${num(params, 'preFlow')} s vor, der Strom startet mit ${num(params, 'startCurrent')} A, ` +
    `steigt in ${num(params, 'upSlope')} s auf ${num(params, 'current')} A, fällt in ${num(params, 'downSlope')} s auf ` +
    `${num(params, 'endCurrent')} A, danach strömt das Gas ${num(params, 'postFlow')} s nach.`

  return (
    <svg viewBox={`0 0 ${W} ${H + 36}`} role="img" aria-label={description} style={{ width: '100%', display: 'block' }}>
      {curve.phases.map((p) => (
        <g key={p.phase}>
          {p.phase === active && (
            <rect x={p.x0} y={0} width={p.x1 - p.x0} height={H} fill={theme.palette.primary.main} opacity={0.15} />
          )}
          <text x={(p.x0 + p.x1) / 2} y={H + 14} textAnchor="middle" fontSize="9" fill={theme.palette.text.secondary}>
            {PHASE_LABELS[p.phase]}
          </text>
        </g>
      ))}
      <rect x={gas} y={H + 20} width={gasEnd - gas} height={8} rx={4} fill="#3AA38F" />
      <text x={W / 2} y={H + 33} textAnchor="middle" fontSize="8" fill={theme.palette.text.secondary}>Schutzgas</text>
      <polyline points={line} fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}
