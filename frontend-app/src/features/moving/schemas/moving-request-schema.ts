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
  inventoryCounts: Record<string, number>
}

export function collectPhotoPaths(values: MovingRequestFormValues): string[] {
  return [values.photo1, values.photo2, values.photo3, values.photo4, values.photo5]
    .map((path) => path.trim())
    .filter(Boolean)
}

export function buildInventoryItems(counts: Record<string, number>): MovingInventoryItem[] {
  return MOVING_INVENTORY_CATALOG.map((item) => ({
    category: item.category,
    itemName: item.itemName,
    count: Number(counts[item.key] ?? 0),
  })).filter((item) => item.count > 0)
}

export function validateMovingRequestForm(
  values: MovingRequestFormValues,
  t: (key: string) => string,
) {
  const errors: Partial<Record<keyof MovingRequestFormValues | 'photos' | 'inventoryCounts', string>> =
    {}

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

  const inventoryItems = buildInventoryItems(values.inventoryCounts)
  if (inventoryItems.length === 0) {
    errors.inventoryCounts = t('moving.inventoryRequired')
  }

  return errors
}
