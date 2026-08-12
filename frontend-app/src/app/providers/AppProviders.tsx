import type { ReactNode } from 'react'

import { AuthProvider } from './AuthProvider'
import { I18nProvider } from './I18nProvider'
import { QueryProvider } from './QueryProvider'
import { RouterProvider } from './RouterProvider'
import { ThemeProvider } from './ThemeProvider'

type AppProvidersProps = {
  children?: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryProvider>
          <AuthProvider>
            <RouterProvider>{children}</RouterProvider>
          </AuthProvider>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
