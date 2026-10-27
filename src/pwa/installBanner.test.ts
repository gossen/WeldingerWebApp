import { describe, expect, test } from 'vitest'
import { isIos, shouldShowInstallBanner } from './installBanner'
import type { BannerState } from './installBanner'

const DAY = 24 * 60 * 60 * 1000
const base: BannerState = { canInstall: true, ios: false, standalone: false, dismissedAt: null, now: 100 * DAY }

describe('shouldShowInstallBanner', () => {
  test('installierbar (Android/Chrome): anzeigen', () => {
    expect(shouldShowInstallBanner(base)).toBe(true)
  })
  test('nicht installierbar und kein iOS: nicht anzeigen', () => {
    expect(shouldShowInstallBanner({ ...base, canInstall: false })).toBe(false)
  })
  test('iOS ohne Prompt: anzeigen (mit Anleitung)', () => {
    expect(shouldShowInstallBanner({ ...base, canInstall: false, ios: true })).toBe(true)
  })
  test('schon installiert (standalone): nie anzeigen', () => {
    expect(shouldShowInstallBanner({ ...base, standalone: true })).toBe(false)
    expect(shouldShowInstallBanner({ ...base, standalone: true, ios: true })).toBe(false)
  })
  test('"Später": 14 Tage Ruhe', () => {
    expect(shouldShowInstallBanner({ ...base, dismissedAt: base.now - 13 * DAY })).toBe(false)
    expect(shouldShowInstallBanner({ ...base, dismissedAt: base.now - 14 * DAY })).toBe(true)
  })
})

describe('isIos', () => {
  test('iPhone und iPad', () => {
    expect(isIos('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15')).toBe(true)
    expect(isIos('Mozilla/5.0 (iPad; CPU OS 16_4 like Mac OS X) AppleWebKit/605.1.15')).toBe(true)
  })
  test('Android und Desktop nicht', () => {
    expect(isIos('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120')).toBe(false)
    expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15')).toBe(false)
  })
})
