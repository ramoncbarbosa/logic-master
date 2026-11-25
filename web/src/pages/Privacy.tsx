import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDocumentTitle } from '@/lib/use-document-title'

export default function Privacy() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useDocumentTitle(t('privacy.title'))

  function goBack() {
    if (window.history.state?.idx > 0) return navigate(-1)
    const referrer = new URL(document.referrer || '/', window.location.origin)
    navigate(referrer.origin === window.location.origin && referrer.pathname !== '/privacidade'
      ? referrer.pathname + referrer.search
      : '/', { replace: true })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button variant="outline" onClick={goBack}>
        <ArrowLeft aria-hidden /> {t('common.back')}
      </Button>
      <h1 className="text-2xl font-bold sm:text-3xl">{t('privacy.title')}</h1>
      <PrivacyContent />
    </div>
  )
}

export function PrivacyContent() {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="space-y-4 text-sm">
        <p>{t('privacy.freeMode')}</p>
        <p>{t('privacy.sus')}</p>
        <p>{t('privacy.hosting')}</p>
        <p>{t('privacy.license')}</p>
        <p>{t('privacy.security')}</p>
      </CardContent>
    </Card>
  )
}
