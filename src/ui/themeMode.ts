export type Mode = 'system' | 'light' | 'dark'

const ORDER: Mode[] = ['system', 'light', 'dark']
const LABELS: Record<Mode, string> = { system: 'Auto', light: 'Hell', dark: 'Dunkel' }

export function nextMode(mode: Mode): Mode {
  return ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]
}

export function modeLabel(mode: Mode): string {
  return LABELS[mode]
}
