export interface BannerState {
  canInstall: boolean
  ios: boolean
  standalone: boolean
  dismissedAt: number | null
  now: number
}

const QUIET_PERIOD_MS = 14 * 24 * 60 * 60 * 1000

export function shouldShowInstallBanner({ canInstall, ios, standalone, dismissedAt, now }: BannerState): boolean {
  if (standalone) return false
  if (dismissedAt !== null && now - dismissedAt < QUIET_PERIOD_MS) return false
  return canInstall || ios
}

export function isIos(userAgent: string): boolean {
  return /iPhone|iPad|iPod/.test(userAgent)
}
