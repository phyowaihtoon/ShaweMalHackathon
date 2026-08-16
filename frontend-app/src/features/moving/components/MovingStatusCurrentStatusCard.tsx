import { useState } from 'react'
import { Phone, Shield, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  assignedDriverPhone,
  latestEtaForStage,
  remainingMinutes,
  timelineIndexForStatus,
  MOVING_TIMELINE_STEPS,
} from '../lib/moving-status'
import type { MovingRequest } from '../types'
import { MovingStatusDriverDetailsDialog } from './MovingStatusDriverDetailsDialog'
import { MovingStatusRateDriverDialog } from './MovingStatusRateDriverDialog'

export function MovingStatusCurrentStatusCard({ request }: { request: MovingRequest }) {
  const { t } = useTranslation()
  const [driverDetailsOpen, setDriverDetailsOpen] = useState(false)
  const [rateDriverOpen, setRateDriverOpen] = useState(false)
  const stepIndex = timelineIndexForStatus(request.status)
  const step = stepIndex >= 0 ? MOVING_TIMELINE_STEPS[stepIndex] : null
  const etaAt = latestEtaForStage(request.etaEntries, step?.etaStage ?? null)
  const minutes = etaAt ? remainingMinutes(etaAt) : null
  const phone = assignedDriverPhone(request)
  const isCancelled = request.status === 'CANCELLED'
  const canRateDriver = request.status === 'COMPLETED' && Boolean(request.assignedDriver)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{t('moving.statusCurrentTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Truck className="h-7 w-7" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">
            {isCancelled
              ? t('moving.statusBadge.CANCELLED')
              : t(`moving.statusStep.${step?.id ?? 'booking_confirmed'}.title`)}
          </h3>
          {etaAt ? (
            <p className="mt-1 text-sm font-medium text-primary">
              {minutes
                ? t('moving.statusEtaMinutes', { minutes })
                : t('moving.statusEtaAt', {
                    time: new Date(etaAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
                  })}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-muted-foreground">
            {isCancelled
              ? t('moving.statusCancelledBody')
              : t(`moving.statusStep.${step?.id ?? 'booking_confirmed'}.detail`)}
          </p>
        </div>
        {!isCancelled ? (
          <div className="flex items-start gap-2 rounded-lg bg-primary/10 p-3 text-sm">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p>{t(`moving.statusStep.${step?.id ?? 'booking_confirmed'}.alert`)}</p>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {phone ? (
            <Button asChild>
              <a href={`tel:${phone.replace(/\s+/g, '')}`}>
                <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('moving.contactDriver')}
              </a>
            </Button>
          ) : (
            <Button type="button" disabled>
              <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('moving.contactDriver')}
            </Button>
          )}
          {request.assignedDriver ? (
            <Button type="button" variant="outline" onClick={() => setDriverDetailsOpen(true)}>
              {t('moving.statusDriverDetails')}
            </Button>
          ) : null}
          {canRateDriver ? (
            <Button type="button" variant="outline" onClick={() => setRateDriverOpen(true)}>
              {request.myReview ? t('moving.statusUpdateDriverRating') : t('moving.statusRateDriver')}
            </Button>
          ) : null}
        </div>
      </CardContent>
      {request.assignedDriver ? (
        <MovingStatusDriverDetailsDialog
          open={driverDetailsOpen}
          request={request}
          onDismiss={() => setDriverDetailsOpen(false)}
        />
      ) : null}
      {canRateDriver ? (
        <MovingStatusRateDriverDialog
          open={rateDriverOpen}
          request={request}
          onDismiss={() => setRateDriverOpen(false)}
        />
      ) : null}
    </Card>
  )
}
