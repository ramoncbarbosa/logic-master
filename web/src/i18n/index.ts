import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import pt from './locales/pt'
import en from './locales/en'
import es from './locales/es'
import fr from './locales/fr'

export const LANGUAGES = [
  { code: 'pt', tag: 'pt-BR', flag: '🇧🇷' },
  { code: 'en', tag: 'en', flag: '🇺🇸' },
  { code: 'es', tag: 'es', flag: '🇪🇸' },
  { code: 'fr', tag: 'fr', flag: '🇫🇷' },
] as const

export type Language = (typeof LANGUAGES)[number]['code']

const STORAGE_KEY = 'lm-lang'
const isLanguage = (v: unknown): v is Language => LANGUAGES.some((l) => l.code === v)

function initialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (isLanguage(stored)) return stored
  const fromBrowser = navigator.languages?.map((l) => l.slice(0, 2).toLowerCase()).find(isLanguage)
  return fromBrowser ?? 'pt'
}

export const languageTag = (code = i18n.language) => LANGUAGES.find((l) => l.code === code)?.tag ?? 'pt-BR'

const applyDocumentLanguage = (code: string) => {
  document.documentElement.lang = languageTag(code)
}

i18n.use(initReactI18next).init({
  resources: { pt: { translation: pt }, en: { translation: en }, es: { translation: es }, fr: { translation: fr } },
  lng: initialLanguage(),
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
  returnNull: false,
})

applyDocumentLanguage(i18n.language)
i18n.on('languageChanged', (code) => {
  localStorage.setItem(STORAGE_KEY, code)
  applyDocumentLanguage(code)
})

export default i18n
