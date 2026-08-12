import { apiRequest } from '@/lib/api/client'

import type { AdminMasterDataEntity, AdminMasterDataItem } from '../types'

export const adminMasterDataApi = {
  list(entity: AdminMasterDataEntity, isActive?: boolean) {
    const params = new URLSearchParams()
    if (typeof isActive === 'boolean') {
      params.set('isActive', String(isActive))
    }
    const query = params.toString()
    return apiRequest<{ items: AdminMasterDataItem[] }>(
      `/admin/master-data/${entity}${query ? `?${query}` : ''}`,
    )
  },

  getById(entity: AdminMasterDataEntity, id: string) {
    return apiRequest<{ item: AdminMasterDataItem }>(`/admin/master-data/${entity}/${id}`)
  },

  create(entity: AdminMasterDataEntity, body: Record<string, unknown>) {
    return apiRequest<{ item: AdminMasterDataItem }>(`/admin/master-data/${entity}`, {
      method: 'POST',
      body,
    })
  },

  update(entity: AdminMasterDataEntity, id: string, body: Record<string, unknown>) {
    return apiRequest<{ item: AdminMasterDataItem }>(`/admin/master-data/${entity}/${id}`, {
      method: 'PATCH',
      body,
    })
  },

  deactivate(entity: AdminMasterDataEntity, id: string) {
    return apiRequest<{ item: AdminMasterDataItem }>(`/admin/master-data/${entity}/${id}`, {
      method: 'DELETE',
    })
  },
}
