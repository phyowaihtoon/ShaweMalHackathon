import { useQuery } from '@tanstack/react-query'
import { type FormEvent, type ReactNode, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HouseCard } from '@/features/houses/components/HouseCard'

import { homeApi } from '../api/home-api'

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const homeQuery = useQuery({
    queryKey: ['home'],
    queryFn: () => homeApi.getContent(),
  })

  const onSearch = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('city', query.trim())
    navigate(`/finding-house?${params.toString()}`)
  }

  return (
    <section className="space-y-10">
      <div className="space-y-4 rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('home.heroTitle')}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t('home.heroSubtitle')}</p>
        </div>
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSearch}>
          <label className="sr-only" htmlFor="home-search">
            {t('home.searchLabel')}
          </label>
          <Input
            id="home-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="bg-background"
          />
          <Button type="submit">{t('home.searchAction')}</Button>
        </form>
      </div>

      {homeQuery.isLoading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : null}

      {homeQuery.isError ? (
        <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{t('home.loadError')}</p>
          <Button type="button" variant="outline" onClick={() => void homeQuery.refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : null}

      {homeQuery.data ? (
        <>
          <HomeSection title={t('home.featuredTitle')} subtitle={t('home.featuredSubtitle')}>
            {homeQuery.data.featuredHouses.length === 0 ? (
              <EmptyHint text={t('home.emptyFeatured')} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {homeQuery.data.featuredHouses.map((house) => (
                  <HouseCard key={house.id} house={house} />
                ))}
              </div>
            )}
          </HomeSection>

          <HomeSection title={t('home.popularTitle')} subtitle={t('home.popularSubtitle')}>
            {homeQuery.data.popularRecommended.length === 0 ? (
              <EmptyHint text={t('home.emptyPopular')} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {homeQuery.data.popularRecommended.map((house) => (
                  <HouseCard key={house.id} house={house} />
                ))}
              </div>
            )}
          </HomeSection>

          <HomeSection title={t('home.newsTitle')}>
            {homeQuery.data.newsUpdates.length === 0 ? (
              <EmptyHint text={t('home.emptyNews')} />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {homeQuery.data.newsUpdates.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </HomeSection>

          <HomeSection title={t('home.agentsTitle')}>
            {homeQuery.data.verifiedAgents.length === 0 ? (
              <EmptyHint text={t('home.emptyAgents')} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {homeQuery.data.verifiedAgents.map((agent) => (
                  <Card key={agent.id}>
                    <CardContent className="space-y-1 p-4">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {agent.agentProfile?.city?.name ?? t('houses.locationUnknown')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </HomeSection>

          <HomeSection title={t('home.movingPartnersTitle')}>
            {homeQuery.data.partnerMovingServices.length === 0 ? (
              <EmptyHint text={t('home.emptyMoving')} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {homeQuery.data.partnerMovingServices.map((partner) => (
                  <Card key={partner.id}>
                    <CardContent className="space-y-1 p-4">
                      <p className="font-medium">{partner.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {partner.driverProfile?.companyName ||
                          partner.driverProfile?.vehicleType?.name ||
                          t('home.movingPartnerFallback')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </HomeSection>

          <HomeSection title={t('home.reviewsTitle')}>
            {homeQuery.data.serviceReviews.length === 0 ? (
              <EmptyHint text={t('home.emptyReviews')} />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {homeQuery.data.serviceReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="space-y-2 p-4">
                      <p className="text-sm font-medium">
                        {t('home.reviewRating', { rating: review.rating })}
                        {review.targetUser?.name ? ` · ${review.targetUser.name}` : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {review.comment?.trim() || t('home.reviewNoComment')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.reviewer?.name ?? t('home.anonymousReviewer')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </HomeSection>

          <div className="rounded-xl border p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('home.browseHint')}</p>
            <Button asChild className="mt-3">
              <Link to="/finding-house">{t('nav.findingHouse')}</Link>
            </Button>
          </div>
        </>
      ) : null}
    </section>
  )
}

function HomeSection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

function EmptyHint({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">{text}</p>
}
