import { API_BASE_URL } from '@/lib/api/client'

/** Origin used for public static uploads (strips `/api/v1` from the API base URL). */
export function getUploadApiOrigin(): string {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '')
}

/**
 * Maps a stored upload path (or absolute URL) to a browser-loadable URL.
 * - Absolute http(s) URLs are returned as-is
 * - Paths starting with `uploads/` are prefixed with the API origin
 * - Other values are returned unchanged (legacy placeholders)
 */
export function resolvePublicUploadUrl(path: string | null | undefined): string | null {
  if (path == null) return null
  const trimmed = path.trim()
  if (!trimmed) return null

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (trimmed.startsWith('uploads/')) {
    return `${getUploadApiOrigin()}/${trimmed}`
  }

  return trimmed
}
