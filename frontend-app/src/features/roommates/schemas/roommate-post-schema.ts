import type { RoommateGender } from '../types'

export const ROOMMATE_INTEREST_FLAGS = [
  'isLgbtqFriendly',
  'isCannabisFriendly',
  'isSmokingFriendly',
  'isNoSmoking',
  'isCatFriendly',
  'isDogFriendly',
  'isAlcoholFriendly',
  'likesNightOut',
  'likesHangoutEveryday',
] as const

export const ROOMMATE_HOBBY_FLAGS = [
  'hobbyPlayingGame',
  'hobbyWatchingMovies',
  'hobbySinging',
  'hobbyPlayingFootball',
  'hobbyRunning',
  'hobbyCooking',
  'hobbyReading',
  'hobbyFoodie',
  'hobbyChillWithOthers',
  'hobbyRelaxSilent',
  'hobbyPlayingGym',
] as const

export type RoommateFlagKey =
  | (typeof ROOMMATE_INTEREST_FLAGS)[number]
  | (typeof ROOMMATE_HOBBY_FLAGS)[number]

export type RoommatePostFormValues = {
  houseId: string
  title: string
  budgetCostSharing: string
  gender: RoommateGender
  occupationId: string
} & Record<RoommateFlagKey, boolean>

export function defaultRoommatePostFormValues(): RoommatePostFormValues {
  const flags = Object.fromEntries(
    [...ROOMMATE_INTEREST_FLAGS, ...ROOMMATE_HOBBY_FLAGS].map((key) => [key, false]),
  ) as Record<RoommateFlagKey, boolean>

  return {
    houseId: '',
    title: '',
    budgetCostSharing: '',
    gender: 'ANY',
    occupationId: '',
    ...flags,
  }
}

export function validateRoommatePostForm(
  values: RoommatePostFormValues,
  t: (key: string) => string,
) {
  const errors: Partial<Record<keyof RoommatePostFormValues, string>> = {}

  if (!values.houseId.trim()) errors.houseId = t('auth.required')
  if (!values.title.trim()) errors.title = t('auth.required')
  if (!values.budgetCostSharing.trim()) errors.budgetCostSharing = t('auth.required')
  if (!values.occupationId.trim()) errors.occupationId = t('auth.required')
  if (!values.gender) errors.gender = t('auth.required')

  return errors
}
