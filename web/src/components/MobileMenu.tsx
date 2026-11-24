import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ExternalLink, GraduationCap, ListChecks, Menu } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { REPOSITORY_URL } from './GitHubLink'
import { LICENSE_URL } from './LicenseLink'
import { cn } from '@/lib/utils'

export default function MobileMenu() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const active = 'bg-accent font-medium text-accent-foreground'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t('nav.openMenu')}>
          <Menu aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem asChild className={cn(!isAdmin && active)}>
          <Link to="/">
            <ListChecks aria-hidden /> {t('nav.quizzes')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={cn(isAdmin && active)}>
          <Link to="/admin">
            <GraduationCap aria-hidden /> {t('nav.teacherArea')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden /> {t('nav.source')}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={LICENSE_URL} target="_blank" rel="license noopener noreferrer">
            <ExternalLink aria-hidden /> {t('nav.license')}
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
