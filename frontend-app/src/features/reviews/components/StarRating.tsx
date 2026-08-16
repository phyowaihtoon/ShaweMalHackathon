import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  labelledBy,
}: {
  value: number
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md'
  labelledBy?: string
}) {
  const { t } = useTranslation()
  const iconClass = size === 'sm' ? 'size-4' : 'size-6'

  if (readOnly) {
    return (
      <div
        className="inline-flex items-center gap-0.5"
        aria-label={t('reviews.starValue', { rating: value })}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            aria-hidden="true"
            className={cn(
              iconClass,
              star <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = star === value
        const filled = star <= value

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={t('reviews.starLabel', { count: star })}
            className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => onChange?.(star)}
          >
            <Star
              aria-hidden="true"
              className={cn(iconClass, filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')}
            />
          </button>
        )
      })}
    </div>
  )
}
