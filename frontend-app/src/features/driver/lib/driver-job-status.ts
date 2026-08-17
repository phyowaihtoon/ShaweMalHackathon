export const DRIVER_NEXT_STATUS = {
  ACCEPTED: 'driver_coming',
  ASSIGNED: 'driver_coming',
  BOOKED: 'driver_coming',
  DRIVER_COMING: 'driver_arrived',
  DRIVER_ARRIVED: 'loading',
  LOADING: 'on_the_way',
  ON_THE_WAY: 'unloading',
  UNLOADING: 'completed',
} as const

export type DriverOperationalStatus = keyof typeof DRIVER_NEXT_STATUS
export type DriverNextStatusValue = (typeof DRIVER_NEXT_STATUS)[DriverOperationalStatus]

export function getDriverNextStatus(status: string): DriverNextStatusValue | null {
  if (status in DRIVER_NEXT_STATUS) {
    return DRIVER_NEXT_STATUS[status as DriverOperationalStatus]
  }

  return null
}

export function canDriverCancelAssignedJob(status: string): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED'
}

export function toDatetimeLocalValue(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function getMinEtaDatetimeLocal(moveInDate?: string | null): string | undefined {
  if (!moveInDate) {
    return undefined
  }

  const moveInAt = new Date(moveInDate)
  if (Number.isNaN(moveInAt.getTime())) {
    return undefined
  }

  return toDatetimeLocalValue(moveInAt)
}

export function isEtaBeforeMoveInDate(etaAt: string, moveInDate?: string | null): boolean {
  if (!etaAt || !moveInDate) {
    return false
  }

  const eta = new Date(etaAt)
  const moveInAt = new Date(moveInDate)
  if (Number.isNaN(eta.getTime()) || Number.isNaN(moveInAt.getTime())) {
    return false
  }

  return eta.getTime() < moveInAt.getTime()
}
