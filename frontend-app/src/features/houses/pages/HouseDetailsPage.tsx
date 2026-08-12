import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiRequestError } from '@/lib/api/client'
import { resolvePublicUploadUrl } from '@/lib/uploads/resolve-public-url'

import { housesApi } from '../api/houses-api'
import { MovingUpsellDialog } from '../components/MovingUpsellDialog'
import { useWishlist } from '../hooks/useWishlist'

function formatFees(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value)
}

export function HouseDetailsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { wishlistedIds, add, remove, isToggling } = useWishlist()
  const [upsellOpen, setUpsellOpen] = useState(false)
  const [bookingId, setBookingId] = useState<string | undefined>()
  const [bookError, setBookError] = useState<string | null>(null)

  const detailsQuery = useQuery({
    queryKey: ['houses', id],
    enabled: Boolean(id),
    queryFn: () => housesApi.getById(id),
  })

  const bookMutation = useMutation({
    mutationFn: () => housesApi.book(id),
    onSuccess: (result) => {
      setBookError(null)
      setBookingId(result.booking.id)
      if (result.promptMovingService) {
        setUpsellOpen(true)
      }
    },
    onError: (error) => {
      if (error instanceof ApiRequestError) {
        setBookError(error.message)
        return
      }
      setBookError(t('houses.bookFailed'))
    },
  })

  const house = detailsQuery.data?.item
  const isWishlisted = Boolean(house && wishlistedIds.has(house.id))

  const onBook = () => {
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: `/houses/${id}` } })
      return
    }
    setBookError(null)
    void bookMutation.mutateAsync()
  }

  const onToggleWishlist = async () => {
    if (!house) return
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: `/houses/${id}`, authPrompt: 'wishlist' } })
      return
    }
    if (isWishlisted) {
      await remove(house.id)
      return
    }
    await add(house.id)
  }

  if (detailsQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  if (detailsQuery.isError || !house) {
    return (
      <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{t('houses.detailsError')}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void detailsQuery.refetch()}>
            {t('common.retry')}
          </Button>
          <Button asChild variant="secondary">
            <Link to="/finding-house">{t('houses.backToList')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link to="/finding-house" className="underline-offset-4 hover:underline">
              {t('houses.backToList')}
            </Link>
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{house.title}</h1>
          <p className="mt-1 text-muted-foreground">
            {[house.location.city?.name, house.location.state?.name, house.propertyType?.name]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={isToggling} onClick={() => void onToggleWishlist()}>
            {isWishlisted ? t('houses.removeWishlist') : t('houses.addWishlist')}
          </Button>
          <Button type="button" disabled={bookMutation.isPending} onClick={onBook}>
            {bookMutation.isPending ? t('common.loading') : t('houses.bookNow')}
          </Button>
        </div>
      </div>

      {bookError ? <p className="text-sm text-destructive">{bookError}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {house.images.length > 0 ? (
          house.images.map((image) => {
            const src = resolvePublicUploadUrl(image.imagePath) ?? image.imagePath
            return (
              <div key={image.id ?? image.imagePath} className="aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                <img src={src} alt={house.title} className="h-full w-full object-cover" />
              </div>
            )
          })
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
            {t('houses.noPhoto')}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('houses.details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="whitespace-pre-wrap text-muted-foreground">
              {house.description?.trim() || t('houses.noDescription')}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="font-medium">{t('houses.monthlyFeesLabel')}: </span>
                {formatFees(house.monthlyFees)}
              </p>
              <p>
                <span className="font-medium">{t('houses.depositLabel')}: </span>
                {formatFees(house.depositAmount)}
              </p>
              <p>
                <span className="font-medium">{t('houses.bedrooms')}: </span>
                {house.bedrooms}
              </p>
              <p>
                <span className="font-medium">{t('houses.bathrooms')}: </span>
                {house.bathrooms}
              </p>
              {house.areaSize ? (
                <p>
                  <span className="font-medium">{t('houses.areaSize')}: </span>
                  {house.areaSize}
                </p>
              ) : null}
              {house.contractType?.name ? (
                <p>
                  <span className="font-medium">{t('houses.contractType')}: </span>
                  {house.contractType.name}
                </p>
              ) : null}
            </div>
            {house.amenities.length > 0 ? (
              <div>
                <p className="mb-2 font-medium">{t('houses.amenities')}</p>
                <ul className="flex flex-wrap gap-2">
                  {house.amenities.map((amenity) => (
                    <li key={amenity.id} className="rounded-md bg-muted px-2 py-1 text-xs">
                      {amenity.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {house.location.nearbyPlaces ? (
              <p>
                <span className="font-medium">{t('houses.nearbyPlaces')}: </span>
                {house.location.nearbyPlaces}
              </p>
            ) : null}
            {house.houseRules ? (
              <p className="whitespace-pre-wrap">
                <span className="font-medium">{t('houses.houseRules')}: </span>
                {house.houseRules}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('houses.agentDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{house.agent.name}</p>
            {house.agent.phone ? <p>{house.agent.phone}</p> : null}
            {house.agent.email ? <p>{house.agent.email}</p> : null}
            {house.contact.phone ? (
              <p>
                <span className="font-medium">{t('houses.contactPhone')}: </span>
                {house.contact.phone}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <MovingUpsellDialog
        open={upsellOpen}
        bookingId={bookingId}
        houseId={house.id}
        onYes={() => {
          setUpsellOpen(false)
          const params = new URLSearchParams()
          if (bookingId) params.set('bookingId', bookingId)
          params.set('houseId', house.id)
          navigate(`/hire-moving?${params.toString()}`)
        }}
        onNo={() => setUpsellOpen(false)}
      />
    </section>
  )
}
