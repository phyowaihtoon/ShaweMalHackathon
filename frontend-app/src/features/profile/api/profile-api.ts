import { apiRequest } from '@/lib/api/client'

import type { ChangePasswordInput, ProfileHistory, ProfileUpdateInput, ProfileUser } from '../types'

export const profileApi = {
  get() {
    return apiRequest<{ user: ProfileUser }>('/profile')
  },
  update(input: ProfileUpdateInput) {
    return apiRequest<{ user: ProfileUser }>('/profile', {
      method: 'PATCH',
      body: input,
    })
  },
  changePassword(input: ChangePasswordInput) {
    return apiRequest<{ ok: boolean }>('/profile/change-password', {
      method: 'PATCH',
      body: input,
    })
  },
  history() {
    return apiRequest<ProfileHistory>('/profile/history')
  },
}
