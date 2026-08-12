import { apiRequest } from '@/lib/api/client'

import type { MovingRequest, MovingRequestInput } from '../types'

export const movingApi = {
  create(input: MovingRequestInput) {
    return apiRequest<{ movingRequest: MovingRequest }>('/moving/requests', {
      method: 'POST',
      body: input,
    })
  },
  getById(id: string) {
    return apiRequest<{ movingRequest: MovingRequest }>(`/moving/requests/${id}`)
  },
}
