import { Check, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import {
  eventTimestampForStatuses,
  latestEtaForStage,
  MOVING_TIMELINE_STEPS,
  timelineStepState,
} from '../lib/moving-status'
import type { MovingRequest } from '../types'

export function MovingStatusTimeline({ request }: { request: MovingRequest }) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('moving.statusProgressTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-0">
          {MOVING_TIMELINE_STEPS.map((step, index) => {
            const state = timelineStepState(index, request.status, request.statusEvents)
            const timestamp = eventTimestampForStatuses(request.statusEvents, step.statuses)
            const etaAt = latestEtaForStage(request.etaEntries, step.etaStage)

            return (
              <li key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      state === 'complete' && 'bg-primary text-primary-foreground',
                      state === 'current' && 'bg-primary text-primary-foreground ring-4 ring-primary/25',
                      state === 'pending' && 'border-2 border-border bg-background text-muted-foreground',
                    )}
                    aria-current={state === 'current' ? 'step' : undefined}
                  >
                    {state === 'complete' ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                    ) : state === 'current' && step.id === 'driver_coming' ? (
                      <Truck className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {index < MOVING_TIMELINE_STEPS.length - 1 ? (
                    <span
                      className={cn('w-0.5 flex-1 min-h-8', state === 'complete' ? 'bg-primary' : 'bg-border')}
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <div className={cn('pb-6', index === MOVING_TIMELINE_STEPS.length - 1 && 'pb-0')}>
                  <p className={cn('font-semibold', state === 'pending' && 'text-muted-foreground')}>
                    {t(`moving.statusStep.${step.id}.title`)}
                  </p>
                  <p className="text-sm text-muted-foreground">{t(`moving.statusStep.${step.id}.body`)}</p>
                  {timestamp ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(timestamp).toLocaleString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  ) : null}
                  {state === 'current' && etaAt ? (
                    <p className="mt-1 text-xs font-medium text-primary">
                      {t('moving.statusEtaAt', {
                        time: new Date(etaAt).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        }),
                      })}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
