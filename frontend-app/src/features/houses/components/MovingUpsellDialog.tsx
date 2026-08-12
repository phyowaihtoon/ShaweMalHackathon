import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type MovingUpsellDialogProps = {
  open: boolean
  bookingId?: string
  houseId?: string
  onYes: () => void
  onNo: () => void
}

export function MovingUpsellDialog({ open, bookingId, houseId, onYes, onNo }: MovingUpsellDialogProps) {
  const { t } = useTranslation()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="moving-upsell-title"
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>
            <h2 id="moving-upsell-title" className="text-xl">
              {t('houses.movingUpsell.title')}
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('houses.movingUpsell.message')}</p>
          {(bookingId || houseId) && (
            <p className="text-xs text-muted-foreground">
              {t('houses.movingUpsell.context', {
                bookingId: bookingId ?? '—',
                houseId: houseId ?? '—',
              })}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onNo}>
              {t('houses.movingUpsell.no')}
            </Button>
            <Button type="button" onClick={onYes}>
              {t('houses.movingUpsell.yes')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
