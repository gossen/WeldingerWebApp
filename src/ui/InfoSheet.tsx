import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material'
import type { Tip } from './tips'

export interface InfoContent {
  title: string
  value: string
  tip: Tip
  note?: string
}

/** Erklär-Sheet: Wert, Wirkung, Toleranz. MUI-Dialog bringt Fokusfalle, Esc und Hintergrund-Klick mit. */
export function InfoSheet({ info, onClose }: { info: InfoContent | null; onClose: () => void }) {
  return (
    <Dialog
      open={info !== null} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="info-title"
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-end' }, '& .MuiDialog-paper': { m: 0, width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } }}
    >
      {info && (
        <DialogContent>
          <Typography id="info-title" variant="subtitle2" color="text.secondary">{info.title}</Typography>
          <Typography variant="h4" sx={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, mb: 2 }}>
            {info.value}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Was bewirkt der Wert?</Typography>
            <Typography>{info.tip.what}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Toleranz &amp; Justierung</Typography>
            <Typography>{info.tip.tolerance}</Typography>
          </Box>
          {info.note && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>{info.note}</Typography>
          )}
        </DialogContent>
      )}
      <DialogActions>
        <Button variant="contained" onClick={onClose} autoFocus>Verstanden</Button>
      </DialogActions>
    </Dialog>
  )
}
