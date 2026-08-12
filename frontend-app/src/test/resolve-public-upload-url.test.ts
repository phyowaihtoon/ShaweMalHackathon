import { describe, expect, it } from 'vitest'

import { resolvePublicUploadUrl } from '@/lib/uploads/resolve-public-url'

describe('resolvePublicUploadUrl', () => {
  it('returns null for empty values', () => {
    expect(resolvePublicUploadUrl(null)).toBeNull()
    expect(resolvePublicUploadUrl(undefined)).toBeNull()
    expect(resolvePublicUploadUrl('')).toBeNull()
    expect(resolvePublicUploadUrl('   ')).toBeNull()
  })

  it('returns absolute http(s) URLs unchanged', () => {
    expect(resolvePublicUploadUrl('https://cdn.example.com/a.jpg')).toBe(
      'https://cdn.example.com/a.jpg',
    )
    expect(resolvePublicUploadUrl('http://localhost:4000/uploads/houses/a.jpg')).toBe(
      'http://localhost:4000/uploads/houses/a.jpg',
    )
  })

  it('prefixes uploads/ paths with the API origin', () => {
    expect(resolvePublicUploadUrl('uploads/houses/uuid.jpg')).toBe(
      'http://localhost:4000/uploads/houses/uuid.jpg',
    )
  })

  it('returns legacy non-uploads paths as-is', () => {
    expect(resolvePublicUploadUrl('/static/legacy.jpg')).toBe('/static/legacy.jpg')
    expect(resolvePublicUploadUrl('house-1.jpg')).toBe('house-1.jpg')
  })
})
