import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { HouseCard } from '@/features/houses/components/HouseCard'
import { wishlistApi } from '@/features/houses/api/wishlist-api'

export function WishlistPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isBootstrapping } = useAuth()

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      navigate('/sign-in', { replace: true, state: { from: location.pathname } })
    }
  }, [isAuthenticated, isBootstrapping, location.pathname, navigate])

  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    enabled: isAuthenticated,
    queryFn: () => wishlistApi.list(),
  })

  if (isBootstrapping || !isAuthenticated) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  if (wishlistQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  if (wishlistQuery.isError) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{t('profile.wishlistError')}</p>
        <Button type="button" variant="outline" onClick={() => void wishlistQuery.refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  const items = wishlistQuery.data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{t('nav.wishlist')}</h1>
          <p className="text-sm text-muted-foreground">{t('profile.wishlistSubtitle')}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/profile">{t('nav.profile')}</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t('profile.wishlistEmpty')}</p>
          <Button asChild variant="outline">
            <Link to="/finding-house">{t('nav.findingHouse')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <HouseCard key={item.id} house={item.house} />
          ))}
        </div>
      )}
    </div>
  )
}
