import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import type { MovingRouteMapProps } from './moving-route-map-types'

const MovingRouteMapInner = lazy(() => import('./MovingRouteMapInner'))

export type { MovingPinRole, MovingRouteMapProps } from './moving-route-map-types'

export function MovingRouteMap(props: MovingRouteMapProps) {
  const { t } = useTranslation()

  return (
    <Suspense
      fallback={
        <div className="flex h-72 items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
          {t('common.loading')}
        </div>
      }
    >
      <MovingRouteMapInner {...props} />
    </Suspense>
  )
}
