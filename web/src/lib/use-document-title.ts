import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function useDocumentTitle(page?: string | null) {
  const { t } = useTranslation()
  useEffect(() => {
    document.title = page ? t('meta.page', { page }) : t('meta.home')
  }, [page, t])
}
