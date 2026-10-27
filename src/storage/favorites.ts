import { normalize } from '../domain/options'
import type { Selection } from '../domain/options'

export const FAVORITES_KEY = 'weldinger.favorites.v1'
export const MAX_FAVORITES = 20

const FIELDS = ['process', 'material', 'thicknessIndex', 'wireType', 'wireDiameter', 'gas'] as const

const same = (a: Selection, b: Selection) => FIELDS.every((field) => a[field] === b[field])

export function hasFavorite(favorites: Selection[], selection: Selection): boolean {
  return favorites.some((favorite) => same(favorite, selection))
}

export function addFavorite(favorites: Selection[], selection: Selection): Selection[] {
  if (hasFavorite(favorites, selection)) return favorites
  return [selection, ...favorites].slice(0, MAX_FAVORITES)
}

export function removeFavorite(favorites: Selection[], selection: Selection): Selection[] {
  return favorites.filter((favorite) => !same(favorite, selection))
}

/** Gültig = vollständig und ohne Korrektur durch normalize() (sonst z. B. Alu bei MIG/MAG). */
function isValid(value: unknown): value is Selection {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Selection
  if (!FIELDS.every((field) => field in candidate)) return false
  return same(normalize(candidate), candidate)
}

export function loadFavorites(storage: Pick<Storage, 'getItem'>): Selection[] {
  try {
    const raw = storage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isValid).slice(0, MAX_FAVORITES) : []
  } catch {
    return []
  }
}

export function saveFavorites(storage: Pick<Storage, 'setItem'>, favorites: Selection[]): void {
  try {
    storage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  } catch {
    /* Speicher nicht verfügbar: Favoriten gelten nur für diese Sitzung */
  }
}
