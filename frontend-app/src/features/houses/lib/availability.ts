export function isHouseAvailable(availability?: string | null): boolean {
  const value = availability?.trim().toLowerCase().replace(/\s+/g, '_')
  return value !== 'not_available'
}
