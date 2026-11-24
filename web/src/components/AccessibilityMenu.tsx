import { useTranslation } from 'react-i18next'
import { Accessibility, Contrast, Minus, Moon, Plus, Volume2 } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { usePreferences } from '@/lib/preferences'

export default function AccessibilityMenu() {
  const { t } = useTranslation()
  const p = usePreferences()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t('a11y.menu')}>
          <Accessibility aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>{t('a11y.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            p.update({ fontScale: Math.min(1.5, +(p.fontScale + 0.125).toFixed(3)) })
          }}
        >
          <Plus aria-hidden /> {t('a11y.increase')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            p.update({ fontScale: Math.max(0.875, +(p.fontScale - 0.125).toFixed(3)) })
          }}
        >
          <Minus aria-hidden /> {t('a11y.decrease')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={p.dark} onCheckedChange={(v) => p.update({ dark: !!v })}>
          <Moon aria-hidden /> {t('a11y.dark')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={p.highContrast} onCheckedChange={(v) => p.update({ highContrast: !!v })}>
          <Contrast aria-hidden /> {t('a11y.contrast')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={p.sound} onCheckedChange={(v) => p.update({ sound: !!v })}>
          <Volume2 aria-hidden /> {t('a11y.sound')}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
