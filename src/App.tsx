import { useEffect, useMemo, useState } from 'react'
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Container, Divider, List,
  ListItemButton, ListItemText, Slider, Stack, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import type { Process } from './domain/helm'
import { evaluate } from './domain/evaluate'
import {
  gasOptionsFor, materialsFor, THICKNESSES, wireDiametersFor, wireTypesFor,
} from './domain/options'
import type { GasOption, Selection } from './domain/options'
import type { Material, WireDiameter, WireType } from './domain/weldCalc'
import { InstallBanner, NetBadge, UpdateNotice, usePwa } from './pwa/PwaBanners'
import { addFavorite, hasFavorite, loadFavorites, removeFavorite, saveFavorites } from './storage/favorites'
import { favoriteLabel } from './ui/favoriteLabel'
import { formatParam } from './ui/format'
import { InfoBadge } from './ui/InfoBadge'
import { InfoSheet } from './ui/InfoSheet'
import type { InfoContent } from './ui/InfoSheet'
import { ThemeToggle } from './ui/ThemeToggle'
import { tipFor } from './ui/tips'
import { WigTree } from './ui/WigTree'
import {
  GAS_LABELS, MATERIAL_LABELS, paramLabel, PARAM_ORDER, PROCESS_LABELS,
  WIRE_DIAMETER_LABELS, WIRE_TYPE_LABELS,
} from './ui/labels'

const START: Selection = {
  process: 'mig', material: 'stahl', thicknessIndex: THICKNESSES.indexOf(3),
  wireType: 'massiv', wireDiameter: 0.8, gas: 'm21',
}

const thicknessText = (mm: number) => `${mm.toLocaleString('de-DE')} mm`

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ mt: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
        {title}
      </Typography>
      {children}
    </Box>
  )
}

