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
  | 'moving-inventory-items'

export type MasterDataItem = {
  id: string
  name: string
  itemName?: string
  isActive?: boolean
  stateId?: string
  state?: { id?: string; name?: string }
  code?: string
  category?: string
  points?: number
  sortOrder?: number
  description?: string | null
  pointFrom?: number | null
  pointTo?: number | null
  pricePerKm?: number | string | null
  surchargeAmount?: number | string | null
  levelNumber?: number | null
  capacityLabel?: string | null
}
