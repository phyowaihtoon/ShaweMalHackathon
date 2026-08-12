import { apiRequest } from '@/lib/api/client'

import type { AuthTokens, AuthUser, LoginInput, RegisterInput } from '../types'

export const authApi = {
  register(input: RegisterInput) {
    return apiRequest<AuthTokens>('/auth/register', {
      method: 'POST',
      body: input,
      auth: false,
    })
  },
  login(input: LoginInput) {
    return apiRequest<AuthTokens>('/auth/login', {
      method: 'POST',
      body: input,
      auth: false,
    })
  },
  verify() {
    return apiRequest<{ user: AuthUser }>('/auth/verify')
  },
  me() {
    return apiRequest<{ user: AuthUser }>('/auth/me')
  },
  refresh(refreshToken: string) {
    return apiRequest<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    })
  },
  logout(refreshToken: string) {
    return apiRequest<{ ok: boolean }>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    })
  },
}
