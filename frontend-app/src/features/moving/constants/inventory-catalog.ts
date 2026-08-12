export type InventoryCatalogItem = {
  key: string
  category: string
  itemName: string
}

export const MOVING_INVENTORY_CATALOG: InventoryCatalogItem[] = [
  { key: 'bedroom_single_bed', category: 'bedroom', itemName: 'Single bed' },
  { key: 'bedroom_couple_bed', category: 'bedroom', itemName: 'Couple bed' },
  { key: 'bedroom_king_bed', category: 'bedroom', itemName: 'King bed' },
  { key: 'bedroom_mattress', category: 'bedroom', itemName: 'Mattress' },
  { key: 'bedroom_wardrobe', category: 'bedroom', itemName: 'Wardrobe' },
  { key: 'bedroom_dressing_table', category: 'bedroom', itemName: 'Dressing table' },
  { key: 'bedroom_bedside_table', category: 'bedroom', itemName: 'Bedside table' },
  { key: 'bedroom_chair', category: 'bedroom', itemName: 'Chair' },
  { key: 'bedroom_study_table', category: 'bedroom', itemName: 'Study table' },
  { key: 'bedroom_bookshelf', category: 'bedroom', itemName: 'Bookshelf' },
  { key: 'living_sofa_2', category: 'living', itemName: 'Sofa (2 seats)' },
  { key: 'living_sofa_1', category: 'living', itemName: 'Sofa (1 seat)' },
  { key: 'living_coffee_table', category: 'living', itemName: 'Coffee table' },
  { key: 'living_tv', category: 'living', itemName: 'TV' },
  { key: 'living_tv_stand', category: 'living', itemName: 'TV Stand' },
  { key: 'living_shelf', category: 'living', itemName: 'Shelf' },
  { key: 'living_fan', category: 'living', itemName: 'Fan' },
  { key: 'living_air_conditioner', category: 'living', itemName: 'Air conditioner' },
  { key: 'kitchen_refrigerator', category: 'kitchen', itemName: 'Refrigerator' },
  { key: 'kitchen_microwave', category: 'kitchen', itemName: 'Microwave' },
  { key: 'kitchen_rice_cooker', category: 'kitchen', itemName: 'Rice cooker' },
  { key: 'kitchen_washing_machine', category: 'kitchen', itemName: 'Washing Machine' },
  { key: 'kitchen_water_dispenser', category: 'kitchen', itemName: 'Water Dispenser' },
  { key: 'kitchen_stove', category: 'kitchen', itemName: 'Stove' },
  { key: 'kitchen_dining_table', category: 'kitchen', itemName: 'Dining table' },
  { key: 'kitchen_dining_chair', category: 'kitchen', itemName: 'Dining chair' },
  { key: 'office_desktop', category: 'office', itemName: 'Desktop Computers' },
  { key: 'office_laptop', category: 'office', itemName: 'Laptop' },
  { key: 'office_printer', category: 'office', itemName: 'Printer' },
  { key: 'office_chair', category: 'office', itemName: 'Office chair' },
  { key: 'office_desk', category: 'office', itemName: 'Office Desk' },
  { key: 'other_bicycles', category: 'other', itemName: 'Bicycles' },
  { key: 'other_motorcycle', category: 'other', itemName: 'Motorcycle' },
  { key: 'other_plants', category: 'other', itemName: 'Plants' },
  { key: 'other_boxes', category: 'other', itemName: 'Boxes' },
]

export const INVENTORY_CATEGORY_ORDER = ['bedroom', 'living', 'kitchen', 'office', 'other'] as const

export type InventoryCategory = (typeof INVENTORY_CATEGORY_ORDER)[number]

export function emptyInventoryCounts(): Record<string, number> {
  return Object.fromEntries(MOVING_INVENTORY_CATALOG.map((item) => [item.key, 0]))
}
