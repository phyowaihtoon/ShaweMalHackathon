export type MovingInventoryItem = {
  inventoryItemTypeId?: string
  category: string
  itemName: string
  count: number
  pointsPerItem?: number
  linePoints?: number
}

export type MovingRequestInput = {
  pickupAddress: string
  dropoffAddress: string
  pickupLatitude?: number
  pickupLongitude?: number
  dropoffLatitude?: number
  dropoffLongitude?: number
  pickupFloorLevelId: string
  dropoffFloorLevelId: string
  moveInDate: string
  vehicleTypeId: string
  remarks?: string
  damageChecklist?: string
  photos: string[]
  inventoryItems: Array<{ inventoryItemTypeId: string; count: number }>
}

export type MovingQuoteInput = {
  pickupAddress: string
  dropoffAddress: string
  pickupLatitude?: number
  pickupLongitude?: number
  dropoffLatitude?: number
  dropoffLongitude?: number
  pickupFloorLevelId: string
  dropoffFloorLevelId: string
  vehicleTypeId?: string
  inventoryItems: Array<{ inventoryItemTypeId: string; count: number }>
}

export type MovingQuote = {
  pickupAddress: string
  dropoffAddress: string
  pickupFloorLevel: { id: string; name: string; surchargeAmount: number | null }
  dropoffFloorLevel: { id: string; name: string; surchargeAmount: number | null }
  distanceKm: number
  totalInventoryPoints: number
  inventoryItems: MovingInventoryItem[]
  suggestedVehicleType: {
    id: string
    name: string
    pointFrom: number | null
    pointTo: number | null
    pricePerKm: number | null
    match: 'exact' | 'closest'
  }
  selectedVehicleType: {
    id: string
    name: string
    capacityLabel?: string | null
    maxLoadKg?: number | null
    pointFrom: number | null
    pointTo: number | null
    pricePerKm: number | null
  }
  pricePerKm: number
  pickupFloorSurcharge: number
  dropoffFloorSurcharge: number
  estimatedPrice: number
}

export type MovingRequest = {
  id: string
  orderNumber?: string
  status: string
  pickupAddress: string
  dropoffAddress: string
  distanceKm?: number | null
  moveInDate: string
  remarks?: string | null
  damageChecklist?: string | null
  totalInventoryPoints?: number
  estimatedPrice?: number | null
  pricePerKmUsed?: number | null
  pickupFloorSurcharge?: number | null
  dropoffFloorSurcharge?: number | null
  estimatedEarnings?: number | null
  acceptedAt?: string | null
  requester?: {
    id: string
    name: string
    phone?: string | null
    email?: string | null
  } | null
  assignedDriver?: {
    id: string
    name: string
    phone?: string | null
    email?: string | null
    driverProfile?: {
      name?: string | null
      phone?: string | null
      profilePhotoPath?: string | null
      vehicleLicensePlateNumber?: string | null
    } | null
  } | null
  vehicleType?: {
    id: string
    name: string
    capacityLabel?: string | null
    maxLoadKg?: number | null
  } | null
  pickupFloorLevel?: { id: string; name: string } | null
  dropoffFloorLevel?: { id: string; name: string } | null
  photos: Array<{ id?: string; photoPath: string; sortOrder?: number }>
  inventoryItems: MovingInventoryItem[]
  statusEvents?: Array<{
    id: string
    eventType: string
    status: string
    notes?: string | null
    createdAt: string
  }>
  etaEntries?: Array<{
    id: string
    stage: string
    etaAt: string
    notes?: string | null
    createdAt: string
  }>
  createdAt?: string
  updatedAt?: string
  myReview?: {
    id: string
    rating: number
    comment?: string | null
  } | null
}
