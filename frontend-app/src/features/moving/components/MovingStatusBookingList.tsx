import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

import { isActiveMovingStatus } from '../lib/moving-status'
import type { MovingRequest } from '../types'

export function MovingStatusBookingList({ items }: { items: MovingRequest[] }) {
  const { t } = useTranslation()
  const active = items.filter((item) => isActiveMovingStatus(item.status))
  const past = items.filter((item) => !isActiveMovingStatus(item.status))

  return (
    <section className="space-y-4" aria-label={t('moving.statusBookingsLabel')}>
      <BookingGroup title={t('moving.statusActiveGroup')} items={active} empty={t('moving.statusNoActive')} />
      {past.length > 0 ? <BookingGroup title={t('moving.statusPastGroup')} items={past} /> : null}
    </section>
  )
}

function BookingGroup({
  title,
  items,
  empty,
}: {
  title: string
  items: MovingRequest[]
  empty?: string
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {items.length === 0 && empty ? <p className="text-sm text-muted-foreground">{empty}</p> : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <article className="flex h-full flex-col rounded-xl border p-4 text-sm">
              <p className="font-semibold text-primary">{item.orderNumber ?? item.id}</p>
              <p className="mt-1 text-muted-foreground">
                {item.pickupAddress} → {item.dropoffAddress}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(`moving.statusBadge.${item.status}`, { defaultValue: item.status })}
                {item.moveInDate
                  ? ` · ${new Date(item.moveInDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : null}
              </p>
              <Button asChild className="mt-4 w-fit" size="sm">
                <Link to={`/moving-status/${item.id}`}>{t('moving.statusCheckStatus')}</Link>
              </Button>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
