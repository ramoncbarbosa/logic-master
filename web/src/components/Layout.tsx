import { Link, NavLink, Outlet } from 'react-router-dom'
import AccessibilityMenu from './AccessibilityMenu'
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
  return (
    <div className="app-bg flex min-h-dvh flex-col">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-auto flex items-center gap-2.5 font-semibold tracking-tight" aria-label="Logic Master — página inicial">
            <LogoMark />
            <span>Logic Master</span>
          </Link>
          <nav aria-label="Navegação principal" className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Quizzes
            </NavLink>
            <NavLink to="/admin" className={navClass}>
              Professor
            </NavLink>
          </nav>
          <AccessibilityMenu />
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
