import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SingleImageUploadField } from '@/components/uploads/SingleImageUploadField'
import { ApiRequestError } from '@/lib/api/client'
import { resolvePublicUploadUrl } from '@/lib/uploads/resolve-public-url'

import { profileApi, reviewsApi } from '../api/profile-api'

type ProfileFormValues = {
  name: string
  phone: string
  profilePicturePath: string
}

type PasswordFormValues = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

type ReviewFormValues = {
  targetType: 'AGENT' | 'DRIVER'
  targetUserId: string
  rating: string
  comment: string
}

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { isAuthenticated, isBootstrapping, user } = useAuth()
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [reviewMessage, setReviewMessage] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      navigate('/sign-in', { replace: true, state: { from: location.pathname } })
    }
  }, [isAuthenticated, isBootstrapping, location.pathname, navigate])

  const profileQuery = useQuery({
    queryKey: ['profile'],
    enabled: isAuthenticated,
    queryFn: () => profileApi.get(),
  })

  const profileForm = useForm<ProfileFormValues>({
    values: {
      name: profileQuery.data?.user.name ?? user?.name ?? '',
      phone: profileQuery.data?.user.phone ?? user?.phone ?? '',
      profilePicturePath: profileQuery.data?.user.profilePicturePath ?? '',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const reviewForm = useForm<ReviewFormValues>({
    defaultValues: {
      targetType: 'AGENT',
      targetUserId: '',
      rating: '5',
      comment: '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: async () => {
      setProfileMessage(t('profile.updateSuccess'))
      setProfileError(null)
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
    onError: (error) => {
      setProfileError(error instanceof ApiRequestError ? error.message : t('profile.updateFailed'))
    },
  })

  const passwordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      setPasswordMessage(t('profile.passwordSuccess'))
      setPasswordError(null)
      passwordForm.reset()
    },
    onError: (error) => {
      setPasswordError(error instanceof ApiRequestError ? error.message : t('profile.passwordFailed'))
    },
  })

  const reviewMutation = useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: () => {
      setReviewMessage(t('profile.reviewSuccess'))
      setReviewError(null)
      reviewForm.reset({ targetType: 'AGENT', targetUserId: '', rating: '5', comment: '' })
    },
    onError: (error) => {
      setReviewError(error instanceof ApiRequestError ? error.message : t('profile.reviewFailed'))
    },
  })

  if (isBootstrapping || !isAuthenticated) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  if (profileQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  if (profileQuery.isError || !profileQuery.data?.user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{t('profile.loadError')}</p>
        <Button type="button" variant="outline" onClick={() => void profileQuery.refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  const profile = profileQuery.data.user

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('nav.profile')}</h1>
        <p className="text-sm text-muted-foreground">{t('profile.subtitle')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/profile/wishlist">{t('nav.wishlist')}</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/profile/history">{t('nav.history')}</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/driver-register">{t('nav.driverRegister')}</Link>
          </Button>
          {profile.roles.includes('driver') ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/driver/jobs">{t('nav.driverJobs')}</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('profile.accountTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {(() => {
            const avatarSrc = resolvePublicUploadUrl(profile.profilePicturePath)
            return avatarSrc ? (
              <img
                src={avatarSrc}
                alt=""
                className="size-20 rounded-full border border-input object-cover"
              />
            ) : null
          })()}
          <p>
            <span className="font-medium">{t('auth.email')}: </span>
            {profile.email}
          </p>
          <p>
            <span className="font-medium">{t('profile.roles')}: </span>
            {profile.roles.join(', ') || '—'}
          </p>
          <p>
            <span className="font-medium">{t('profile.verification')}: </span>
            {profile.verificationStatus ?? '—'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('profile.editTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={profileForm.handleSubmit(async (values) => {
              setProfileMessage(null)
              setProfileError(null)
              if (!values.name.trim() || !values.phone.trim()) {
                setProfileError(t('auth.required'))
                return
              }
              await updateMutation.mutateAsync({
                name: values.name.trim(),
                phone: values.phone.trim(),
                profilePicturePath: values.profilePicturePath.trim() || null,
              })
            })}
            noValidate
          >
            <input type="hidden" {...profileForm.register('profilePicturePath')} />
            <Field label={t('auth.name')}>
              <Input {...profileForm.register('name')} />
            </Field>
            <Field label={t('auth.phone')}>
              <Input {...profileForm.register('phone')} />
            </Field>
            <Field label={t('profile.profilePicturePath')}>
              <SingleImageUploadField
                path={profileForm.watch('profilePicturePath')}
                onChange={(nextPath) => {
                  profileForm.setValue('profilePicturePath', nextPath, {
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                  if (nextPath.trim()) {
                    profileForm.clearErrors('profilePicturePath')
                  }
                }}
                category="profile"
              />
            </Field>
            {profileError ? <p className="text-sm text-destructive">{profileError}</p> : null}
            {profileMessage ? <p className="text-sm text-primary">{profileMessage}</p> : null}
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('common.loading') : t('profile.saveProfile')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('profile.passwordTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={passwordForm.handleSubmit(async (values) => {
              setPasswordMessage(null)
              setPasswordError(null)
              if (!values.currentPassword || !values.newPassword || !values.confirmNewPassword) {
                setPasswordError(t('auth.required'))
                return
              }
              if (values.newPassword.length < 8) {
                setPasswordError(t('auth.minPassword'))
                return
              }
              if (values.newPassword !== values.confirmNewPassword) {
                setPasswordError(t('auth.passwordMismatch'))
                return
              }
              await passwordMutation.mutateAsync(values)
            })}
            noValidate
          >
            <Field label={t('profile.currentPassword')}>
              <Input type="password" {...passwordForm.register('currentPassword')} />
            </Field>
            <Field label={t('profile.newPassword')}>
              <Input type="password" {...passwordForm.register('newPassword')} />
            </Field>
            <Field label={t('profile.confirmNewPassword')}>
              <Input type="password" {...passwordForm.register('confirmNewPassword')} />
            </Field>
            {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
            {passwordMessage ? <p className="text-sm text-primary">{passwordMessage}</p> : null}
            <Button type="submit" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? t('common.loading') : t('profile.changePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('profile.reviewTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={reviewForm.handleSubmit(async (values) => {
              setReviewMessage(null)
              setReviewError(null)
              if (!values.targetUserId.trim()) {
                setReviewError(t('auth.required'))
                return
              }
              const rating = Number(values.rating)
              if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                setReviewError(t('profile.ratingInvalid'))
                return
              }
              await reviewMutation.mutateAsync({
                targetType: values.targetType,
                targetUserId: values.targetUserId.trim(),
                rating,
                comment: values.comment.trim() || undefined,
              })
            })}
            noValidate
          >
            <Field label={t('profile.reviewTargetType')}>
              <select className={selectClassName} {...reviewForm.register('targetType')}>
                <option value="AGENT">{t('profile.targetAgent')}</option>
                <option value="DRIVER">{t('profile.targetDriver')}</option>
              </select>
            </Field>
            <Field label={t('profile.reviewRating')}>
              <select className={selectClassName} {...reviewForm.register('rating')}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={String(value)}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('profile.reviewTargetUserId')} className="sm:col-span-2">
              <Input {...reviewForm.register('targetUserId')} />
            </Field>
            <Field label={t('profile.reviewComment')} className="sm:col-span-2">
              <Input {...reviewForm.register('comment')} />
            </Field>
            {reviewError ? <p className="text-sm text-destructive sm:col-span-2">{reviewError}</p> : null}
            {reviewMessage ? <p className="text-sm text-primary sm:col-span-2">{reviewMessage}</p> : null}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={reviewMutation.isPending}>
                {reviewMutation.isPending ? t('common.loading') : t('profile.submitReview')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}
