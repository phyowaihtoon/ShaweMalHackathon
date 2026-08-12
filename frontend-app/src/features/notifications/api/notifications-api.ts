import { apiRequest } from '@/lib/api/client'

import type { AppNotification, NotificationsPayload } from '../types'

export const notificationsApi = {
  list() {
    return apiRequest<NotificationsPayload>('/notifications')
  },
  markRead(id: string) {
    return apiRequest<{ item: AppNotification }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    })
  },
}
