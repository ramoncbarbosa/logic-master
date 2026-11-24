import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AccessibilityMenu from './AccessibilityMenu'
import GitHubLink from './GitHubLink'
import LanguageSwitcher from './LanguageSwitcher'
import LicenseLink from './LicenseLink'
import MobileMenu from './MobileMenu'
import { cn } from '@/lib/utils'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
    isActive && 'bg-accent font-medium text-accent-foreground',
  )

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-8 place-items-center rounded-lg bg-primary text-lg font-bold leading-none text-primary-foreground shadow-sm shadow-primary/30',
        className,
      )}
    >
      ∧
    </span>
  )
}

export default function Layout() {
  const { t } = useTranslation()
  return (
    <div className="app-bg flex min-h-dvh flex-col overflow-x-clip">
      <a href="#conteudo" className="skip-link">
        {t('nav.skip')}
      </a>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-auto flex min-w-0 items-center gap-2.5 font-semibold tracking-tight" aria-label={t('nav.home')}>
            <LogoMark className="shrink-0" />
            <span className="truncate">Logic Master</span>
          </Link>
          <nav aria-label={t('nav.main')} className="hidden items-center gap-1 sm:flex">
            <NavLink to="/" end className={navClass}>
              {t('nav.quizzes')}
            </NavLink>
            <NavLink to="/admin" className={navClass}>
              {t('nav.teacher')}
            </NavLink>
          </nav>
          <div className="hidden items-center gap-2 sm:flex">
            <LicenseLink />
            <GitHubLink />
          </div>
          <LanguageSwitcher />
          <AccessibilityMenu />
          <div className="sm:hidden">
            <MobileMenu />
          </div>
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
