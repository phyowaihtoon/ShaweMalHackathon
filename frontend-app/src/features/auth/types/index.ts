export type AuthUser = {
  id: string
  name: string
  email: string
  phone?: string | null
  roles: string[]
  verificationStatus?: string
  isActive?: boolean
}

export type AuthTokens = {
  accessToken: string
  refreshToken?: string
  user?: AuthUser
}

export type LoginInput = {
  email: string
  password: string
  rememberMe?: boolean
}

export type RegisterInput = {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}
