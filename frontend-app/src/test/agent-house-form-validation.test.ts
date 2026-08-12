import { describe, expect, it } from 'vitest'

import {
  collectImagePaths,
  defaultAgentHouseFormValues,
  toAgentHouseInput,
  validateAgentHouseForm,
  type AgentHouseFormValues,
} from '@/features/agent/schemas/agent-house-schema'

const t = (key: string) => key

function baseValues(overrides: Partial<AgentHouseFormValues> = {}): AgentHouseFormValues {
  return {
    ...defaultAgentHouseFormValues(),
    title: 'Sunny Flat',
    propertyTypeId: 'pt1',
    contractTypeId: 'ct1',
    monthlyFees: '300000',
    depositAmount: '600000',
    bedrooms: '2',
    bathrooms: '1',
    contactPhoneNumber: '0999999999',
    cityId: 'c1',
    stateId: 's1',
    image1: 'uploads/houses/11111111-2222-3333-4444-555555555555.jpg',
    amenityIds: ['a1'],
    ...overrides,
  }
}

describe('agent house form validation', () => {
  it('accepts a complete payload shape', () => {
    const values = baseValues()
    const errors = validateAgentHouseForm(values, t)

    expect(errors).toEqual({})
    expect(collectImagePaths(values)).toEqual([
      'uploads/houses/11111111-2222-3333-4444-555555555555.jpg',
    ])
    expect(toAgentHouseInput(values)).toMatchObject({
      title: 'Sunny Flat',
      postChannel: 'agent',
      propertyTypeId: 'pt1',
      monthlyFees: 300000,
      bedrooms: 2,
      imagePaths: ['uploads/houses/11111111-2222-3333-4444-555555555555.jpg'],
      amenityIds: ['a1'],
    })
  })

  it('requires core housing fields and at least one image path', () => {
    const errors = validateAgentHouseForm(
      baseValues({
        title: '',
        propertyTypeId: '',
        contractTypeId: '',
        monthlyFees: '',
        depositAmount: '-1',
        bedrooms: '1.5',
        bathrooms: '',
        contactPhoneNumber: '',
        cityId: '',
        stateId: '',
        image1: '',
      }),
      t,
    )

    expect(errors.title).toBe('auth.required')
    expect(errors.propertyTypeId).toBe('auth.required')
    expect(errors.contractTypeId).toBe('auth.required')
    expect(errors.monthlyFees).toBe('agent.houses.nonNegativeNumber')
    expect(errors.depositAmount).toBe('agent.houses.nonNegativeNumber')
    expect(errors.bedrooms).toBe('agent.houses.nonNegativeInteger')
    expect(errors.bathrooms).toBe('agent.houses.nonNegativeInteger')
    expect(errors.contactPhoneNumber).toBe('auth.required')
    expect(errors.cityId).toBe('auth.required')
    expect(errors.stateId).toBe('auth.required')
    expect(errors.imagePaths).toBe('agent.houses.imagesRequired')
  })
})
