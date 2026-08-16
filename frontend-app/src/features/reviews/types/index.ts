export type MyReview = {
  id: string
  rating: number
  comment?: string | null
}

export type ReviewCreateInput = {
  rating: number
  comment?: string
  bookingId?: string
  movingRequestId?: string
}

export type ReviewItem = {
  id: string
  targetType: 'AGENT' | 'DRIVER'
  targetUserId: string
  rating: number
  comment?: string | null
  bookingId?: string | null
  movingRequestId?: string | null
}
