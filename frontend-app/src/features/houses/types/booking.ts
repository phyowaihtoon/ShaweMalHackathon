export type BookingUserSummary = {
  id: string
  name: string
  email: string
  phone?: string | null
}

export type HouseBooking = {
  id: string
  userId: string
  houseId: string
  status: string
  createdAt: string
  updatedAt?: string
  cancelledAt?: string | null
  cancelledByUserId?: string | null
  cancelledByRole?: 'USER' | 'AGENT' | 'ADMIN' | null
  house?: {
    id: string
    title: string
    agentId?: string
    availability?: string
    city?: { id: string; name: string } | null
    state?: { id: string; name: string } | null
    agent?: { id: string; name: string; email?: string | null; phone?: string | null } | null
  } | null
  user?: BookingUserSummary | null
  cancelledByUser?: { id: string; name: string } | null
}
