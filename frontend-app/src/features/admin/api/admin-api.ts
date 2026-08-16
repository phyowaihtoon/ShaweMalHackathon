import { apiRequest } from '@/lib/api/client'

import type {
  AdminAgentQueueItem,
  AdminAgentRegistration,
  AdminDriverQueueItem,
  AdminDriverRegistration,
  AdminOverviewReport,
  AdminSafeUser,
  CreateUserInput,
  HouseBookingReportFilters,
  PaginatedVerificationList,
  UpdateRolesInput,
  VerificationAction,
  VerificationQueueFilters,
} from '../types'
import type { HouseBooking } from '@/features/houses/types/booking'

export type ReportPeriodFilters = {
  from?: string
  to?: string
}

function buildReportsQuery(filters: ReportPeriodFilters = {}): string {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  const query = params.toString()
  return query ? `?${query}` : ''
}

function buildBookingReportQuery(filters: HouseBookingReportFilters = {}): string {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.status) params.set('status', filters.status)
  if (filters.houseId) params.set('houseId', filters.houseId)
  if (filters.agentId) params.set('agentId', filters.agentId)
  if (filters.userId) params.set('userId', filters.userId)
  const query = params.toString()
  return query ? `?${query}` : ''
}

function buildVerificationQueueQuery(filters: VerificationQueueFilters = {}): string {
  const params = new URLSearchParams()
  params.set('status', filters.status ?? 'PENDING')
  if (filters.q) params.set('q', filters.q)
  if (typeof filters.page === 'number') params.set('page', String(filters.page))
  if (typeof filters.pageSize === 'number') params.set('pageSize', String(filters.pageSize))
  return `?${params.toString()}`
}

export const adminApi = {
  createUser(input: CreateUserInput) {
    return apiRequest<{ user: AdminSafeUser }>('/admin/users', {
      method: 'POST',
      body: input,
    })
  },

  updateUserRoles(userId: string, input: UpdateRolesInput) {
    return apiRequest<{ user: AdminSafeUser }>(`/admin/users/${userId}/roles`, {
      method: 'PATCH',
      body: input,
    })
  },

  listAgentRegistrations(filters: VerificationQueueFilters = {}) {
    return apiRequest<PaginatedVerificationList<AdminAgentQueueItem>>(
      `/admin/agents${buildVerificationQueueQuery(filters)}`,
    )
  },

  listDriverRegistrations(filters: VerificationQueueFilters = {}) {
    return apiRequest<PaginatedVerificationList<AdminDriverQueueItem>>(
      `/admin/drivers${buildVerificationQueueQuery(filters)}`,
    )
  },

  updateAgentVerification(userId: string, status: VerificationAction, rejectionReason?: string) {
    return apiRequest<{ user: AdminSafeUser }>(`/admin/agents/${userId}/verification`, {
      method: 'PATCH',
      body: { status, rejectionReason: rejectionReason || undefined },
    })
  },

  getAgentRegistration(userId: string) {
    return apiRequest<AdminAgentRegistration>(`/admin/agents/${userId}`)
  },

  updateDriverVerification(userId: string, status: VerificationAction, rejectionReason?: string) {
    return apiRequest<{ user: AdminSafeUser }>(`/admin/drivers/${userId}/verification`, {
      method: 'PATCH',
      body: { status, rejectionReason: rejectionReason || undefined },
    })
  },

  getDriverRegistration(userId: string) {
    return apiRequest<AdminDriverRegistration>(`/admin/drivers/${userId}`)
  },

  assignMovingRequest(requestId: string, driverUserId: string) {
    return apiRequest<{ movingRequest: unknown }>(`/admin/moving/requests/${requestId}/assign`, {
      method: 'POST',
      body: { driverUserId },
    })
  },

  getReportsOverview(filters: ReportPeriodFilters = {}) {
    return apiRequest<AdminOverviewReport>(`/admin/reports/overview${buildReportsQuery(filters)}`)
  },

  getHouseBookingReport(filters: HouseBookingReportFilters = {}) {
    return apiRequest<{ items: HouseBooking[] }>(`/admin/reports/bookings${buildBookingReportQuery(filters)}`)
  },
}
