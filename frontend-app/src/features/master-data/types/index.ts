export type MasterDataEntity =
  | 'property-types'
  | 'states'
  | 'cities'
  | 'contract-types'
  | 'vehicle-types'
  | 'service-regions'
  | 'floor-levels'
  | 'occupations'
  | 'amenities'
  | 'status-codes'

export type MasterDataItem = {
  id: string
  name: string
  isActive?: boolean
  stateId?: string
  code?: string
  description?: string | null
}
