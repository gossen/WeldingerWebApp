import { THICKNESSES } from '../domain/options'
import type { Selection } from '../domain/options'
import { MATERIAL_LABELS, PROCESS_LABELS, WIRE_DIAMETER_LABELS } from './labels'

export function favoriteLabel(selection: Selection): string {
  const thickness = `${THICKNESSES[selection.thicknessIndex].toLocaleString('de-DE')} mm`
  const parts = [PROCESS_LABELS[selection.process], MATERIAL_LABELS[selection.material], thickness]
  if (selection.process === 'mig') {
    const kind = selection.wireType === 'fuell' ? 'Fülldraht' : 'Massiv'
    parts.push(`${kind} ${WIRE_DIAMETER_LABELS[selection.wireDiameter]}`)
  }
  return parts.join(' · ')
}
