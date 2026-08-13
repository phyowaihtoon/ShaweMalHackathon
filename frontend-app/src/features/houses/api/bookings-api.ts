import { apiRequest } from '@/lib/api/client'

import type { HouseBooking } from '../types/booking'

export const bookingsApi = {
  listMine() {
    return apiRequest<{ items: HouseBooking[] }>('/bookings')
  },
  getById(id: string) {
    return apiRequest<{ booking: HouseBooking }>(`/bookings/${id}`)
  },
  updateStatus(id: string, status: 'CONFIRMED' | 'CANCELLED') {
    return apiRequest<{ booking: HouseBooking }>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
  },
}
