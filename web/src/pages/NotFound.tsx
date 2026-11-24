import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/lib/use-document-title'

export default function NotFound() {
  const { t } = useTranslation()
  useDocumentTitle(t('notFound.title'))
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-3xl font-bold">{t('notFound.title')}</h1>
      <p className="text-muted-foreground">{t('notFound.text')}</p>
      <Button asChild>
        <Link to="/">{t('notFound.back')}</Link>
      </Button>
    </div>
  )
}
