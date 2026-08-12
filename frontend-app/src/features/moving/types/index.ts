export type MovingInventoryItem = {
  category: string
  itemName: string
  count: number
}

export type MovingRequestInput = {
  pickupAddress: string
  dropoffAddress: string
  moveInDate: string
  vehicleTypeId: string
  remarks?: string
  damageChecklist?: string
  photos: string[]
  inventoryItems: MovingInventoryItem[]
}

export type MovingRequest = {
  id: string
  status: string
  pickupAddress: string
  dropoffAddress: string
  moveInDate: string
  remarks?: string | null
  damageChecklist?: string | null
  estimatedEarnings?: number | null
  acceptedAt?: string | null
  requester?: {
    id: string
    name: string
    phone?: string | null
  } | null
  assignedDriver?: {
    id: string
    name: string
    phone?: string | null
  } | null
  vehicleType?: {
    id: string
    name: string
  } | null
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
}
