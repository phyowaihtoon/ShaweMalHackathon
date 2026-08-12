export type JwtPayload = {
  exp?: number
  iat?: number
  sub?: string
  role?: string
  [key: string]: unknown
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  return atob(padded)
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) {
      return null
    }
    const payload = JSON.parse(decodeBase64Url(parts[1])) as JwtPayload
    return payload
  } catch {
    return null
  }
}

export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeJwt(token)
  if (!payload?.exp) {
    return true
  }
  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now + skewSeconds
}
