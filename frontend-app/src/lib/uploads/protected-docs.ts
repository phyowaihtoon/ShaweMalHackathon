import { API_BASE_URL } from '@/lib/api/client'
import { tokenStorage } from '@/lib/auth/token-storage'

/** Build authenticated URL path for a stored docs relative path. */
export function getProtectedDocsApiPath(relativePath: string): string | null {
  const trimmed = relativePath.trim()
  if (!trimmed.startsWith('uploads/docs/')) return null
  const filename = trimmed.slice('uploads/docs/'.length)
  if (!filename || filename.includes('/') || filename.includes('..')) return null
  return `/files/docs/${encodeURIComponent(filename)}`
}

/**
 * Fetches a protected docs image with Bearer auth and returns an object URL.
 * Caller must revoke the URL when done.
 */
export async function fetchProtectedDocObjectUrl(relativePath: string): Promise<string> {
  const apiPath = getProtectedDocsApiPath(relativePath)
  if (!apiPath) {
    throw new Error('Invalid docs path')
  }

  const headers = new Headers()
  const token = tokenStorage.getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${apiPath}`, { headers })
  if (!response.ok) {
    throw new Error(`Failed to load document (${response.status})`)
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}
