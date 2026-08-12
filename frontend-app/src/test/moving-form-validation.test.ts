import { describe, expect, it } from 'vitest'

import { emptyInventoryCounts } from '@/features/moving/constants/inventory-catalog'
import {
  buildInventoryItems,
  collectPhotoPaths,
  validateMovingRequestForm,
  type MovingRequestFormValues,
} from '@/features/moving/schemas/moving-request-schema'

const t = (key: string) => key

function baseValues(overrides: Partial<MovingRequestFormValues> = {}): MovingRequestFormValues {
  return {
    pickupAddress: 'Pickup St',
    dropoffAddress: 'Dropoff St',
    moveInDate: '2026-09-01',
    vehicleTypeId: 'vt1',
    remarks: '',
    damageChecklist: '',
    photo1: 'uploads/p1.jpg',
    photo2: '',
    photo3: '',
    photo4: '',
    photo5: '',
    inventoryCounts: {
      ...emptyInventoryCounts(),
      bedroom_single_bed: 2,
    },
    ...overrides,
  }
}

describe('moving request form validation', () => {
  it('accepts a complete form payload shape', () => {
    const values = baseValues()
    const errors = validateMovingRequestForm(values, t)

    expect(errors).toEqual({})
    expect(collectPhotoPaths(values)).toEqual(['uploads/p1.jpg'])
    expect(buildInventoryItems(values.inventoryCounts)).toEqual([
      { category: 'bedroom', itemName: 'Single bed', count: 2 },
    ])
  })

  it('requires addresses, date, vehicle, photos, and inventory', () => {
    const errors = validateMovingRequestForm(
      baseValues({
        pickupAddress: '',
        dropoffAddress: '',
        moveInDate: '',
        vehicleTypeId: '',
        photo1: '',
        inventoryCounts: emptyInventoryCounts(),
      }),
      t,
    )

    expect(errors.pickupAddress).toBe('auth.required')
    expect(errors.dropoffAddress).toBe('auth.required')
    expect(errors.moveInDate).toBe('auth.required')
    expect(errors.vehicleTypeId).toBe('auth.required')
    expect(errors.photos).toBe('moving.photosRequired')
    expect(errors.inventoryCounts).toBe('moving.inventoryRequired')
  })
})
