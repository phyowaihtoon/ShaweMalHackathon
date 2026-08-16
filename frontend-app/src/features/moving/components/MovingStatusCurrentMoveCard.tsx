import { CalendarClock, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { MovingRequest } from '../types'

export function MovingStatusCurrentMoveCard({ request }: { request: MovingRequest }) {
  const { t } = useTranslation()
  const moveAt = request.moveInDate ? new Date(request.moveInDate) : null

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <CardTitle className="text-lg">{t('moving.statusCurrentMove')}</CardTitle>
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          {t(`moving.statusBadge.${request.status}`, { defaultValue: request.status })}
        </span>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p>
          <span className="text-muted-foreground">{t('moving.orderNumber')}: </span>
          <span className="font-semibold text-primary">{request.orderNumber ?? request.id}</span>
        </p>
        <div className="space-y-3">
          <RouteRow tone="from" label={t('moving.pickupAddress')} value={request.pickupAddress} />
          <RouteRow tone="to" label={t('moving.dropoffAddress')} value={request.dropoffAddress} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <p className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>
              {t('moving.moveInDate')}:{' '}
              <span className="font-medium text-foreground">
                {moveAt
                  ? moveAt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            </span>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>
              {t('moving.moveInTime')}:{' '}
              <span className="font-medium text-foreground">
                {moveAt ? moveAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '—'}
              </span>
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function RouteRow({ tone, label, value }: { tone: 'from' | 'to'; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      {tone === 'from' ? (
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
      ) : (
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
      )}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
