import { useTranslation } from 'react-i18next'

export default function ConsentText() {
  const { t } = useTranslation()
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      <p>{t('consent.intro')}</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>{t('consent.itemIdentity')}</li>
        <li>{t('consent.itemIp')}</li>
        <li>{t('consent.itemBrowser')}</li>
        <li>{t('consent.itemAnswers')}</li>
        <li>{t('consent.itemRanking')}</li>
      </ul>
      <p>{t('consent.outro')}</p>
    </div>
  )
}
