import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProtectedDocImage } from '@/components/uploads/ProtectedDocImage'
import { ApiRequestError } from '@/lib/api/client'
import { resolvePublicUploadUrl } from '@/lib/uploads/resolve-public-url'

import { adminApi } from '../api/admin-api'
import type {
  AdminAgentRegistration,
  AdminDriverRegistration,
  AdminSafeUser,
  VerificationAction,
} from '../types'

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

type VerificationFormValues = {
  userId: string
  status: VerificationAction
}

function AgentDocsPreview({ registration }: { registration: AdminAgentRegistration }) {
  const { t } = useTranslation()
  const { user, profile } = registration

  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-sm">
        <span className="font-medium">{user.name}</span>
        <span className="text-muted-foreground"> · {user.verificationStatus}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        {t('agent.nrc')}: {profile.nrc} · {profile.phone}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <ProtectedDocImage path={profile.nrcFrontPhotoPath} label={t('agent.nrcFrontPhotoPath')} />
        <ProtectedDocImage path={profile.nrcBackPhotoPath} label={t('agent.nrcBackPhotoPath')} />
      </div>
    </div>
  )
}

function DriverDocsPreview({ registration }: { registration: AdminDriverRegistration }) {
  const { t } = useTranslation()
  const { user, profile } = registration
  const profileSrc = resolvePublicUploadUrl(profile.profilePhotoPath)

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-start gap-3">
        {profileSrc ? (
          <img
            src={profileSrc}
            alt=""
            className="size-14 rounded-full object-cover border border-input"
          />
        ) : null}
        <div>
          <p className="text-sm">
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground"> · {user.verificationStatus}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {t('driver.nrc')}: {profile.nrc} · {profile.vehicleLicensePlateNumber}
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ProtectedDocImage path={profile.nrcFrontPhotoPath} label={t('driver.nrcFrontPhotoPath')} />
        <ProtectedDocImage path={profile.nrcBackPhotoPath} label={t('driver.nrcBackPhotoPath')} />
        <ProtectedDocImage
          path={profile.drivingLicensePhotoPath}
          label={t('driver.drivingLicensePhotoPath')}
        />
        <ProtectedDocImage path={profile.vehiclePhotoPath} label={t('driver.vehiclePhotoPath')} />
        <ProtectedDocImage path={profile.wheelTaxPhotoPath} label={t('driver.wheelTaxPhotoPath')} />
      </div>
    </div>
  )
}

function VerificationForm({
  title,
  description,
  kind,
  onSubmitAction,
}: {
  title: string
  description: string
  kind: 'agent' | 'driver'
  onSubmitAction: (userId: string, status: VerificationAction) => Promise<AdminSafeUser>
}) {
  const { t } = useTranslation()
  const [formError, setFormError] = useState<string | null>(null)
  const [successUser, setSuccessUser] = useState<AdminSafeUser | null>(null)
  const [lookupUserId, setLookupUserId] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VerificationFormValues>({
    defaultValues: {
      userId: '',
      status: 'approve',
    },
  })

  const typedUserId = watch('userId')

  const registrationQuery = useQuery({
    queryKey: ['admin', kind, 'registration', lookupUserId],
    enabled: Boolean(lookupUserId),
    queryFn: () =>
      kind === 'agent'
        ? adminApi.getAgentRegistration(lookupUserId)
        : adminApi.getDriverRegistration(lookupUserId),
  })

  const onSubmit = handleSubmit(async (values) => {
    const userId = values.userId.trim()
    if (!userId) return

    setFormError(null)
    setSuccessUser(null)

    try {
      const result = await onSubmitAction(userId, values.status)
      setSuccessUser(result)
      reset({ userId: '', status: values.status })
      setLookupUserId('')
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFormError(error.message)
      } else {
        setFormError(t('admin.verifications.actionFailed'))
      }
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor={`${title}-userId`}>{t('admin.verifications.userId')}</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id={`${title}-userId`}
                className="min-w-[12rem] flex-1"
                {...register('userId', { required: t('auth.required') })}
                placeholder={t('admin.verifications.userIdPlaceholder')}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!typedUserId.trim() || registrationQuery.isFetching}
                onClick={() => setLookupUserId(typedUserId.trim())}
              >
                {registrationQuery.isFetching
                  ? t('common.loading')
                  : t('admin.verifications.loadDocs')}
              </Button>
            </div>
            {errors.userId ? (
              <p className="text-sm text-destructive" role="alert">
                {errors.userId.message}
              </p>
            ) : null}
          </div>

          {registrationQuery.isError ? (
            <p className="text-sm text-destructive" role="alert">
              {registrationQuery.error instanceof ApiRequestError
                ? registrationQuery.error.message
                : t('admin.verifications.loadDocsFailed')}
            </p>
          ) : null}

          {registrationQuery.data && kind === 'agent' ? (
            <AgentDocsPreview registration={registrationQuery.data as AdminAgentRegistration} />
          ) : null}
          {registrationQuery.data && kind === 'driver' ? (
            <DriverDocsPreview registration={registrationQuery.data as AdminDriverRegistration} />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`${title}-status`}>{t('admin.verifications.status')}</Label>
            <select id={`${title}-status`} className={selectClassName} {...register('status')}>
              <option value="approve">{t('admin.verifications.statusApprove')}</option>
              <option value="reject">{t('admin.verifications.statusReject')}</option>
              <option value="pending">{t('admin.verifications.statusPending')}</option>
            </select>
          </div>

          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}

          {successUser ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
              {t('admin.verifications.success', {
                name: successUser.name,
                status: successUser.verificationStatus,
              })}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('admin.verifications.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function AdminVerificationsPage() {
  const { t } = useTranslation()

  const countsQuery = useQuery({
    queryKey: ['admin', 'reports', 'overview', 'verifications'],
    queryFn: () => adminApi.getReportsOverview(),
  })

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t('admin.verifications.title')}</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{t('admin.verifications.subtitle')}</p>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t('admin.verifications.queueGap')}</p>
      </div>

      {countsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t('common.loading')}
        </p>
      ) : null}

      {countsQuery.isError ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <p className="text-sm text-muted-foreground">{t('admin.reports.loadError')}</p>
            <Button type="button" variant="outline" onClick={() => void countsQuery.refetch()}>
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {countsQuery.data ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.verifications.agentCounts')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t('admin.reports.cards.verificationHint', {
                pending: countsQuery.data.verification.agents.pending,
                verified: countsQuery.data.verification.agents.verified,
                rejected: countsQuery.data.verification.agents.rejected,
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.verifications.driverCounts')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t('admin.reports.cards.verificationHint', {
                pending: countsQuery.data.verification.drivers.pending,
                verified: countsQuery.data.verification.drivers.verified,
                rejected: countsQuery.data.verification.drivers.rejected,
              })}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <VerificationForm
          title={t('admin.verifications.agentTitle')}
          description={t('admin.verifications.agentDescription')}
          kind="agent"
          onSubmitAction={async (userId, status) => {
            const result = await adminApi.updateAgentVerification(userId, status)
            return result.user
          }}
        />
        <VerificationForm
          title={t('admin.verifications.driverTitle')}
          description={t('admin.verifications.driverDescription')}
          kind="driver"
          onSubmitAction={async (userId, status) => {
            const result = await adminApi.updateDriverVerification(userId, status)
            return result.user
          }}
        />
      </div>
    </section>
  )
}
