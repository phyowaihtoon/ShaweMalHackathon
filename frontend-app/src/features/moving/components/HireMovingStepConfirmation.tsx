import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export function HireMovingStepConfirmation({
  orderNumber,
  requestId,
  userName,
  userPhone,
  userEmail,
}: {
  orderNumber: string
  requestId: string
  userName: string
  userPhone?: string | null
  userEmail?: string | null
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-2xl font-semibold tracking-tight">{t('moving.confirmationTitle')}</h2>
      <p className="text-muted-foreground">{t('moving.successMessage')}</p>
      <p>
        <span className="font-medium">{t('moving.orderNumber')}: </span>
        {orderNumber}
      </p>
      <p>
        <span className="font-medium">{t('moving.bookerName')}: </span>
        {userName}
      </p>
      <p>
        <span className="font-medium">{t('moving.bookerPhone')}: </span>
        {userPhone || '—'}
      </p>
      <p>
        <span className="font-medium">{t('moving.bookerEmail')}: </span>
        {userEmail || '—'}
      </p>
      <p className="text-muted-foreground">{t('moving.driverContactNotice')}</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to={`/moving-status/${requestId}`}>{t('moving.trackStatus')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={`/hire-moving/${requestId}`}>{t('moving.viewRequest')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">{t('nav.home')}</Link>
        </Button>
      </div>
    </div>
  )
}
