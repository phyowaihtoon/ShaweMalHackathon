import { tokenStorage } from '@/lib/auth/token-storage'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

export type ApiSuccess<T> = {
  success: true
  message: string
  data: T
}

export type ApiFailure = {
  success: false
  message: string
  code?: string
  errors?: unknown
}

export class ApiRequestError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  auth?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false) {
    const token = tokenStorage.getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null

  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.()
    }

    const message =
      payload && 'message' in payload && payload.message
        ? payload.message
        : `Request failed with status ${response.status}`
    const code = payload && 'code' in payload ? payload.code : undefined
    throw new ApiRequestError(message, response.status, code, payload)
  }

  if (payload && 'data' in payload) {
    return payload.data
  }

  return payload as T
}