function Choice<T extends string | number>(props: {
  label: string
  value: T | null
  options: T[]
  text: (value: T) => string
  onChange: (value: T) => void
}) {
  return (
    <ToggleButtonGroup
      exclusive fullWidth size="small" aria-label={props.label} value={props.value}
      onChange={(_, next: T | null) => next !== null && props.onChange(next)}
      sx={{ flexWrap: 'wrap' }}
    >
      {props.options.map((option) => (
        <ToggleButton key={option} value={option} aria-pressed={option === props.value}>
          {props.text(option)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export function App() {
  const [selection, setSelection] = useState<Selection>(START)
  const pwa = usePwa()
  const [favorites, setFavorites] = useState<Selection[]>(() => loadFavorites(localStorage))
  const [info, setInfo] = useState<(InfoContent & { key: string }) | null>(null)
  useEffect(() => saveFavorites(localStorage, favorites), [favorites])
  const { selection: current, result, helm } = useMemo(() => evaluate(selection), [selection])
  const update = (patch: Partial<Selection>) => setSelection({ ...current, ...patch })

  const { process, material, wireType } = current
  const thickness = THICKNESSES[current.thicknessIndex]
  const gasOptions = gasOptionsFor(process, material, wireType)
  const rows = PARAM_ORDER[process].filter((key) => result.params[key])
  const isFavorite = hasFavorite(favorites, current)
  const toggleFavorite = () => setFavorites(isFavorite ? removeFavorite(favorites, current) : addFavorite(favorites, current))
  const helmInfo = (key: string, title: string, value: string) => {
    const tip = tipFor(process, key)
    if (tip) setInfo({ key, title, value, tip })
  }

  return (
    <>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: '#16181B', color: '#fff', py: 1.5 }}>
        <Container maxWidth="sm" aria-live="polite">
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography sx={{ fontWeight: 700 }}>Schweiß-Assistent</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <NetBadge offlineReady={pwa.offlineReady} />
              <ThemeToggle />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={3} sx={{ mt: 0.5, alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
              {result.current} A
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#FFB547' }}>
              DIN {helm.shade}
            </Typography>
            <Button
              size="small" onClick={toggleFavorite} aria-pressed={isFavorite}
              sx={{ ml: 'auto', color: '#FFB547', minHeight: 44 }}
            >
              {isFavorite ? '★ Gemerkt' : '☆ Merken'}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ pb: 6 }}>
        <InstallBanner />

        {favorites.length > 0 && (
          <Section title="Gespeichert">
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
              {favorites.map((f) => (
                <Chip
                  key={favoriteLabel(f) + f.gas + f.wireType} label={favoriteLabel(f)}
                  onClick={() => setSelection(f)}
                  onDelete={() => setFavorites(removeFavorite(favorites, f))}
                  sx={{ minHeight: 44, flexShrink: 0 }}
                />
              ))}
            </Stack>
          </Section>
        )}

        <Section title="1 · Verfahren">
          <Choice<Process>
            label="Verfahren" value={process} options={['mig', 'wig', 'mma', 'plasma']}
            text={(p) => PROCESS_LABELS[p]} onChange={(p) => update({ process: p })}
          />
        </Section>

        <Section title="2 · Werkstoff">
          <Choice<Material>
            label="Werkstoff" value={material} options={materialsFor(process)}
            text={(m) => MATERIAL_LABELS[m]} onChange={(m) => update({ material: m })}
          />
          {process === 'mig' && (
            <Typography variant="caption" color="text.secondary">
              Aluminium nur mit WIG (AC): am MWPE 209 bei MIG/MAG nicht vorgesehen.
            </Typography>
          )}
        </Section>

        {process === 'mig' && (
          <Section title="3 · Draht">
            <Stack spacing={1}>
              <Choice<WireType>
                label="Drahtart" value={wireType} options={wireTypesFor(material)}
                text={(t) => WIRE_TYPE_LABELS[t]} onChange={(t) => update({ wireType: t })}
              />
              <Choice<WireDiameter>
                label="Drahtdurchmesser" value={current.wireDiameter}
                options={wireDiametersFor(material, wireType)}
                text={(d) => WIRE_DIAMETER_LABELS[d]} onChange={(d) => update({ wireDiameter: d })}
              />
            </Stack>
          </Section>
        )}

        <Section title={`${process === 'mig' ? '4' : '3'} · Materialstärke: ${thicknessText(thickness)}`}>
          <Slider
            aria-label="Materialstärke" min={0} max={THICKNESSES.length - 1} step={1}
            value={current.thicknessIndex} marks
            valueLabelDisplay="auto" valueLabelFormat={(i) => thicknessText(THICKNESSES[i])}
            onChange={(_, i) => update({ thicknessIndex: i as number })}
          />
        </Section>

        {gasOptions.length > 0 && (
          <Section title="Gas">
            <Choice<GasOption>
              label="Gas" value={current.gas} options={gasOptions}
              text={(g) => GAS_LABELS[g]} onChange={(g) => update({ gas: g })}
            />
          </Section>
        )}

        {result.warnings.map((warning) => (
          <Alert key={warning} severity="warning" sx={{ mt: 2 }}>{warning}</Alert>
        ))}

        <Section title="Einstellwerte am Gerät (MWPE 209 HF/AC pro Combi PFC)">
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Tippe auf einen Wert für die Erklärung und den Spielraum zum Nachjustieren.
          </Typography>
          {process === 'wig' && (
            <Card variant="outlined" sx={{ mb: 1.5, p: 1.5 }}>
              <WigTree params={result.params} activeKey={info?.key ?? null} />
            </Card>
          )}
          <Card variant="outlined">
            <List disablePadding>
              {rows.map((key, index) => {
                const param = result.params[key]
                return (
                  <Box key={key}>
                    {index > 0 && <Divider component="li" />}
                    <ListItemButton
                      sx={{ minHeight: 56 }}
                      onClick={() => {
                        const tip = tipFor(process, key)
                        if (tip) setInfo({ key, title: paramLabel(process, key), value: formatParam(param), tip, note: param.source === 'richtwert' ? 'Richtwert, nicht aus dem Handbuch.' : 'Wert laut Handbuch.' })
                      }}
                    >
                      <ListItemText
                        primary={paramLabel(process, key)}
                        secondary={param.source === 'richtwert' ? 'Richtwert' : 'laut Handbuch'}
                      />
                      <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
                        {formatParam(param)}
                      </Typography>
                      <InfoBadge />
                    </ListItemButton>
                  </Box>
                )
              })}
            </List>
          </Card>
        </Section>

        <Section title="Helm AH-800">
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <HelmCard
              label="Dunkelstufe" value={`DIN ${helm.shade}`} hint={`Bereich ${helm.shadeRange.replace('-', '–')}`}
              onOpen={() => helmInfo('shade', 'Dunkelstufe', `DIN ${helm.shade}`)}
            />
            <HelmCard
              label="Empfindlichkeit" value={`${helm.sensitivity}`} hint="Skala 0–9"
              onOpen={() => helmInfo('sensitivity', 'Empfindlichkeit', `${helm.sensitivity}`)}
            />
            <HelmCard
              label="Verzögerung"
              value={`${helm.delayLevel}`}
              hint={`${helm.delaySeconds.toLocaleString('de-DE', { minimumFractionDigits: 1 })} s (Stufe 0–9)`}
              onOpen={() => helmInfo('delay', 'Verzögerung', `Stufe ${helm.delayLevel}`)}
            />
            <HelmCard
              label="Modus" value={helm.mode === 'cut' ? 'CUT' : 'WELD'} hint="Taste an der Helmschale"
              onOpen={() => helmInfo('mode', 'Modus', helm.mode === 'cut' ? 'CUT' : 'WELD')}
            />
          </Stack>
        </Section>

        <Chip label="Richtwerte – ohne Gewähr" size="small" sx={{ mt: 4 }} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Werte aus den Handbüchern von MWPE 209 und AH-800, sonst Faustformeln. Immer am Probestück prüfen.
          Die Helmeinstellung ersetzt keine Prüfung durch eine fachkundige Person.
        </Typography>
      </Container>
      <InfoSheet info={info} onClose={() => setInfo(null)} />
      <UpdateNotice needRefresh={pwa.needRefresh} reload={pwa.reload} />
    </>
  )
}

function HelmCard({ label, value, hint, onOpen }: { label: string; value: string; hint: string; onOpen: () => void }) {
  return (
    <Card variant="outlined" sx={{ flex: '1 1 140px' }}>
      <CardActionArea onClick={onOpen} sx={{ minHeight: 44 }}>
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <InfoBadge />
          </Stack>
          <Typography variant="h5" sx={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{hint}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
