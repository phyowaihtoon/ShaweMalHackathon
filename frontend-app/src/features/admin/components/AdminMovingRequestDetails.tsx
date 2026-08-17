import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { resolvePublicUploadUrl } from '@/lib/uploads/resolve-public-url'
import {
  assignedDriverEmail,
  assignedDriverName,
  assignedDriverPhone,
  assignedLicensePlate,
  vehicleLabel,
} from '@/features/moving/lib/moving-status'
import { MovingStatusBookingDetails } from '@/features/moving/components/MovingStatusBookingDetails'
import { MovingStatusCurrentMoveCard } from '@/features/moving/components/MovingStatusCurrentMoveCard'
import { MovingStatusTimeline } from '@/features/moving/components/MovingStatusTimeline'
import type { MovingRequest } from '@/features/moving/types'

function formatDateTime(value?: string | Date | null): string {
  if (!value) return '—'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString()
}

function formatMoney(value?: number | null): string {
  return typeof value === 'number' ? `${value.toLocaleString()} MMK` : '—'
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  const display = value === undefined || value === null || value === '' ? '—' : String(value)

  return (
    <div className="text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{display}</p>
    </div>
  )
}

export function AdminMovingRequestDetails({ request }: { request: MovingRequest }) {
  const { t } = useTranslation()
  const driverName = assignedDriverName(request)
  const driverPhone = assignedDriverPhone(request)
  const driverEmail = assignedDriverEmail(request)
  const plate = assignedLicensePlate(request)

  return (
    <div className="space-y-6">
      <MovingStatusCurrentMoveCard request={request} />
      <MovingStatusTimeline request={request} />
      <MovingStatusBookingDetails request={request} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.movingReport.requesterTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailRow label={t('moving.bookerName')} value={request.requester?.name} />
            <DetailRow label={t('moving.bookerPhone')} value={request.requester?.phone} />
            <DetailRow label={t('moving.bookerEmail')} value={request.requester?.email} />
            <DetailRow label={t('admin.movingReport.requestId')} value={request.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.movingReport.driverTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailRow label={t('moving.statusDriverName')} value={driverName} />
            <DetailRow label={t('auth.phone')} value={driverPhone} />
            <DetailRow label={t('auth.email')} value={driverEmail} />
            <DetailRow label={t('moving.statusLicensePlate')} value={plate} />
            <DetailRow label={t('moving.vehicleType')} value={vehicleLabel(request)} />
            <DetailRow label={t('moving.estimatedEarnings')} value={formatMoney(request.estimatedEarnings)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('admin.movingReport.quoteTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label={t('admin.movingReport.createdAt')} value={formatDateTime(request.createdAt)} />
          <DetailRow label={t('admin.movingReport.updatedAt')} value={formatDateTime(request.updatedAt)} />
          <DetailRow label={t('moving.moveInDate')} value={formatDateTime(request.moveInDate)} />
          <DetailRow label={t('moving.pickupFloor')} value={request.pickupFloorLevel?.name} />
          <DetailRow label={t('moving.dropoffFloor')} value={request.dropoffFloorLevel?.name} />
          <DetailRow
            label={t('moving.distance')}
            value={typeof request.distanceKm === 'number' ? `${request.distanceKm} km` : null}
          />
          <DetailRow label={t('moving.totalInventoryItems')} value={request.totalInventoryPoints} />
          <DetailRow label={t('moving.pricePerKm')} value={formatMoney(request.pricePerKmUsed)} />
          <DetailRow label={t('moving.pickupFloorSurcharge')} value={formatMoney(request.pickupFloorSurcharge)} />
          <DetailRow label={t('moving.dropoffFloorSurcharge')} value={formatMoney(request.dropoffFloorSurcharge)} />
          <DetailRow label={t('moving.estimatedPrice')} value={formatMoney(request.estimatedPrice)} />
          <DetailRow
            label={t('admin.movingReport.coordinates')}
            value={
              request.pickupLatitude != null && request.dropoffLatitude != null
                ? `${request.pickupLatitude}, ${request.pickupLongitude} → ${request.dropoffLatitude}, ${request.dropoffLongitude}`
                : null
            }
          />
          <DetailRow label={t('moving.remarks')} value={request.remarks} />
          <DetailRow label={t('moving.damageChecklist')} value={request.damageChecklist} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('moving.inventoryTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {request.inventoryItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('moving.emptyInventory')}</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {request.inventoryItems.map((item) => (
                <li key={`${item.category}-${item.itemName}`}>
                  [{item.category}] {item.itemName}: {item.count}
                  {typeof item.linePoints === 'number' ? ` (${item.linePoints} pts)` : ''}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('moving.photosTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {request.photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('moving.emptyPhotos')}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {request.photos.map((photo) => {
                const src = resolvePublicUploadUrl(photo.photoPath) ?? photo.photoPath
                return (
                  <li
                    key={photo.id ?? photo.photoPath}
                    className="aspect-[4/3] overflow-hidden rounded-md border border-input bg-muted"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.movingReport.statusHistoryTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!request.statusEvents?.length ? (
              <p className="text-sm text-muted-foreground">{t('admin.movingReport.emptyEvents')}</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {request.statusEvents.map((event) => (
                  <li key={event.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <p className="font-medium">
                      {event.eventType}
                      {event.status
                        ? ` · ${t(`moving.statusBadge.${event.status}`, { defaultValue: event.status })}`
                        : ''}
                    </p>
                    <p className="text-muted-foreground">{formatDateTime(event.createdAt)}</p>
                    {event.notes ? <p>{event.notes}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.movingReport.etaTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!request.etaEntries?.length ? (
              <p className="text-sm text-muted-foreground">{t('admin.movingReport.emptyEta')}</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {request.etaEntries.map((entry) => (
                  <li key={entry.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <p className="font-medium">{entry.stage}</p>
                    <p className="text-muted-foreground">{formatDateTime(entry.etaAt)}</p>
                    {entry.notes ? <p>{entry.notes}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
