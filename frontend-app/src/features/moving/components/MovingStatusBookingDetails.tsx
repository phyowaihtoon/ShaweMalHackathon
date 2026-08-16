import { Car, Hash, Phone, User, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  assignedDriverName,
  assignedDriverPhone,
  assignedLicensePlate,
  vehicleLabel,
} from '../lib/moving-status'
import type { MovingRequest } from '../types'

export function MovingStatusBookingDetails({ request }: { request: MovingRequest }) {
  const { t } = useTranslation()
  const driverName = assignedDriverName(request)
  const phone = assignedDriverPhone(request)
  const plate = assignedLicensePlate(request)
  const points =
    typeof request.totalInventoryPoints === 'number' ? `${request.totalInventoryPoints} pts` : '—'
  const price =
    typeof request.estimatedPrice === 'number' ? `${request.estimatedPrice.toLocaleString()} MMK` : '—'

  const rows = [
    { icon: Car, label: t('moving.vehicleType'), value: vehicleLabel(request) },
    { icon: Hash, label: t('moving.statusItemsVolume'), value: points },
    { icon: Wallet, label: t('moving.estimatedPrice'), value: price },
    { icon: User, label: t('moving.statusDriverName'), value: driverName ?? '—' },
    { icon: Phone, label: t('moving.bookerPhone'), value: phone ?? '—' },
    { icon: Car, label: t('moving.statusLicensePlate'), value: plate ?? '—' },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{t('moving.statusBookingDetails')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3 text-sm">
            <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-muted-foreground">{row.label}</p>
              <p className="font-medium">{row.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
