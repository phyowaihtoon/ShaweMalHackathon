import { apiRequest } from '@/lib/api/client'

import type {
  ChangePasswordInput,
  ProfileHistory,
  ProfileUpdateInput,
  ProfileUser,
  ReviewCreateInput,
} from '../types'

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

export const reviewsApi = {
  create(input: ReviewCreateInput) {
    return apiRequest<{ item: unknown }>('/reviews', {
      method: 'POST',
      body: input,
    })
  },
  list(targetType: 'AGENT' | 'DRIVER', targetUserId: string) {
    const search = new URLSearchParams({ targetType, targetUserId })
    return apiRequest<{ items: unknown[]; averageRating?: number }>(`/reviews?${search.toString()}`, {
      auth: false,
    })
  },
}
