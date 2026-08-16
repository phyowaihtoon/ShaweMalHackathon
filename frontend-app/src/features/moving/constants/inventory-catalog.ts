export const INVENTORY_CATEGORY_ORDER = ['bedroom', 'living', 'kitchen', 'office', 'other'] as const

export type InventoryCategory = (typeof INVENTORY_CATEGORY_ORDER)[number]

export type InventoryCatalogItem = {
  id: string
  code: string
  category: string
  itemName: string
  points: number
}

export function emptyInventoryCounts(items: Array<{ id: string }> = []): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item.id, 0]))
}
