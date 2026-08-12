import { NavLink, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/app/providers/AuthProvider'
import { LanguageToggle } from '@/components/common/LanguageToggle'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Separator } from '@/components/ui/separator'
import { NotificationsMenu } from '@/features/notifications/components/NotificationsMenu'
import { UserMenu } from '@/features/public/components/UserMenu'
import { cn } from '@/lib/utils'

const guestTopLinks = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/about-us', labelKey: 'nav.aboutUs' },
  { to: '/agent-register', labelKey: 'nav.agentRegister' },
  { to: '/sign-up', labelKey: 'nav.signUp' },
  { to: '/sign-in', labelKey: 'nav.signIn' },
] as const

const authTopLinks = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/about-us', labelKey: 'nav.aboutUs' },
  { to: '/agent-register', labelKey: 'nav.agentRegister' },
] as const

const subLinks = [
  { to: '/finding-house', labelKey: 'nav.findingHouse' },
  { to: '/hire-moving', labelKey: 'nav.hireMoving' },
  { to: '/finding-roommates', labelKey: 'nav.findingRoommates' },
] as const

function NavItem({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent text-accent-foreground font-medium',
        )
      }
    >
      {label}
    </NavLink>
  )
}

export function PublicLayout() {
  const { t } = useTranslation()
  const { isAuthenticated, isBootstrapping } = useAuth()
  const topLinks = isAuthenticated ? authTopLinks : guestTopLinks

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              SM
            </div>
            <span className="text-lg font-semibold tracking-tight">{t('common.appName')}</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {topLinks.map((link) => (
              <NavItem key={link.to} to={link.to} label={t(link.labelKey)} end={'end' in link ? link.end : false} />
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {!isBootstrapping && isAuthenticated ? (
              <>
                <NotificationsMenu />
                <UserMenu />
              </>
            ) : null}
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <Separator />
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {subLinks.map((link) => (
            <NavItem key={link.to} to={link.to} label={t(link.labelKey)} />
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
