import { apiRequest } from '@/lib/api/client'

import type { AgentHouse, AgentHouseInput } from '../types'

export const agentHousesApi = {
  list() {
    return apiRequest<{ items: AgentHouse[] }>('/agent/houses')
  },
  create(input: AgentHouseInput) {
    return apiRequest<{ house: AgentHouse }>('/agent/houses', {
      method: 'POST',
      body: input,
    })
  },
  update(id: string, input: AgentHouseInput) {
    return apiRequest<{ house: AgentHouse }>(`/agent/houses/${id}`, {
      method: 'PATCH',
      body: input,
    })
  },
  remove(id: string) {
    return apiRequest<{ ok: boolean }>(`/agent/houses/${id}`, {
      method: 'DELETE',
    })
  },
}
