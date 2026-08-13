import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import type { HouseLocationMapProps } from './house-location-map-types'

const HouseLocationMapInner = lazy(() => import('./HouseLocationMapInner'))

export type { HouseLocationMapProps }

export function HouseLocationMap(props: HouseLocationMapProps) {
  const { t } = useTranslation()

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
          {t('common.loading')}
        </div>
      }
    >
      <HouseLocationMapInner {...props} />
    </Suspense>
  )
}
