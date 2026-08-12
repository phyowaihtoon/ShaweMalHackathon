import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { AdminOverviewReport } from '../types'

type ReportSummaryCardsProps = {
  report: AdminOverviewReport
}

export function ReportSummaryCards({ report }: ReportSummaryCardsProps) {
  const { t } = useTranslation()

  const totalUsers = report.userRegistrationsByRole.reduce((sum, row) => sum + row.count, 0)
  const housingTotal =
    report.housing.byAvailability.available + report.housing.byAvailability.notAvailable

  const cards = [
    {
      key: 'users',
      title: t('admin.reports.cards.users'),
      value: totalUsers,
      hint: report.userRegistrationsByRole.map((row) => `${row.role}: ${row.count}`).join(' · ') || '—',
    },
    {
      key: 'agents',
      title: t('admin.reports.cards.agentVerification'),
      value: report.verification.agents.pending,
      hint: t('admin.reports.cards.verificationHint', {
        pending: report.verification.agents.pending,
        verified: report.verification.agents.verified,
        rejected: report.verification.agents.rejected,
      }),
    },
    {
      key: 'drivers',
      title: t('admin.reports.cards.driverVerification'),
      value: report.verification.drivers.pending,
      hint: t('admin.reports.cards.verificationHint', {
        pending: report.verification.drivers.pending,
        verified: report.verification.drivers.verified,
        rejected: report.verification.drivers.rejected,
      }),
    },
    {
      key: 'housing',
      title: t('admin.reports.cards.housing'),
      value: housingTotal,
      hint: t('admin.reports.cards.housingHint', {
        available: report.housing.byAvailability.available,
        notAvailable: report.housing.byAvailability.notAvailable,
      }),
    },
    {
      key: 'moving',
      title: t('admin.reports.cards.moving'),
      value: report.movingRequestSummary.total,
      hint: t('admin.reports.cards.movingHint', {
        completed: report.movingRequestSummary.completed,
        total: report.movingRequestSummary.total,
      }),
    },
    {
      key: 'bookings',
      title: t('admin.reports.cards.bookings'),
      value: report.bookingStatusSummary.reduce((sum, row) => sum + row.count, 0),
      hint:
        report.bookingStatusSummary.map((row) => `${row.status}: ${row.count}`).join(' · ') || '—',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
