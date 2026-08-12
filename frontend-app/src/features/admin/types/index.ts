export type AdminRole = 'normal' | 'agent' | 'driver' | 'admin'

export type VerificationAction = 'pending' | 'approve' | 'reject'

export type AdminSafeUser = {
  id: string
  name: string
  email: string
  phone: string
  verificationStatus: string
  roles: string[]
}

export type VerificationCounts = {
  pending: number
  verified: number
  rejected: number
  total: number
}

export type AdminOverviewReport = {
  period: {
    from: string | null
    to: string | null
  }
  userRegistrationsByRole: Array<{ role: string; count: number }>
  verification: {
    agents: VerificationCounts
    drivers: VerificationCounts
  }
  housing: {
    byCity: Array<{ cityId: string; city: string; count: number }>
    byType: Array<{ propertyTypeId: string; propertyType: string; count: number }>
    byAvailability: {
      available: number
      notAvailable: number
    }
  }
  bookingStatusSummary: Array<{ status: string; count: number }>
  movingRequestSummary: {
    byStatus: Array<{ status: string; count: number }>
    completed: number
    total: number
  }
  topPerformers: {
    agents: Array<{ userId: string; name: string; averageRating: number; ratingCount: number }>
    drivers: Array<{ userId: string; name: string; averageRating: number; ratingCount: number }>
  }
}

export type AdminMasterDataEntity =
  | 'property-types'
  | 'states'
  | 'cities'
  | 'contract-types'
  | 'vehicle-types'
  | 'service-regions'
  | 'floor-levels'
  | 'occupations'
  | 'amenities'
  | 'status-codes'
  | 'roles'

export type AdminMasterDataItem = {
  id: string
  isActive?: boolean
  name?: string
  description?: string | null
  countryCode?: string
  stateId?: string
  postalCodePrefix?: string | null
  durationMonths?: number
  capacityLabel?: string | null
  maxLoadKg?: number | null
  code?: string
  levelNumber?: number | null
  category?: string | null
  entityType?: string
  label?: string
  color?: string | null
  state?: { id: string; name: string } | null
  [key: string]: unknown
}

export type CreateUserInput = {
  name: string
  email: string
  phone: string
  password: string
  role: AdminRole
}

export type UpdateRolesInput = {
  roles: AdminRole[]
}
