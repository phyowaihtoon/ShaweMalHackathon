import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiRequestError } from '@/lib/api/client'

import { adminApi } from '../api/admin-api'
import type { AdminSafeUser, VerificationAction } from '../types'

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

type VerificationFormValues = {
  userId: string
  status: VerificationAction
}

function VerificationForm({
  title,
  description,
  onSubmitAction,
}: {
  title: string
  description: string
  onSubmitAction: (userId: string, status: VerificationAction) => Promise<AdminSafeUser>
}) {
  const { t } = useTranslation()
  const [formError, setFormError] = useState<string | null>(null)
  const [successUser, setSuccessUser] = useState<AdminSafeUser | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VerificationFormValues>({
    defaultValues: {
      userId: '',
      status: 'approve',
    },
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
            <Input
              id={`${title}-userId`}
              {...register('userId', { required: t('auth.required') })}
              placeholder={t('admin.verifications.userIdPlaceholder')}
            />
            {errors.userId ? (
              <p className="text-sm text-destructive" role="alert">
                {errors.userId.message}
              </p>
            ) : null}
          </div>

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
          onSubmitAction={async (userId, status) => {
            const result = await adminApi.updateAgentVerification(userId, status)
            return result.user
          }}
        />
        <VerificationForm
          title={t('admin.verifications.driverTitle')}
          description={t('admin.verifications.driverDescription')}
          onSubmitAction={async (userId, status) => {
            const result = await adminApi.updateDriverVerification(userId, status)
            return result.user
          }}
        />
      </div>
    </section>
  )
}
