import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { masterDataApi } from '@/features/master-data/api/master-data-api'
import { ApiRequestError } from '@/lib/api/client'

import { movingApi } from '../api/moving-api'
import {
  emptyInventoryCounts,
  INVENTORY_CATEGORY_ORDER,
  MOVING_INVENTORY_CATALOG,
} from '../constants/inventory-catalog'
import {
  buildInventoryItems,
  collectPhotoPaths,
  validateMovingRequestForm,
  type MovingRequestFormValues,
} from '../schemas/moving-request-schema'

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const textareaClassName =
  'flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function HireMovingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isBootstrapping } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null)

  const bookingId = searchParams.get('bookingId') ?? undefined
  const houseId = searchParams.get('houseId') ?? undefined

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      navigate('/sign-in', {
        replace: true,
        state: { from: `${location.pathname}${location.search}` },
      })
    }
  }, [isAuthenticated, isBootstrapping, location.pathname, location.search, navigate])

  const vehiclesQuery = useQuery({
    queryKey: ['master-data', 'vehicle-types'],
    enabled: isAuthenticated,
    queryFn: () => masterDataApi.list('vehicle-types'),
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<MovingRequestFormValues>({
    defaultValues: {
      pickupAddress: '',
      dropoffAddress: '',
      moveInDate: '',
      vehicleTypeId: '',
      remarks: '',
      damageChecklist: '',
      photo1: '',
      photo2: '',
      photo3: '',
      photo4: '',
      photo5: '',
      inventoryCounts: emptyInventoryCounts(),
    },
  })

  const inventoryCounts = watch('inventoryCounts')

  const catalogByCategory = useMemo(() => {
    return INVENTORY_CATEGORY_ORDER.map((category) => ({
      category,
      items: MOVING_INVENTORY_CATALOG.filter((item) => item.category === category),
    }))
  }, [])

  const onSubmit = handleSubmit(async (values) => {
    clearErrors()
    const validationErrors = validateMovingRequestForm(values, t)
    const keys = Object.keys(validationErrors) as Array<keyof typeof validationErrors>
    if (keys.length > 0) {
      keys.forEach((key) => {
        const message = validationErrors[key]
        if (!message) return
        if (key === 'photos' || key === 'inventoryCounts') {
          setError(key === 'photos' ? 'photo1' : 'inventoryCounts', {
            type: 'validate',
            message,
          })
          return
        }
        setError(key as keyof MovingRequestFormValues, { type: 'validate', message })
      })
      return
    }

    setFormError(null)
    setCreatedRequestId(null)

    try {
      const result = await movingApi.create({
        pickupAddress: values.pickupAddress.trim(),
        dropoffAddress: values.dropoffAddress.trim(),
        moveInDate: new Date(values.moveInDate).toISOString(),
        vehicleTypeId: values.vehicleTypeId,
        remarks: values.remarks.trim() || undefined,
        damageChecklist: values.damageChecklist.trim() || undefined,
        photos: collectPhotoPaths(values),
        inventoryItems: buildInventoryItems(values.inventoryCounts),
      })
      setCreatedRequestId(result.movingRequest.id)
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFormError(error.message)
        return
      }
      setFormError(t('moving.submitFailed'))
    }
  })

  if (isBootstrapping || !isAuthenticated) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  if (createdRequestId) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl">{t('moving.successTitle')}</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('moving.successMessage')}</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to={`/hire-moving/${createdRequestId}`}>{t('moving.viewRequest')}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">{t('nav.home')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>
          <h1 className="text-2xl">{t('nav.hireMoving')}</h1>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t('moving.subtitle')}</p>
        {(bookingId || houseId) && (
          <p className="text-xs text-muted-foreground">
            {t('moving.bookingContext', {
              bookingId: bookingId ?? '—',
              houseId: houseId ?? '—',
            })}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('moving.pickupAddress')} error={errors.pickupAddress?.message} className="sm:col-span-2">
              <Input {...register('pickupAddress')} />
            </Field>
            <Field label={t('moving.dropoffAddress')} error={errors.dropoffAddress?.message} className="sm:col-span-2">
              <Input {...register('dropoffAddress')} />
            </Field>
            <Field label={t('moving.moveInDate')} error={errors.moveInDate?.message}>
              <Input type="date" {...register('moveInDate')} />
            </Field>
            <Field label={t('moving.vehicleType')} error={errors.vehicleTypeId?.message}>
              <select className={selectClassName} {...register('vehicleTypeId')}>
                <option value="">{t('houses.filters.any')}</option>
                {(vehiclesQuery.data?.items ?? []).map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('moving.damageChecklist')} error={errors.damageChecklist?.message} className="sm:col-span-2">
              <textarea className={textareaClassName} {...register('damageChecklist')} />
            </Field>
            <Field label={t('moving.remarks')} error={errors.remarks?.message} className="sm:col-span-2">
              <textarea className={textareaClassName} {...register('remarks')} />
            </Field>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">{t('moving.photosTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('moving.photosHint')}</p>
            {errors.photo1?.message ? <p className="text-sm text-destructive">{errors.photo1.message}</p> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {(['photo1', 'photo2', 'photo3', 'photo4', 'photo5'] as const).map((field, index) => (
                <Field key={field} label={t('moving.photoN', { n: index + 1 })}>
                  <Input placeholder={t('agent.pathPlaceholder')} {...register(field)} />
                </Field>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">{t('moving.inventoryTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('moving.inventoryHint')}</p>
              {typeof errors.inventoryCounts?.message === 'string' ? (
                <p className="mt-1 text-sm text-destructive">{errors.inventoryCounts.message}</p>
              ) : null}
            </div>
            {catalogByCategory.map(({ category, items }) => (
              <div key={category} className="space-y-2 rounded-md border p-4">
                <h3 className="font-medium">{t(`moving.categories.${category}`)}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <label key={item.key} className="flex items-center justify-between gap-2 text-sm">
                      <span>{item.itemName}</span>
                      <Input
                        type="number"
                        min={0}
                        className="w-20"
                        value={inventoryCounts[item.key] ?? 0}
                        onChange={(event) => {
                          const next = Math.max(0, Number(event.target.value) || 0)
                          setValue(`inventoryCounts.${item.key}`, next, { shouldDirty: true })
                        }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isSubmitting || vehiclesQuery.isLoading}>
              {isSubmitting ? t('common.loading') : t('moving.submit')}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link to="/">{t('nav.home')}</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
