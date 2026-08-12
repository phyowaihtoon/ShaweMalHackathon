import { MOVING_INVENTORY_CATALOG } from '../constants/inventory-catalog'
import type { MovingInventoryItem } from '../types'

export type MovingRequestFormValues = {
  pickupAddress: string
  dropoffAddress: string
  moveInDate: string
  vehicleTypeId: string
  remarks: string
  damageChecklist: string
  photo1: string
  photo2: string
  photo3: string
  photo4: string
  photo5: string
  /** Screen-only total; not persisted as its own DB column. */
  totalInventoryItems: string
  inventoryCounts: Record<string, number>
}

export function collectPhotoPaths(values: MovingRequestFormValues): string[] {
  return [values.photo1, values.photo2, values.photo3, values.photo4, values.photo5]
    .map((path) => path.trim())
    .filter(Boolean)
}

export function sumInventoryCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, value) => sum + (Number(value) || 0), 0)
}

export function buildInventoryItems(
  counts: Record<string, number>,
  totalInventoryItems?: number,
): MovingInventoryItem[] {
  const items = MOVING_INVENTORY_CATALOG.map((item) => ({
    category: item.category,
    itemName: item.itemName,
    count: Number(counts[item.key] ?? 0),
  })).filter((item) => item.count > 0)

  if (items.length > 0) {
    return items
  }

  // Backend requires at least one inventory row; use screen total when no catalog lines were filled.
  const total = Math.max(0, Math.floor(Number(totalInventoryItems) || 0))
  if (total > 0) {
    return [{ category: 'other', itemName: 'Total inventory items', count: total }]
  }

  return []
}

export function validateMovingRequestForm(
  values: MovingRequestFormValues,
  t: (key: string) => string,
) {
  const errors: Partial<
    Record<keyof MovingRequestFormValues | 'photos' | 'totalInventoryItems', string>
  > = {}

  if (!values.pickupAddress.trim()) errors.pickupAddress = t('auth.required')
  if (!values.dropoffAddress.trim()) errors.dropoffAddress = t('auth.required')
  if (!values.moveInDate.trim()) errors.moveInDate = t('auth.required')
  if (!values.vehicleTypeId.trim()) errors.vehicleTypeId = t('auth.required')

  const photos = collectPhotoPaths(values)
  if (photos.length < 1) {
    errors.photos = t('moving.photosRequired')
  } else if (photos.length > 5) {
    errors.photos = t('moving.photosMax')
  }

  const total = Number(values.totalInventoryItems)
  if (!Number.isFinite(total) || total <= 0 || !Number.isInteger(total)) {
    errors.totalInventoryItems = t('moving.totalInventoryRequired')
  }

  return errors
}
