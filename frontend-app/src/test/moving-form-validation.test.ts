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
    photo1: 'uploads/moving/p1.jpg',
    photo2: '',
    photo3: '',
    photo4: '',
    photo5: '',
    totalInventoryItems: '2',
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
    expect(collectPhotoPaths(values)).toEqual(['uploads/moving/p1.jpg'])
    expect(buildInventoryItems(values.inventoryCounts, Number(values.totalInventoryItems))).toEqual([
      { category: 'bedroom', itemName: 'Single bed', count: 2 },
    ])
  })

  it('requires addresses, date, vehicle, photos, and total inventory items > 0', () => {
    const errors = validateMovingRequestForm(
      baseValues({
        pickupAddress: '',
        dropoffAddress: '',
        moveInDate: '',
        vehicleTypeId: '',
        photo1: '',
        totalInventoryItems: '0',
        inventoryCounts: emptyInventoryCounts(),
      }),
      t,
    )

    expect(errors.pickupAddress).toBe('auth.required')
    expect(errors.dropoffAddress).toBe('auth.required')
    expect(errors.moveInDate).toBe('auth.required')
    expect(errors.vehicleTypeId).toBe('auth.required')
    expect(errors.photos).toBe('moving.photosRequired')
    expect(errors.totalInventoryItems).toBe('moving.totalInventoryRequired')
    expect(errors.inventoryCounts).toBeUndefined()
  })

  it('passes when total inventory is set even if catalog counts are empty', () => {
    const values = baseValues({
      totalInventoryItems: '5',
      inventoryCounts: emptyInventoryCounts(),
    })
    expect(validateMovingRequestForm(values, t)).toEqual({})
    expect(buildInventoryItems(values.inventoryCounts, 5)).toEqual([
      { category: 'other', itemName: 'Total inventory items', count: 5 },
    ])
  })
})
