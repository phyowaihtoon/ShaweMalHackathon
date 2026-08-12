import { apiRequest } from '@/lib/api/client'

import type { HomePageContent } from '../types'

export const homeApi = {
  getContent() {
    return apiRequest<HomePageContent>('/home', { auth: false })
  },
}
