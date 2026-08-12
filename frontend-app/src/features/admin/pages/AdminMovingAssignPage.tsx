import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiRequestError } from '@/lib/api/client'

import { adminApi } from '../api/admin-api'

type AssignFormValues = {
  requestId: string
  driverUserId: string
}

export function AdminMovingAssignPage() {
  const { t } = useTranslation()
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignFormValues>({
    defaultValues: {
      requestId: '',
      driverUserId: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    setSuccessMessage(null)

    try {
      await adminApi.assignMovingRequest(values.requestId.trim(), values.driverUserId.trim())
      setSuccessMessage(t('admin.movingAssign.success'))
      reset()
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFormError(error.message)
      } else {
        setFormError(t('admin.movingAssign.failed'))
      }
    }
  })

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t('admin.movingAssign.title')}</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{t('admin.movingAssign.subtitle')}</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{t('admin.movingAssign.formTitle')}</CardTitle>
          <CardDescription>{t('admin.movingAssign.formDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="requestId">{t('admin.movingAssign.requestId')}</Label>
              <Input
                id="requestId"
                {...register('requestId', { required: t('auth.required') })}
                placeholder={t('admin.movingAssign.requestIdPlaceholder')}
              />
              {errors.requestId ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.requestId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverUserId">{t('admin.movingAssign.driverUserId')}</Label>
              <Input
                id="driverUserId"
                {...register('driverUserId', { required: t('auth.required') })}
                placeholder={t('admin.movingAssign.driverUserIdPlaceholder')}
              />
              {errors.driverUserId ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.driverUserId.message}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
                {successMessage}
              </p>
            ) : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('admin.movingAssign.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
