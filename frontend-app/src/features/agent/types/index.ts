export type NamedRef = {
  id: string
  name: string
}

export type AgentHouseImage = {
  id?: string
  imagePath: string
  sortOrder?: number
}

export type AgentHouse = {
  id: string
  title: string
  description?: string | null
  postChannel: string
  monthlyFees: number
  depositAmount: number
  areaSize?: string | null
  bedrooms: number
  bathrooms: number
  houseRules?: string | null
  contactTelegram?: string | null
  contactViber?: string | null
  contactPhoneNumber: string
  streetAddress?: string | null
  latitude?: number | null
  longitude?: number | null
  nearbyPlaces?: string | null
  availability: string
  propertyType?: NamedRef | null
  contractType?: NamedRef | null
  floorLevel?: NamedRef | null
  city?: NamedRef | null
  state?: NamedRef | null
  images: AgentHouseImage[]
  amenities: NamedRef[]
  createdAt?: string
  updatedAt?: string
}

export type AgentHouseInput = {
  title: string
  description?: string
  postChannel: 'agent' | 'roommate'
  propertyTypeId: string
  contractTypeId: string
  areaSize?: string
  floorLevelId?: string
  monthlyFees: number
  depositAmount: number
  bedrooms: number
  bathrooms: number
  houseRules?: string
  contactTelegram?: string
  contactViber?: string
  contactPhoneNumber: string
  cityId: string
  stateId: string
  streetAddress?: string
  latitude?: number | null
  longitude?: number | null
  nearbyPlaces?: string
  availability: 'available' | 'not_available'
  imagePaths: string[]
  amenityIds?: string[]
}
