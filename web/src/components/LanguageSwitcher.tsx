import { useTranslation } from 'react-i18next'
import { Check, Languages } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { LANGUAGES } from '@/i18n'

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={`${t('nav.language')}: ${t(`languages.${current.code}`)}`}>
          <Languages aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t('nav.language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.code} lang={l.tag} onSelect={() => i18n.changeLanguage(l.code)}>
            <span aria-hidden>{l.flag}</span>
            <span className="flex-1">{t(`languages.${l.code}`)}</span>
            {l.code === current.code && <Check className="text-primary" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
