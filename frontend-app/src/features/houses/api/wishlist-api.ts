import { apiRequest } from '@/lib/api/client'

import type { WishlistItem } from '../types'

export const wishlistApi = {
  list() {
    return apiRequest<{ items: WishlistItem[] }>('/wishlist')
  },
  add(houseId: string) {
    return apiRequest<{ item: { id: string; houseId: string } }>(`/wishlist/${houseId}`, {
      method: 'POST',
    })
  },
  remove(houseId: string) {
    return apiRequest<{ ok: boolean }>(`/wishlist/${houseId}`, {
      method: 'DELETE',
    })
  },
}
