import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import type { ReactElement, ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router'

import { AuthProvider } from '@/app/providers/AuthProvider'
import { i18n } from '@/lib/i18n'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

type ProvidersProps = {
  children: ReactNode
  initialEntries?: string[]
}

function Providers({ children, initialEntries = ['/'] }: ProvidersProps) {
  const queryClient = createTestQueryClient()

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] },
) {
  const { initialEntries, ...renderOptions } = options ?? {}
  return render(ui, {
    wrapper: ({ children }) => <Providers initialEntries={initialEntries}>{children}</Providers>,
    ...renderOptions,
  })
}
