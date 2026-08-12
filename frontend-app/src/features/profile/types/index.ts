export type ProfileUser = {
  id: string
  name: string
  email: string
  phone: string
  profilePicturePath?: string | null
  verificationStatus?: string
  roles: string[]
}

export type ProfileUpdateInput = {
  name?: string
  phone?: string
  profilePicturePath?: string | null
}

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export type ProfileHistory = {
  bookingHistory: Array<{
    id: string
    status: string
    createdAt: string
    house?: {
      id: string
      title: string
      city?: { id: string; name: string } | null
      state?: { id: string; name: string } | null
    } | null
  }>
  movingHistory: Array<{
    id: string
    status: string
    pickupAddress: string
    dropoffAddress: string
    createdAt: string
    vehicleType?: { id: string; name: string } | null
    assignedDriver?: { id: string; name: string; phone?: string | null } | null
  }>
  notifications: {
    total: number
    unread: number
    recent: Array<{
      id: string
      title: string
      message: string
      isRead: boolean
      createdAt: string
    }>
  }
}

export type ReviewCreateInput = {
  targetType: 'AGENT' | 'DRIVER'
  targetUserId: string
  rating: number
  comment?: string
}
