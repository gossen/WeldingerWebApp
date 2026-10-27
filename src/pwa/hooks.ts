import { useCallback, useEffect, useState } from 'react'
import { isIos, shouldShowInstallBanner } from './installBanner'

const DISMISS_KEY = 'weldinger.installDismissed'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

function readDismissedAt(): number | null {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

export function useInstallBanner() {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null)
  const [dismissedAt, setDismissedAt] = useState<number | null>(readDismissedAt)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const ios = isIos(navigator.userAgent)
  const standalone =
    installed ||
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true

  const visible = shouldShowInstallBanner({
    canInstall: event !== null, ios, standalone, dismissedAt, now: Date.now(),
  })

  const later = useCallback(() => {
    const now = Date.now()
    setDismissedAt(now)
    try {
      localStorage.setItem(DISMISS_KEY, String(now))
    } catch {
      /* Speicher nicht verfügbar: nur für diese Sitzung ausgeblendet */
    }
  }, [])

  const install = useCallback(async () => {
    if (!event) return
    await event.prompt()
    await event.userChoice
    setEvent(null)
  }, [event])

  return { visible, ios, canPrompt: event !== null, install, later }
}
