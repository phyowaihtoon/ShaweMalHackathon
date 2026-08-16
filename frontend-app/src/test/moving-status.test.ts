import { describe, expect, it } from 'vitest'

import {
  isActiveMovingStatus,
  pickDefaultMovingRequestId,
  remainingMinutes,
  timelineIndexForStatus,
  timelineStepState,
  vehicleLabel,
} from '@/features/moving/lib/moving-status'

describe('moving status helpers', () => {
  it('treats booked through unloading as active', () => {
    expect(isActiveMovingStatus('BOOKED')).toBe(true)
    expect(isActiveMovingStatus('ON_THE_WAY')).toBe(true)
    expect(isActiveMovingStatus('COMPLETED')).toBe(false)
    expect(isActiveMovingStatus('CANCELLED')).toBe(false)
  })

  it('maps accepted and assigned to the same timeline step', () => {
    expect(timelineIndexForStatus('ACCEPTED')).toBe(timelineIndexForStatus('ASSIGNED'))
    expect(timelineIndexForStatus('ACCEPTED')).toBe(1)
  })

  it('marks earlier steps complete and the current step active', () => {
    expect(timelineStepState(0, 'DRIVER_COMING')).toBe('complete')
    expect(timelineStepState(1, 'DRIVER_COMING')).toBe('complete')
    expect(timelineStepState(2, 'DRIVER_COMING')).toBe('current')
    expect(timelineStepState(3, 'DRIVER_COMING')).toBe('pending')
  })

  it('picks the most recently updated active booking by default', () => {
    const id = pickDefaultMovingRequestId([
      { id: 'old', status: 'BOOKED', updatedAt: '2026-08-01T00:00:00.000Z' },
      { id: 'newer', status: 'DRIVER_COMING', updatedAt: '2026-08-16T00:00:00.000Z' },
      { id: 'done', status: 'COMPLETED', updatedAt: '2026-08-17T00:00:00.000Z' },
    ])

    expect(id).toBe('newer')
  })

  it('formats vehicle name with capacity label and remaining ETA minutes', () => {
    expect(vehicleLabel({ vehicleType: { name: 'Mini Truck', capacityLabel: '20–35 boxes' } })).toBe(
      'Mini Truck (20–35 boxes)',
    )
    expect(remainingMinutes('2026-08-16T03:15:00.000Z', new Date('2026-08-16T03:00:00.000Z'))).toBe(15)
  })
})
