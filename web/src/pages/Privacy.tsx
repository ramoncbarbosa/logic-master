import { useTranslation } from 'react-i18next'
import ConsentText from '@/components/ConsentText'
import { Card, CardContent } from '@/components/ui/card'
import { useDocumentTitle } from '@/lib/use-document-title'

export default function Privacy() {
  const { t } = useTranslation()
  useDocumentTitle(t('privacy.title'))
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold sm:text-3xl">{t('privacy.title')}</h1>
      <Card>
        <CardContent className="space-y-4">
          <ConsentText />
          <p className="text-sm">{t('privacy.security')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
