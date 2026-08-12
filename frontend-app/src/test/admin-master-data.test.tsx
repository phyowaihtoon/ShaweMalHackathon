import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AdminMasterDataEntityPage } from '@/features/admin/pages/AdminMasterDataEntityPage'
import { tokenStorage } from '@/lib/auth/token-storage'
import { renderWithProviders } from '@/test/utils'

function createToken() {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      role: 'admin',
      sub: 'admin-1',
    }),
  )
  return `${header}.${payload}.sig`
}

describe('admin master data entity page', () => {
  afterEach(() => {
    tokenStorage.clear()
    vi.unstubAllGlobals()
  })

  it('renders mocked master-data list for an entity', async () => {
    tokenStorage.setAccessToken(createToken())

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/admin/master-data/property-types')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              message: 'Master data list',
              data: {
                items: [
                  { id: 'pt-1', name: 'Condo', isActive: true },
                  { id: 'pt-2', name: 'Apartment', isActive: false },
                ],
              },
            }),
          }
        }
        return {
          ok: false,
          status: 404,
          json: async () => ({ success: false, message: `Unhandled ${url}` }),
        }
      }),
    )

    renderWithProviders(
      <Routes>
        <Route path="/admin/master-data/:entity" element={<AdminMasterDataEntityPage />} />
      </Routes>,
      { initialEntries: ['/admin/master-data/property-types'] },
    )

    expect(await screen.findByRole('heading', { name: /property types/i })).toBeInTheDocument()
    expect(await screen.findByText('Condo')).toBeInTheDocument()
    expect(screen.getByText('Apartment')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^create$/i })).toBeInTheDocument()
  })
})
