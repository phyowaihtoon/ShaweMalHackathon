import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AdminMovingRequestDetailPage } from '@/features/admin/pages/AdminMovingRequestDetailPage'
import { AdminMovingRequestReportPage } from '@/features/admin/pages/AdminMovingRequestReportPage'
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

const movingRequest = {
  id: 'moving-1',
  orderNumber: 'MOV-1001',
  status: 'BOOKED',
  pickupAddress: 'Hledan, Yangon',
  dropoffAddress: 'Tamwe, Yangon',
  pickupLatitude: 16.825,
  pickupLongitude: 96.13,
  dropoffLatitude: 16.81,
  dropoffLongitude: 96.177,
  distanceKm: 4.2,
  moveInDate: '2026-09-01T09:00:00.000Z',
  remarks: 'Handle fragile items',
  damageChecklist: 'Small scratch on wardrobe',
  totalInventoryPoints: 44,
  estimatedPrice: 28500,
  pricePerKmUsed: 3200,
  pickupFloorSurcharge: 5000,
  dropoffFloorSurcharge: 10000,
  estimatedEarnings: 18000,
  requester: { id: 'u1', name: 'Pat Requester', email: 'pat@example.com', phone: '091111111' },
  assignedDriver: null,
  vehicleType: { id: 'vt-1', name: '10 ft truck', capacityLabel: '10 ft' },
  pickupFloorLevel: { id: 'f1', name: '1st Floor' },
  dropoffFloorLevel: { id: 'f2', name: '2nd Floor' },
  photos: [{ id: 'p1', photoPath: 'uploads/moving/photo-1.jpg' }],
  inventoryItems: [{ category: 'kitchen', itemName: 'Refrigerator', count: 1, linePoints: 20 }],
  statusEvents: [
    { id: 'e1', eventType: 'CREATED', status: 'BOOKED', notes: null, createdAt: '2026-08-01T00:00:00.000Z' },
  ],
  etaEntries: [],
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
}

function authUserResponse() {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'ok',
      data: { user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', roles: ['admin'] } },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

describe('admin moving request report (FR-ADMIN-008)', () => {
  afterEach(() => {
    tokenStorage.clear()
    vi.unstubAllGlobals()
  })

  it('lists moving requests, applies status filter, and opens full details', async () => {
    tokenStorage.setAccessToken(createToken())

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/auth/verify') || url.includes('/auth/me')) {
        return authUserResponse()
      }
      if (url.includes('/admin/reports/moving')) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'ok',
            data: { items: [movingRequest] },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      if (url.includes('/moving/requests/moving-1')) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'ok',
            data: { movingRequest },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response(JSON.stringify({ success: false, message: `Unhandled ${url}` }), { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/admin/reports/moving" element={<AdminMovingRequestReportPage />} />
        <Route path="/admin/reports/moving/:id" element={<AdminMovingRequestDetailPage />} />
      </Routes>,
      { initialEntries: ['/admin/reports/moving'] },
    )

    expect(await screen.findByRole('heading', { name: /moving service request report/i })).toBeInTheDocument()
    expect(await screen.findByText('MOV-1001')).toBeInTheDocument()
    expect(screen.getByText('Pat Requester')).toBeInTheDocument()
    expect(screen.getByText('Hledan, Yangon')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/request status/i), 'BOOKED')
    await user.click(screen.getByRole('button', { name: /apply filters/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('status=BOOKED'), expect.any(Object))
    })

    await user.click(screen.getByRole('link', { name: /view details/i }))

    expect(await screen.findByRole('heading', { name: /moving request details/i })).toBeInTheDocument()
    expect(screen.getByText('Handle fragile items')).toBeInTheDocument()
    expect(screen.getByText('Small scratch on wardrobe')).toBeInTheDocument()
    expect(screen.getByText(/\[kitchen\] Refrigerator: 1/)).toBeInTheDocument()
    expect(screen.getByText('pat@example.com')).toBeInTheDocument()
    expect(screen.getAllByText(/28,?500 MMK/).length).toBeGreaterThan(0)
  })
})
