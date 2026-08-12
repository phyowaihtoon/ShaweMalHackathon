import type { AgentHouse, AgentHouseInput } from '../types'

export type AgentHouseFormValues = {
  title: string
  description: string
  postChannel: 'agent' | 'roommate'
  propertyTypeId: string
  contractTypeId: string
  areaSize: string
  floorLevelId: string
  monthlyFees: string
  depositAmount: string
  bedrooms: string
  bathrooms: string
  houseRules: string
  contactTelegram: string
  contactViber: string
  contactPhoneNumber: string
  cityId: string
  stateId: string
  nearbyPlaces: string
  availability: 'available' | 'not_available'
  image1: string
  image2: string
  image3: string
  image4: string
  image5: string
  amenityIds: string[]
}

export type AgentHouseFormErrorKey =
  | keyof AgentHouseFormValues
  | 'imagePaths'
  | 'monthlyFees'
  | 'depositAmount'
  | 'bedrooms'
  | 'bathrooms'

export function defaultAgentHouseFormValues(): AgentHouseFormValues {
  return {
    title: '',
    description: '',
    postChannel: 'agent',
    propertyTypeId: '',
    contractTypeId: '',
    areaSize: '',
    floorLevelId: '',
    monthlyFees: '',
    depositAmount: '',
    bedrooms: '0',
    bathrooms: '0',
    houseRules: '',
    contactTelegram: '',
    contactViber: '',
    contactPhoneNumber: '',
    cityId: '',
    stateId: '',
    nearbyPlaces: '',
    availability: 'available',
    image1: '',
    image2: '',
    image3: '',
    image4: '',
    image5: '',
    amenityIds: [],
  }
}

export function collectImagePaths(values: AgentHouseFormValues): string[] {
  return [values.image1, values.image2, values.image3, values.image4, values.image5]
    .map((path) => path.trim())
    .filter(Boolean)
}

function parseNonNegativeNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

function parseNonNegativeInt(value: string): number | null {
  const parsed = parseNonNegativeNumber(value)
  if (parsed === null) return null
  if (!Number.isInteger(parsed)) return null
  return parsed
}

export function validateAgentHouseForm(
  values: AgentHouseFormValues,
  t: (key: string) => string,
): Partial<Record<AgentHouseFormErrorKey, string>> {
  const errors: Partial<Record<AgentHouseFormErrorKey, string>> = {}

  if (!values.title.trim()) errors.title = t('auth.required')
  if (!values.postChannel) errors.postChannel = t('auth.required')
  if (!values.propertyTypeId.trim()) errors.propertyTypeId = t('auth.required')
  if (!values.contractTypeId.trim()) errors.contractTypeId = t('auth.required')
  if (!values.contactPhoneNumber.trim()) errors.contactPhoneNumber = t('auth.required')
  if (!values.cityId.trim()) errors.cityId = t('auth.required')
  if (!values.stateId.trim()) errors.stateId = t('auth.required')
  if (!values.availability) errors.availability = t('auth.required')

  const monthlyFees = parseNonNegativeNumber(values.monthlyFees)
  if (monthlyFees === null) errors.monthlyFees = t('agent.houses.nonNegativeNumber')

  const depositAmount = parseNonNegativeNumber(values.depositAmount)
  if (depositAmount === null) errors.depositAmount = t('agent.houses.nonNegativeNumber')

  const bedrooms = parseNonNegativeInt(values.bedrooms)
  if (bedrooms === null) errors.bedrooms = t('agent.houses.nonNegativeInteger')

  const bathrooms = parseNonNegativeInt(values.bathrooms)
  if (bathrooms === null) errors.bathrooms = t('agent.houses.nonNegativeInteger')

  const imagePaths = collectImagePaths(values)
  if (imagePaths.length < 1) {
    errors.imagePaths = t('agent.houses.imagesRequired')
  } else if (imagePaths.length > 5) {
    errors.imagePaths = t('agent.houses.imagesMax')
  }

  return errors
}

export function toAgentHouseInput(values: AgentHouseFormValues): AgentHouseInput {
  const imagePaths = collectImagePaths(values)
  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    postChannel: values.postChannel,
    propertyTypeId: values.propertyTypeId.trim(),
    contractTypeId: values.contractTypeId.trim(),
    areaSize: values.areaSize.trim() || undefined,
    floorLevelId: values.floorLevelId.trim() || undefined,
    monthlyFees: Number(values.monthlyFees),
    depositAmount: Number(values.depositAmount),
    bedrooms: Number(values.bedrooms),
    bathrooms: Number(values.bathrooms),
    houseRules: values.houseRules.trim() || undefined,
    contactTelegram: values.contactTelegram.trim() || undefined,
    contactViber: values.contactViber.trim() || undefined,
    contactPhoneNumber: values.contactPhoneNumber.trim(),
    cityId: values.cityId.trim(),
    stateId: values.stateId.trim(),
    nearbyPlaces: values.nearbyPlaces.trim() || undefined,
    availability: values.availability,
    imagePaths,
    amenityIds: values.amenityIds,
  }
}

function normalizePostChannel(value: string | undefined): 'agent' | 'roommate' {
  return value?.toLowerCase() === 'roommate' ? 'roommate' : 'agent'
}

function normalizeAvailability(value: string | undefined): 'available' | 'not_available' {
  return value?.toLowerCase() === 'not_available' || value?.toLowerCase() === 'not available'
    ? 'not_available'
    : 'available'
}

export function houseToFormValues(house: AgentHouse): AgentHouseFormValues {
  const paths = [...house.images]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((image) => image.imagePath)

  return {
    title: house.title ?? '',
    description: house.description ?? '',
    postChannel: normalizePostChannel(house.postChannel),
    propertyTypeId: house.propertyType?.id ?? '',
    contractTypeId: house.contractType?.id ?? '',
    areaSize: house.areaSize ?? '',
    floorLevelId: house.floorLevel?.id ?? '',
    monthlyFees: String(house.monthlyFees ?? ''),
    depositAmount: String(house.depositAmount ?? ''),
    bedrooms: String(house.bedrooms ?? 0),
    bathrooms: String(house.bathrooms ?? 0),
    houseRules: house.houseRules ?? '',
    contactTelegram: house.contactTelegram ?? '',
    contactViber: house.contactViber ?? '',
    contactPhoneNumber: house.contactPhoneNumber ?? '',
    cityId: house.city?.id ?? '',
    stateId: house.state?.id ?? '',
    nearbyPlaces: house.nearbyPlaces ?? '',
    availability: normalizeAvailability(house.availability),
    image1: paths[0] ?? '',
    image2: paths[1] ?? '',
    image3: paths[2] ?? '',
    image4: paths[3] ?? '',
    image5: paths[4] ?? '',
    amenityIds: house.amenities.map((item) => item.id),
  }
}
