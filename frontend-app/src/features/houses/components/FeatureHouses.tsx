import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { homeApi } from '@/features/home/api/home-api'

import { HouseCard } from './HouseCard'

export function FeatureHouses() {
  const { t } = useTranslation()

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

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t('home.featuredTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('home.featuredSubtitle')}</p>
      </div>
      {featuredHouses.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">{t('home.emptyFeatured')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredHouses.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>
      )}
    </section>
  )
}
