import { Box } from '@mui/material'

/** Kleines (i) als sichtbarer Hinweis, dass hinter einem Wert eine Erklärung liegt. */
export function InfoBadge() {
  return (
    <Box
      aria-hidden
      sx={{
        ml: 1.5, flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
        border: 1.5, borderColor: 'primary.main', color: 'primary.main',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, fontFamily: 'Georgia, serif', fontStyle: 'italic',
      }}
    >
      i
    </Box>
  )
}
