import { apiRequest } from '@/lib/api/client'

import type { HouseBooking } from '@/features/houses/types/booking'

export const agentBookingsApi = {
  list() {
    return apiRequest<{ items: HouseBooking[] }>('/agent/bookings')
  },
}
