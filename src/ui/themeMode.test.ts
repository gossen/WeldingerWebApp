import { describe, expect, test } from 'vitest'
import { modeLabel, nextMode } from './themeMode'

describe('nextMode', () => {
  test('wechselt Auto → Hell → Dunkel → Auto', () => {
    expect(nextMode('system')).toBe('light')
    expect(nextMode('light')).toBe('dark')
    expect(nextMode('dark')).toBe('system')
  })
})

describe('modeLabel', () => {
  test('deutsche Bezeichnungen', () => {
    expect(modeLabel('system')).toBe('Auto')
    expect(modeLabel('light')).toBe('Hell')
    expect(modeLabel('dark')).toBe('Dunkel')
  })
})
