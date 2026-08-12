import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { housesApi } from '@/features/houses/api/houses-api'
import { masterDataApi } from '@/features/master-data/api/master-data-api'
import { ApiRequestError } from '@/lib/api/client'

import { roommatesApi } from '../api/roommates-api'
import {
  defaultRoommatePostFormValues,
  ROOMMATE_HOBBY_FLAGS,
  ROOMMATE_INTEREST_FLAGS,
  validateRoommatePostForm,
  type RoommatePostFormValues,
} from '../schemas/roommate-post-schema'
import type { RoommateGender, RoommateListFilters } from '../types'

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function FindingRoommatesPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<RoommateListFilters>({
    gender: '',
    occupationId: '',
    city: '',
    state: '',
  })
  const [appliedFilters, setAppliedFilters] = useState<RoommateListFilters>({})
  const [showPostForm, setShowPostForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const occupationsQuery = useQuery({
    queryKey: ['master-data', 'occupations'],
    queryFn: () => masterDataApi.list('occupations'),
  })

  const roommatesQuery = useQuery({
    queryKey: ['roommates', appliedFilters],
    queryFn: () => roommatesApi.list(appliedFilters),
  })

  const housesQuery = useQuery({
    queryKey: ['houses', 'roommate-select'],
    enabled: isAuthenticated && showPostForm,
    queryFn: () => housesApi.list({ page: 1, pageSize: 50 }),
  })

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoommatePostFormValues>({
    defaultValues: defaultRoommatePostFormValues(),
  })

  const createMutation = useMutation({
    mutationFn: roommatesApi.create,
    onSuccess: async () => {
      setSuccessMessage(t('roommates.postSuccess'))
      setFormError(null)
      reset(defaultRoommatePostFormValues())
      setShowPostForm(false)
      await queryClient.invalidateQueries({ queryKey: ['roommates'] })
    },
    onError: (error) => {
      setFormError(error instanceof ApiRequestError ? error.message : t('roommates.postFailed'))
    },
  })

  const occupationNameById = useMemo(() => {
    return new Map((occupationsQuery.data?.items ?? []).map((item) => [item.id, item.name]))
  }, [occupationsQuery.data?.items])

  const onPost = handleSubmit(async (values) => {
    const validationErrors = validateRoommatePostForm(values, t)
    const keys = Object.keys(validationErrors) as Array<keyof RoommatePostFormValues>
    if (keys.length > 0) {
      keys.forEach((key) => {
        const message = validationErrors[key]
        if (message) setError(key, { type: 'validate', message })
      })
      return
    }

    setFormError(null)
    setSuccessMessage(null)
    await createMutation.mutateAsync({
      houseId: values.houseId,
      title: values.title.trim(),
      budgetCostSharing: values.budgetCostSharing.trim(),
      gender: values.gender,
      occupationId: values.occupationId,
      isLgbtqFriendly: values.isLgbtqFriendly,
      isCannabisFriendly: values.isCannabisFriendly,
      isSmokingFriendly: values.isSmokingFriendly,
      isNoSmoking: values.isNoSmoking,
      isCatFriendly: values.isCatFriendly,
      isDogFriendly: values.isDogFriendly,
      isAlcoholFriendly: values.isAlcoholFriendly,
      likesNightOut: values.likesNightOut,
      likesHangoutEveryday: values.likesHangoutEveryday,
      hobbyPlayingGame: values.hobbyPlayingGame,
      hobbyWatchingMovies: values.hobbyWatchingMovies,
      hobbySinging: values.hobbySinging,
      hobbyPlayingFootball: values.hobbyPlayingFootball,
      hobbyRunning: values.hobbyRunning,
      hobbyCooking: values.hobbyCooking,
      hobbyReading: values.hobbyReading,
      hobbyFoodie: values.hobbyFoodie,
      hobbyChillWithOthers: values.hobbyChillWithOthers,
      hobbyRelaxSilent: values.hobbyRelaxSilent,
      hobbyPlayingGym: values.hobbyPlayingGym,
    })
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('nav.findingRoommates')}</h1>
          <p className="text-sm text-muted-foreground">{t('roommates.subtitle')}</p>
        </div>
        {isAuthenticated ? (
          <Button type="button" onClick={() => setShowPostForm((value) => !value)}>
            {showPostForm ? t('common.cancel') : t('roommates.postAction')}
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/sign-in">{t('roommates.signInToPost')}</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('roommates.filtersTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault()
              setAppliedFilters({
                gender: (filters.gender || undefined) as RoommateGender | undefined,
                occupationId: filters.occupationId || undefined,
                city: filters.city || undefined,
                state: filters.state || undefined,
              })
            }}
          >
            <Field label={t('roommates.gender')} htmlFor="roommate-filter-gender">
              <select
                id="roommate-filter-gender"
                className={selectClassName}
                value={filters.gender ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, gender: e.target.value as RoommateGender | '' }))}
              >
                <option value="">{t('houses.filters.any')}</option>
                <option value="MALE">{t('roommates.genderMale')}</option>
                <option value="FEMALE">{t('roommates.genderFemale')}</option>
                <option value="ANY">{t('roommates.genderAny')}</option>
              </select>
            </Field>
            <Field label={t('roommates.occupation')}>
              <select
                className={selectClassName}
                value={filters.occupationId ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, occupationId: e.target.value }))}
              >
                <option value="">{t('houses.filters.any')}</option>
                {(occupationsQuery.data?.items ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('houses.filters.city')}>
              <Input
                value={filters.city ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
              />
            </Field>
            <Field label={t('agent.state')}>
              <Input
                value={filters.state ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
              />
            </Field>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit">{t('houses.filters.apply')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showPostForm && isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('roommates.postTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={onPost} noValidate>
              <Field label={t('roommates.house')} error={errors.houseId?.message} className="sm:col-span-2">
                <select className={selectClassName} {...register('houseId')}>
                  <option value="">{t('houses.filters.any')}</option>
                  {(housesQuery.data?.items ?? []).map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('roommates.postTitleField')} error={errors.title?.message} className="sm:col-span-2">
                <Input {...register('title')} />
              </Field>
              <Field label={t('roommates.budget')} error={errors.budgetCostSharing?.message} className="sm:col-span-2">
                <Input {...register('budgetCostSharing')} />
              </Field>
              <Field label={t('roommates.gender')} error={errors.gender?.message}>
                <select className={selectClassName} {...register('gender')}>
                  <option value="MALE">{t('roommates.genderMale')}</option>
                  <option value="FEMALE">{t('roommates.genderFemale')}</option>
                  <option value="ANY">{t('roommates.genderAny')}</option>
                </select>
              </Field>
              <Field label={t('roommates.occupation')} error={errors.occupationId?.message}>
                <select className={selectClassName} {...register('occupationId')}>
                  <option value="">{t('houses.filters.any')}</option>
                  {(occupationsQuery.data?.items ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>

              <fieldset className="space-y-2 sm:col-span-2">
                <legend className="text-sm font-medium">{t('roommates.interests')}</legend>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ROOMMATE_INTEREST_FLAGS.map((flag) => (
                    <label key={flag} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" {...register(flag)} />
                      {t(`roommates.flags.${flag}`)}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-2 sm:col-span-2">
                <legend className="text-sm font-medium">{t('roommates.hobbies')}</legend>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ROOMMATE_HOBBY_FLAGS.map((flag) => (
                    <label key={flag} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" {...register(flag)} />
                      {t(`roommates.flags.${flag}`)}
                    </label>
                  ))}
                </div>
              </fieldset>

              {formError ? <p className="text-sm text-destructive sm:col-span-2">{formError}</p> : null}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                  {isSubmitting || createMutation.isPending ? t('common.loading') : t('roommates.submitPost')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {successMessage ? <p className="text-sm text-primary">{successMessage}</p> : null}

      {roommatesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : null}
      {roommatesQuery.isError ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{t('roommates.loadError')}</p>
          <Button type="button" variant="outline" onClick={() => void roommatesQuery.refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : null}
      {!roommatesQuery.isLoading && !roommatesQuery.isError && (roommatesQuery.data?.items.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">{t('roommates.empty')}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(roommatesQuery.data?.items ?? []).map((item) => {
          const activePrefs = Object.entries(item.preferences ?? {})
            .filter(([, value]) => value)
            .map(([key]) => t(`roommates.flags.${key}`, { defaultValue: key }))
          const activeHobbies = Object.entries(item.hobbies ?? {})
            .filter(([, value]) => value)
            .map(([key]) => t(`roommates.flags.${key}`, { defaultValue: key }))

          return (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {item.user?.name ?? t('home.anonymousReviewer')} · {item.gender}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{item.budgetCostSharing}</p>
                <p className="text-muted-foreground">
                  {item.occupation?.name ??
                    occupationNameById.get(item.occupation?.id ?? '') ??
                    t('roommates.occupationUnknown')}
                </p>
                <p className="text-muted-foreground">
                  {item.house?.title ?? '—'}
                  {item.house?.city?.name ? ` · ${item.house.city.name}` : ''}
                  {item.house?.state?.name ? `, ${item.house.state.name}` : ''}
                </p>
                {activePrefs.length > 0 ? (
                  <p>
                    <span className="font-medium">{t('roommates.interests')}: </span>
                    {activePrefs.join(', ')}
                  </p>
                ) : null}
                {activeHobbies.length > 0 ? (
                  <p>
                    <span className="font-medium">{t('roommates.hobbies')}: </span>
                    {activeHobbies.join(', ')}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  className,
  htmlFor,
  children,
}: {
  label: string
  error?: string
  className?: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
