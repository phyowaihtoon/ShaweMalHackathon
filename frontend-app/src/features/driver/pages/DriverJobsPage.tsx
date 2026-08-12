import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { movingApi } from '@/features/moving/api/moving-api'
import { ApiRequestError } from '@/lib/api/client'

import { driverJobsApi, type DriverStatusInput } from '../api/driver-api'

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function DriverJobsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { isAuthenticated, isBootstrapping, user } = useAuth()
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [etaStage, setEtaStage] = useState('pickup')
  const [etaAt, setEtaAt] = useState('')
  const [etaNotes, setEtaNotes] = useState('')
  const [status, setStatus] = useState<DriverStatusInput['status']>('in_progress')
  const [statusNotes, setStatusNotes] = useState('')

  const isDriver = Boolean(user?.roles?.includes('driver'))

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      navigate('/sign-in', { replace: true, state: { from: location.pathname } })
    }
  }, [isAuthenticated, isBootstrapping, location.pathname, navigate])

  const availableQuery = useQuery({
    queryKey: ['driver-requests-available'],
    enabled: isAuthenticated && isDriver && !id,
    queryFn: () => driverJobsApi.listAvailable(),
  })

  const detailQuery = useQuery({
    queryKey: ['moving-request', id],
    enabled: isAuthenticated && isDriver && Boolean(id),
    queryFn: () => movingApi.getById(id!),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['driver-requests-available'] })
    if (id) await queryClient.invalidateQueries({ queryKey: ['moving-request', id] })
  }

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => driverJobsApi.accept(requestId),
    onSuccess: async (result) => {
      setActionSuccess(t('driver.acceptSuccess'))
      setActionError(null)
      await invalidate()
      navigate(`/driver/jobs/${result.movingRequest.id}`)
    },
    onError: (error) => {
      setActionError(error instanceof ApiRequestError ? error.message : t('driver.actionFailed'))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => driverJobsApi.reject(requestId),
    onSuccess: async () => {
      setActionSuccess(t('driver.rejectSuccess'))
      setActionError(null)
      await invalidate()
      if (id) navigate('/driver/jobs')
    },
    onError: (error) => {
      setActionError(error instanceof ApiRequestError ? error.message : t('driver.actionFailed'))
    },
  })

  const etaMutation = useMutation({
    mutationFn: () =>
      driverJobsApi.addEta(id!, {
        stage: etaStage.trim(),
        etaAt: new Date(etaAt).toISOString(),
        notes: etaNotes.trim() || undefined,
      }),
    onSuccess: async () => {
      setActionSuccess(t('driver.etaSuccess'))
      setActionError(null)
      await invalidate()
    },
    onError: (error) => {
      setActionError(error instanceof ApiRequestError ? error.message : t('driver.actionFailed'))
    },
  })

  const statusMutation = useMutation({
    mutationFn: () =>
      driverJobsApi.updateStatus(id!, {
        status,
        notes: statusNotes.trim() || undefined,
      }),
    onSuccess: async () => {
      setActionSuccess(t('driver.statusSuccess'))
      setActionError(null)
      await invalidate()
    },
    onError: (error) => {
      setActionError(error instanceof ApiRequestError ? error.message : t('driver.actionFailed'))
    },
  })

  if (isBootstrapping || !isAuthenticated) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
  }

  if (!isDriver) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl">{t('driver.jobsTitle')}</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t('driver.roleRequired')}</p>
          <Button asChild variant="outline">
            <Link to="/driver-register">{t('nav.driverRegister')}</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (id) {
    if (detailQuery.isLoading) {
      return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
    }
    if (detailQuery.isError || !detailQuery.data?.movingRequest) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{t('driver.detailError')}</p>
          <Button type="button" variant="outline" onClick={() => void detailQuery.refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      )
    }

    const request = detailQuery.data.movingRequest
    const isAssignedToMe = request.assignedDriver?.id === user?.id
    const canRespond = request.status === 'PENDING' && !request.assignedDriver

    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl">{t('driver.jobDetailTitle')}</h1>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('moving.statusLabel')}: {request.status}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            <span className="font-medium">{t('moving.pickupAddress')}: </span>
            {request.pickupAddress}
          </p>
          <p>
            <span className="font-medium">{t('moving.dropoffAddress')}: </span>
            {request.dropoffAddress}
          </p>
          <p>
            <span className="font-medium">{t('moving.estimatedEarnings')}: </span>
            {request.estimatedEarnings ?? '—'}
          </p>
          <p>
            <span className="font-medium">{t('driver.customerName')}: </span>
            {request.requester?.name ?? '—'}
          </p>
          <p>
            <span className="font-medium">{t('driver.customerPhone')}: </span>
            {request.requester?.phone ?? '—'}
          </p>
          <p>
            <span className="font-medium">{t('moving.damageChecklist')}: </span>
            {request.damageChecklist ?? '—'}
          </p>
          <div>
            <p className="font-medium">{t('moving.photosTitle')}</p>
            <ul className="mt-1 list-disc pl-5">
              {request.photos.map((photo) => (
                <li key={photo.id ?? photo.photoPath}>{photo.photoPath}</li>
              ))}
            </ul>
          </div>

          {canRespond ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={acceptMutation.isPending}
                onClick={() => acceptMutation.mutate(request.id)}
              >
                {t('driver.accept')}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={rejectMutation.isPending}
                onClick={() => rejectMutation.mutate(request.id)}
              >
                {t('driver.reject')}
              </Button>
            </div>
          ) : null}

          {isAssignedToMe ? (
            <div className="grid gap-4 rounded-md border p-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <h2 className="font-medium">{t('driver.etaSection')}</h2>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eta-stage">{t('driver.etaStage')}</Label>
                <Input id="eta-stage" value={etaStage} onChange={(e) => setEtaStage(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eta-at">{t('driver.etaAt')}</Label>
                <Input
                  id="eta-at"
                  type="datetime-local"
                  value={etaAt}
                  onChange={(e) => setEtaAt(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="eta-notes">{t('driver.notes')}</Label>
                <Input id="eta-notes" value={etaNotes} onChange={(e) => setEtaNotes(e.target.value)} />
              </div>
              <Button
                type="button"
                disabled={!etaStage.trim() || !etaAt || etaMutation.isPending}
                onClick={() => etaMutation.mutate()}
              >
                {t('driver.saveEta')}
              </Button>

              <div className="space-y-2 sm:col-span-2">
                <h2 className="font-medium">{t('driver.statusSection')}</h2>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-status">{t('moving.statusLabel')}</Label>
                <select
                  id="job-status"
                  className={selectClassName}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DriverStatusInput['status'])}
                >
                  <option value="in_progress">{t('driver.statusInProgress')}</option>
                  <option value="completed">{t('driver.statusCompleted')}</option>
                  <option value="cancelled">{t('driver.statusCancelled')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-notes">{t('driver.notes')}</Label>
                <Input
                  id="status-notes"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
              </div>
              <Button
                type="button"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate()}
              >
                {t('driver.updateStatus')}
              </Button>
            </div>
          ) : null}

          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          {actionSuccess ? <p className="text-sm text-primary">{actionSuccess}</p> : null}

          <Button asChild variant="outline">
            <Link to="/driver/jobs">{t('driver.backToJobs')}</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('driver.jobsTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('driver.jobsSubtitle')}</p>
      </div>

      {availableQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : null}
      {availableQuery.isError ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{t('driver.listError')}</p>
          <Button type="button" variant="outline" onClick={() => void availableQuery.refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : null}
      {!availableQuery.isLoading && !availableQuery.isError && (availableQuery.data?.items.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">{t('driver.emptyJobs')}</p>
      ) : null}

      <div className="grid gap-3">
        {(availableQuery.data?.items ?? []).map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {item.pickupAddress} → {item.dropoffAddress}
                </p>
                <p className="text-muted-foreground">
                  {t('moving.estimatedEarnings')}: {item.estimatedEarnings ?? '—'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/driver/jobs/${item.id}`}>{t('driver.viewJob')}</Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={acceptMutation.isPending}
                  onClick={() => acceptMutation.mutate(item.id)}
                >
                  {t('driver.accept')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate(item.id)}
                >
                  {t('driver.reject')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      {actionSuccess ? <p className="text-sm text-primary">{actionSuccess}</p> : null}
    </div>
  )
}
