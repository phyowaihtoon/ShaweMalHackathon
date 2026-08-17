import { describe, expect, it } from 'vitest'

import {
  canDriverCancelAssignedJob,
  getDriverNextStatus,
  getMinEtaDatetimeLocal,
  isEtaBeforeMoveInDate,
  toDatetimeLocalValue,
} from '@/features/driver/lib/driver-job-status'

describe('driver job status helpers', () => {
  it('maps each operational status to the next step', () => {
    expect(getDriverNextStatus('ACCEPTED')).toBe('driver_coming')
    expect(getDriverNextStatus('DRIVER_COMING')).toBe('driver_arrived')
    expect(getDriverNextStatus('UNLOADING')).toBe('completed')
    expect(getDriverNextStatus('COMPLETED')).toBeNull()
  })

  it('allows cancel only before completed or cancelled', () => {
    expect(canDriverCancelAssignedJob('DRIVER_COMING')).toBe(true)
    expect(canDriverCancelAssignedJob('COMPLETED')).toBe(false)
    expect(canDriverCancelAssignedJob('CANCELLED')).toBe(false)
  })

  it('blocks ETA earlier than move-in date', () => {
    const moveInIso = '2026-09-15T12:00:00.000Z'
    const earlyLocal = toDatetimeLocalValue(new Date('2026-09-15T11:00:00.000Z'))
    const lateLocal = toDatetimeLocalValue(new Date('2026-09-15T13:00:00.000Z'))

    expect(isEtaBeforeMoveInDate(earlyLocal, moveInIso)).toBe(true)
    expect(isEtaBeforeMoveInDate(lateLocal, moveInIso)).toBe(false)
    expect(getMinEtaDatetimeLocal(moveInIso)).toMatch(/^2026-09-15T/)
  })
})
