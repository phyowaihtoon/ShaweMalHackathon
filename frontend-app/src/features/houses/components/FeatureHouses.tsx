import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { homeApi } from '@/features/home/api/home-api'

import { HouseCard } from './HouseCard'

const FEATURED_PAGE_SIZE = 3

export function FeatureHouses() {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)

  const featuredQuery = useQuery({
    queryKey: ['home'],
    queryFn: () => homeApi.getContent(),
  })

  if (featuredQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  if (featuredQuery.isError) {
    return (
      <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{t('home.loadError')}</p>
        <Button type="button" variant="outline" onClick={() => void featuredQuery.refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  const featuredHouses = featuredQuery.data?.featuredHouses ?? []
  const totalPages = Math.max(1, Math.ceil(featuredHouses.length / FEATURED_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const visibleHouses = featuredHouses.slice(
    currentPage * FEATURED_PAGE_SIZE,
    currentPage * FEATURED_PAGE_SIZE + FEATURED_PAGE_SIZE,
  )
  const showPager = featuredHouses.length > FEATURED_PAGE_SIZE

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('home.featuredTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('home.featuredSubtitle')}</p>
        </div>
        {showPager ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={currentPage <= 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              {t('common.previous')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            >
              {t('common.next')}
            </Button>
          </div>
        ) : null}
      </div>
      {featuredHouses.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">{t('home.emptyFeatured')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {visibleHouses.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>
      )}
    </section>
  )
}
