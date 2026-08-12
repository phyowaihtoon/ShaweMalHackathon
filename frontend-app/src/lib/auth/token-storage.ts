const ACCESS_TOKEN_KEY = 'shwemal.accessToken'
const REFRESH_TOKEN_KEY = 'shwemal.refreshToken'

function read(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key)
}

function write(key: string, value: string, rememberMe: boolean): void {
  const primary = rememberMe ? localStorage : sessionStorage
  const secondary = rememberMe ? sessionStorage : localStorage
  primary.setItem(key, value)
  secondary.removeItem(key)
}

function remove(key: string): void {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return read(ACCESS_TOKEN_KEY)
  },
  setAccessToken(token: string, rememberMe = true): void {
    write(ACCESS_TOKEN_KEY, token, rememberMe)
  },
  getRefreshToken(): string | null {
    return read(REFRESH_TOKEN_KEY)
  },
  setRefreshToken(token: string, rememberMe = true): void {
    write(REFRESH_TOKEN_KEY, token, rememberMe)
  },
  setTokens(accessToken: string, refreshToken?: string, rememberMe = true): void {
    this.setAccessToken(accessToken, rememberMe)
    if (refreshToken) {
      this.setRefreshToken(refreshToken, rememberMe)
    }
  },
  clear(): void {
    remove(ACCESS_TOKEN_KEY)
    remove(REFRESH_TOKEN_KEY)
  },
}
