import { Button } from '@mui/material'
import { useColorScheme } from '@mui/material/styles'
import { modeLabel, nextMode } from './themeMode'
import type { Mode } from './themeMode'

const ICONS: Record<Mode, string> = { system: '◐', light: '☀', dark: '☾' }

/** Wechselt Auto (folgt dem Gerät) → Hell → Dunkel. MUI merkt sich die Wahl im Browser. */
export function ThemeToggle() {
  const { mode, setMode } = useColorScheme()
  if (!mode) return null
  return (
    <Button
      size="small" onClick={() => setMode(nextMode(mode))}
      aria-label={`Darstellung: ${modeLabel(mode)}. Tippen zum Wechseln.`}
      sx={{ color: '#fff', minWidth: 44, minHeight: 44 }}
    >
      {ICONS[mode]} {modeLabel(mode)}
    </Button>
  )
}
