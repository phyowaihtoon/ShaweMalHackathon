import type { AdminMasterDataEntity } from '../types'

export const ADMIN_MASTER_DATA_ENTITIES: AdminMasterDataEntity[] = [
  'property-types',
  'states',
  'cities',
  'contract-types',
  'vehicle-types',
  'service-regions',
  'floor-levels',
  'occupations',
  'amenities',
  'status-codes',
  'roles',
  'moving-inventory-items',
]

export type MasterDataFieldType = 'text' | 'number' | 'boolean'

export type MasterDataFieldConfig = {
  name: string
  labelKey: string
  type: MasterDataFieldType
  required?: boolean
}

export const MASTER_DATA_FIELD_CONFIG: Record<AdminMasterDataEntity, MasterDataFieldConfig[]> = {
  'property-types': [
    { name: 'name', labelKey: 'admin.masterData.fields.name', type: 'text', required: true },
    { name: 'description', labelKey: 'admin.masterData.fields.description', type: 'text' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  states: [
    { name: 'name', labelKey: 'admin.masterData.fields.name', type: 'text', required: true },
    { name: 'countryCode', labelKey: 'admin.masterData.fields.countryCode', type: 'text', required: true },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  cities: [
    { name: 'name', labelKey: 'admin.masterData.fields.name', type: 'text', required: true },
    { name: 'stateId', labelKey: 'admin.masterData.fields.stateId', type: 'text', required: true },
    { name: 'countryCode', labelKey: 'admin.masterData.fields.countryCode', type: 'text', required: true },
    { name: 'postalCodePrefix', labelKey: 'admin.masterData.fields.postalCodePrefix', type: 'text' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  'contract-types': [
    { name: 'name', labelKey: 'admin.masterData.fields.name', type: 'text', required: true },
    { name: 'durationMonths', labelKey: 'admin.masterData.fields.durationMonths', type: 'number', required: true },
    { name: 'description', labelKey: 'admin.masterData.fields.description', type: 'text' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  'vehicle-types': [
    { name: 'name', labelKey: 'admin.masterData.fields.name', type: 'text', required: true },
    { name: 'capacityLabel', labelKey: 'admin.masterData.fields.capacityLabel', type: 'text' },
    { name: 'maxLoadKg', labelKey: 'admin.masterData.fields.maxLoadKg', type: 'number' },
    { name: 'pointFrom', labelKey: 'admin.masterData.fields.pointFrom', type: 'number' },
    { name: 'pointTo', labelKey: 'admin.masterData.fields.pointTo', type: 'number' },
    { name: 'pricePerKm', labelKey: 'admin.masterData.fields.pricePerKm', type: 'number' },
    { name: 'description', labelKey: 'admin.masterData.fields.description', type: 'text' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  'service-regions': [
    { name: 'name', labelKey: 'admin.masterData.fields.name', type: 'text', required: true },
    { name: 'code', labelKey: 'admin.masterData.fields.code', type: 'text', required: true },
    { name: 'description', labelKey: 'admin.masterData.fields.description', type: 'text' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  'floor-levels': [
    { name: 'name', labelKey: 'admin.masterData.fields.name', type: 'text', required: true },
    { name: 'levelNumber', labelKey: 'admin.masterData.fields.levelNumber', type: 'number' },
    { name: 'surchargeAmount', labelKey: 'admin.masterData.fields.surchargeAmount', type: 'number' },
    { name: 'description', labelKey: 'admin.masterData.fields.description', type: 'text' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  'moving-inventory-items': [
    { name: 'code', labelKey: 'admin.masterData.fields.code', type: 'text', required: true },
    { name: 'category', labelKey: 'admin.masterData.fields.category', type: 'text', required: true },
    { name: 'itemName', labelKey: 'admin.masterData.fields.itemName', type: 'text', required: true },
    { name: 'points', labelKey: 'admin.masterData.fields.points', type: 'number', required: true },
    { name: 'sortOrder', labelKey: 'admin.masterData.fields.sortOrder', type: 'number' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  occupations: [
    { name: 'name', labelKey: 'admin.masterData.fields.name', type: 'text', required: true },
    { name: 'description', labelKey: 'admin.masterData.fields.description', type: 'text' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  amenities: [
    { name: 'name', labelKey: 'admin.masterData.fields.name', type: 'text', required: true },
    { name: 'category', labelKey: 'admin.masterData.fields.category', type: 'text' },
    { name: 'description', labelKey: 'admin.masterData.fields.description', type: 'text' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  'status-codes': [
    { name: 'entityType', labelKey: 'admin.masterData.fields.entityType', type: 'text', required: true },
    { name: 'code', labelKey: 'admin.masterData.fields.code', type: 'text', required: true },
    { name: 'label', labelKey: 'admin.masterData.fields.label', type: 'text', required: true },
    { name: 'color', labelKey: 'admin.masterData.fields.color', type: 'text' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
  roles: [
    { name: 'name', labelKey: 'admin.masterData.fields.name', type: 'text', required: true },
    { name: 'code', labelKey: 'admin.masterData.fields.code', type: 'text', required: true },
    { name: 'description', labelKey: 'admin.masterData.fields.description', type: 'text' },
    { name: 'isActive', labelKey: 'admin.masterData.fields.isActive', type: 'boolean' },
  ],
}

export function getMasterDataDisplayLabel(item: {
  name?: string
  itemName?: string
  label?: string
  code?: string
  entityType?: string
  id: string
}): string {
  if (item.name) return item.name
  if (item.itemName) return item.itemName
  if (item.label) return item.label
  if (item.code) return item.code
  if (item.entityType) return item.entityType
  return item.id
}
