import { apiRequest } from '@/lib/api/client'

import type {
  AdminOverviewReport,
  AdminSafeUser,
  CreateUserInput,
  UpdateRolesInput,
  VerificationAction,
} from '../types'

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

  updateAgentVerification(userId: string, status: VerificationAction) {
    return apiRequest<{ user: AdminSafeUser }>(`/admin/agents/${userId}/verification`, {
      method: 'PATCH',
      body: { status },
    })
  },

  updateDriverVerification(userId: string, status: VerificationAction) {
    return apiRequest<{ user: AdminSafeUser }>(`/admin/drivers/${userId}/verification`, {
      method: 'PATCH',
      body: { status },
    })
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
}
