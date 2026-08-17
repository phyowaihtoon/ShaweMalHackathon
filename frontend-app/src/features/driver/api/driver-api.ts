import { apiRequest } from '@/lib/api/client'
import type { MovingRequest } from '@/features/moving/types'

export type DriverRegistrationInput = {
  name: string
  companyName?: string
  nrc: string
  nrcFrontPhotoPath: string
  nrcBackPhotoPath: string
  drivingLicensePhotoPath: string
  profilePhotoPath: string
  phone: string
  currentAddress: string
  vehicleTypeId: string
  vehicleLicensePlateNumber: string
  vehiclePhotoPath: string
  wheelTaxPhotoPath: string
}

export type DriverEtaInput = {
  stage: string
  etaAt: string
  notes?: string
}

export type DriverStatusInput = {
  status:
    | 'driver_coming'
    | 'driver_arrived'
    | 'loading'
    | 'on_the_way'
    | 'unloading'
    | 'completed'
    | 'cancelled'
  notes?: string
}

export const driverRegistrationApi = {
  submit(input: DriverRegistrationInput) {
    return apiRequest<{ profile: unknown }>('/registrations/driver', {
      method: 'POST',
      body: input,
    })
  },
}

export const driverJobsApi = {
  listAvailable() {
    return apiRequest<{ items: MovingRequest[] }>('/driver/requests/available')
  },
  listAssigned() {
    return apiRequest<{ items: MovingRequest[] }>('/driver/requests/assigned')
  },
  accept(id: string) {
    return apiRequest<{ movingRequest: MovingRequest }>(`/driver/requests/${id}/accept`, {
      method: 'POST',
      body: {},
    })
  },
  reject(id: string, notes?: string) {
    return apiRequest<{ ok: boolean }>(`/driver/requests/${id}/reject`, {
      method: 'POST',
      body: notes ? { notes } : {},
    })
  },
  addEta(id: string, input: DriverEtaInput) {
    return apiRequest<{ etaEntry: unknown }>(`/driver/requests/${id}/eta`, {
      method: 'POST',
      body: input,
    })
  },
  updateStatus(id: string, input: DriverStatusInput) {
    return apiRequest<{ movingRequest: MovingRequest }>(`/driver/requests/${id}/status`, {
      method: 'POST',
      body: input,
    })
  },
}
