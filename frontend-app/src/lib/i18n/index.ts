import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import my from './locales/my.json'

export const LOCALE_STORAGE_KEY = 'shwemal.locale'
export type AppLocale = 'en' | 'my'

const defaultLocale = (import.meta.env.VITE_DEFAULT_LOCALE as AppLocale | undefined) ?? 'en'

const storedLocale =
  typeof window !== 'undefined'
    ? (localStorage.getItem(LOCALE_STORAGE_KEY) as AppLocale | null)
    : null

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    my: { translation: my },
  },
  lng: storedLocale ?? defaultLocale,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export { i18n }
