import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pt-br'

export default function LicenseLink() {
  const { t } = useTranslation()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" asChild>
          <a
            href={LICENSE_URL}
            target="_blank"
            rel="license noopener noreferrer"
            aria-label={t('nav.licenseAria')}
          >
            <svg viewBox="0 0 16 16" aria-hidden className="size-4 fill-none stroke-current" strokeWidth={1.4} strokeLinecap="round">
              <circle cx="8" cy="8" r="7.1" />
              <path d="M7.05 6.55a2.05 2.05 0 1 0 0 2.9" />
              <path d="M11.55 6.55a2.05 2.05 0 1 0 0 2.9" />
            </svg>
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('nav.license')}</TooltipContent>
    </Tooltip>
  )
}
