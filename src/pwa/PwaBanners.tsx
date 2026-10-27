import { useState } from 'react'
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Stack, Typography } from '@mui/material'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useInstallBanner, useOnlineStatus } from './hooks'

/** "Offline-fähig" erst, wenn der Service Worker alles gecacht hat. */
export function NetBadge({ offlineReady }: { offlineReady: boolean }) {
  const online = useOnlineStatus()
  return (
    <Chip
      role="status" size="small"
      label={!online ? 'Kein Netz' : offlineReady ? 'Offline-fähig' : 'Online'}
      sx={{
        bgcolor: !online ? '#2E2213' : offlineReady ? '#1F8A5B' : 'rgba(255,255,255,0.15)',
        color: !online ? '#FFD9A0' : '#fff',
      }}
    />
  )
}

export function InstallBanner() {
  const { visible, ios, canPrompt, install, later } = useInstallBanner()
  const [help, setHelp] = useState(false)
  if (!visible) return null
  return (
    <>
      <Alert
        severity="info" sx={{ mt: 2 }}
        action={
          <Stack direction="row" spacing={1}>
            <Button color="inherit" size="small" onClick={later}>Später</Button>
            <Button size="small" variant="contained" onClick={canPrompt ? install : () => setHelp(true)}>
              {canPrompt ? 'Installieren' : 'Anleitung'}
            </Button>
          </Stack>
        }
      >
        App auf dem Startbildschirm installieren, damit sie auch in der Werkstatt ohne Netz läuft.
      </Alert>
      <Dialog open={help && ios} onClose={() => setHelp(false)}>
        <DialogTitle>Auf dem iPhone installieren</DialogTitle>
        <DialogContent>
          <Typography component="ol" sx={{ pl: 2 }}>
            <li>In Safari das Teilen-Symbol antippen.</li>
            <li>„Zum Home-Bildschirm“ wählen.</li>
            <li>Mit „Hinzufügen“ bestätigen.</li>
          </Typography>
        </DialogContent>
        <DialogActions><Button onClick={() => setHelp(false)}>Verstanden</Button></DialogActions>
      </Dialog>
    </>
  )
}

/** Registriert den Service Worker und meldet neue Versionen. */
export function usePwa() {
  const { offlineReady: [offlineReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  return { offlineReady, needRefresh, reload: () => updateServiceWorker(true) }
}

export function UpdateNotice({ needRefresh, reload }: { needRefresh: boolean; reload: () => void }) {
  return (
    <Snackbar
      open={needRefresh} message="Update verfügbar"
      action={<Button color="inherit" size="small" onClick={reload}>Neu laden</Button>}
    />
  )
}
