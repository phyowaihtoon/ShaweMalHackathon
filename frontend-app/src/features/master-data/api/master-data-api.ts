import { apiRequest } from '@/lib/api/client'

import type { MasterDataEntity, MasterDataItem } from '../types'

export const masterDataApi = {
  list(entity: MasterDataEntity) {
    return apiRequest<{ items: MasterDataItem[] }>(`/master-data/${entity}`, { auth: false })
  },
}
